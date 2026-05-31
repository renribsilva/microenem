"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

import styles from "./tables.module.css";
import { useHomeData } from "../../../../../../context/home_context";
import { useYearData } from "../../../../../../context/year_context";
import Dropdown from "../../../../../../components/tsx/dropdown";
import clsx from "clsx";
import { useSidebar } from "../../../../../../context/sidebar_context";
import Sort from "../../../../../../components/svg/sort";
import { useChartTheme } from "../../../../../../hooks/use_chart_theme";

type TableRow = {
  id: number;
  posicao: number;
  respondentes: number;
  freq_acerto: string;
  freq_erro: string;
  freq_branco: string;
  freq_dupla_marcacao: string;
  abandonado: boolean;
  param_b: number;
};

export default function ScoreTable() {
  const { selectedLabel, deferredArea } = useHomeData();
  const { tabColor } = useChartTheme();
  const { isMobile } = useSidebar();
  const {
    respostaAoItemData,
    getCodeByLabel,
    getParamByLabel,
    abandonadosCodes,
    lastItemActivate,
    setLastItemActivate,
    setLastItemActivateNum,
    setItemGraphData,
    setAcertosData,
  } = useYearData();

  const scoreData = respostaAoItemData.scoreData;

  const [sorting, setSorting] = useState<SortingState>([
    { id: "posicao", desc: false },
  ]);

  const columnHelper = createColumnHelper<TableRow>();

  const columns = useMemo(() => {
    // Definimos as sub-colunas de Identificação
    const idCols = [
      columnHelper.accessor("posicao", {
        header: "Item",
        cell: (info) => <strong>{info.getValue()}</strong>,
      }),
      // Só inclui Código se não for mobile
      ...(!isMobile
        ? [
            columnHelper.accessor("id", {
              header: "Código",
              cell: (info) => (
                <span style={{ fontSize: "0.85rem", color: "#888" }}>
                  {info.getValue() || "—"}
                </span>
              ),
            }),
          ]
        : []),
      // Só inclui Abandonado se não for mobile
      ...(!isMobile
        ? [
            columnHelper.accessor("abandonado", {
              header: "Anulado",
              cell: (info) => {
                const val = info.getValue();
                return (
                  <span
                    style={{
                      fontSize: "0.85rem",
                      color: val ? "#ff4b4b" : "#888",
                    }}
                  >
                    {val ? "Sim" : "Não"}
                  </span>
                );
              },
            }),
          ]
        : []),
    ];

    // Definimos as sub-colunas de Score
    const scoreCols = [
      columnHelper.accessor("respondentes", {
        header: "n",
        cell: (info) => {
          if (info.row.original.abandonado)
            return <span style={{ color: "#ccc" }}>—</span>;

          const val = info.getValue();
          const compactFormatter = new Intl.NumberFormat("pt-BR", {
            notation: "compact",
            compactDisplay: "short",
            maximumFractionDigits: 1,
          });

          return (
            <span style={{ fontSize: "0.8rem", color: "#888" }}>
              {isMobile
                ? compactFormatter.format(val).toLowerCase()
                : val.toLocaleString("pt-BR")}
            </span>
          );
        },
      }),
      columnHelper.accessor("freq_acerto", {
        header: "Certa",
        cell: (info) =>
          info.row.original.abandonado ? (
            <span style={{ color: "#ccc" }}>—</span>
          ) : (
            <span
              style={{
                fontSize: "0.85rem",
                color: "#52c41a",
                fontWeight: "500",
              }}
            >
              {info.getValue()}%
            </span>
          ),
      }),
      columnHelper.accessor("freq_erro", {
        header: "Errada",
        cell: (info) =>
          info.row.original.abandonado ? (
            <span style={{ color: "#ccc" }}>—</span>
          ) : (
            <span
              style={{
                fontSize: "0.85rem",
                color: "#ff4b4b",
                fontWeight: "500",
              }}
            >
              {info.getValue()}%
            </span>
          ),
      }),
      ...(!isMobile
        ? [
            columnHelper.accessor("freq_branco", {
              header: "Branco",
              cell: (info) =>
                info.row.original.abandonado ? (
                  <span style={{ color: "#ccc" }}>—</span>
                ) : (
                  <span style={{ color: "#888" }}>{info.getValue()}%</span>
                ),
            }),
            columnHelper.accessor("freq_dupla_marcacao", {
              header: "Dupla",
              cell: (info) =>
                info.row.original.abandonado ? (
                  <span style={{ color: "#ccc" }}>—</span>
                ) : (
                  <span style={{ color: "#888" }}>{info.getValue()}%</span>
                ),
            }),
          ]
        : []),
    ];

    return [
      columnHelper.group({
        id: "identificacao_grupo",
        header: isMobile ? "Item" : "Identificação",
        columns: idCols,
      }),
      columnHelper.group({
        id: "score_grupo",
        header: isMobile ? "Resposta" : "Frequência de Resposta",
        columns: scoreCols,
      }),
    ];
  }, [columnHelper, isMobile]);

  const data = useMemo(() => {
    const ranges: Record<string, { start: number; end: number }> = {
      LC: { start: 1, end: 45 },
      CH: { start: 46, end: 90 },
      CN: { start: 91, end: 135 },
      MT: { start: 136, end: 180 },
    };

    const { start, end } = ranges[deferredArea] || { start: 1, end: 45 };

    // Gera o range e mapeia os dados
    return Array.from({ length: end - start + 1 }, (_, i) => {
      const num = start + i;
      const code = getCodeByLabel(num, selectedLabel);
      const param = getParamByLabel(num, selectedLabel, "b");
      const itemScores = scoreData && code ? scoreData[code]?.counts || {} : {};

      const v1 = Number(itemScores["1"] ?? 0);
      const v0 = Number(itemScores["0"] ?? 0);
      const v7 = Number(itemScores["7"] ?? 0);
      const v8 = Number(itemScores["8"] ?? 0);

      const total = v1 + v0 + v7 + v8;
      const safeDiv = (v: number) =>
        total > 0 ? ((v / total) * 100).toFixed(1) : "0.0";

      return {
        id: code,
        posicao: num,
        abandonado: abandonadosCodes?.has(code) || false,
        respondentes: total,
        freq_acerto: safeDiv(v1),
        freq_erro: safeDiv(v0),
        freq_branco: safeDiv(v8),
        freq_dupla_marcacao: safeDiv(v7),
        param_b: param,
      };
    });
  }, [
    scoreData,
    deferredArea,
    selectedLabel,
    getParamByLabel,
    getCodeByLabel,
    abandonadosCodes,
  ]);

  // eslint-disable-next-line
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // INICIA COM O PRIMEIRO ITEM
  useEffect(() => {
    if (data.length > 0) {
      setLastItemActivate(data[0].id);
      setLastItemActivateNum(data[0].posicao);
    }
  }, [data, setLastItemActivate, setLastItemActivateNum]);

  return (
    <section className={styles.probtable_container}>
      <div className={styles.probtable_cabecalho}>
        <div className={styles.probtable_title}>
          <h3 className={styles.card_title}>
            Tabela de frequência de respostas
          </h3>
          <p className={styles.card_subtitle_p}>
            Frequência relativa de acertos e erros observada em cada item dos
            exames.
          </p>
        </div>
        <div className={styles.probtable_dropdown}>
          <Dropdown />
        </div>
      </div>
      <table className={styles.probtable_table}>
        <thead className={styles.probtable_thead}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className={styles.probtable_tr}>
              {headerGroup.headers.map((header) => {
                const isGroup = header.column.columns.length > 0;
                const canSort = header.column.getCanSort() && !isGroup;
                const isSorted = header.column.getIsSorted();
                return (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className={clsx(
                      styles.probtable_thead_th,
                      isGroup && styles.probtable_group_th,
                    )}
                    onClick={
                      canSort
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    <div
                      className={clsx(
                        styles.probtable_th_item,
                        canSort && styles.sortable,
                        isSorted && styles.sorted,
                      )}
                      style={{
                        cursor: canSort ? "pointer" : "default",
                      }}
                    >
                      {" "}
                      {!header.isPlaceholder &&
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      {canSort && (
                        <span
                          style={{
                            fontSize: "10px",
                          }}
                        >
                          {{
                            asc: !isMobile && <Sort height="20px" />,
                            desc: !isMobile && <Sort height="20px" />,
                          }[header.column.getIsSorted() as string] ??
                            (!isMobile && <Sort height="20px" />)}
                        </span>
                      )}
                    </div>{" "}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            const isAbandonado = row.original.abandonado;
            const itemId = row.original.id;
            const isActive = lastItemActivate === itemId;

            return (
              <tr
                key={row.id}
                className={`
                  ${styles.probtable_tr1} 
                  ${isAbandonado ? styles.row_abandonado : ""} 
                  ${isActive ? styles.row_active : ""}
                `}
                onClick={() => {
                  if (!isAbandonado) {
                    setLastItemActivate(itemId);
                    setLastItemActivateNum(row.original.posicao);
                    setItemGraphData(null);
                    setAcertosData(null);
                  }
                }}
                style={{
                  backgroundColor: isActive
                    ? tabColor
                    : isAbandonado
                      ? "rgba(255, 75, 75, 0.05)"
                      : "transparent",
                  borderLeft: isActive
                    ? "4px solid rgba(0, 0, 0, 0.5)"
                    : isAbandonado
                      ? "4px solid #ff4b4b"
                      : "4px solid transparent",
                  cursor: isAbandonado ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  opacity: isAbandonado ? 0.7 : 1,
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={styles.probtable_td}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
