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
import clsx from "clsx";
import { useSidebar } from "../../../../../../context/sidebar_context";
import Sort from "../../../../../../components/svg/sort";
import DropdownBooks from "../../../../../../components/tsx/dropdown_books";
import Visibility from "../../../../../../components/svg/open_in_new";

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
    setShowPopUp,
    setQuestaoPopUp,
    setIsLoaded,
  } = useYearData();

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Defina a constante de visibilidade
  const hideExtraColumns = windowWidth <= 1000;

  const scoreData = respostaAoItemData.scoreData;

  const [sorting, setSorting] = useState<SortingState>([
    { id: "posicao", desc: false },
  ]);

  const columnHelper = createColumnHelper<TableRow>();

  const columns = useMemo(() => {
    const idCols = [
      columnHelper.accessor("posicao", {
        header: "Item",
        meta: {
          hidden: isMobile,
        },
        cell: (info) => {
          const isSorted = info.column.getIsSorted();
          return (
            <strong
              style={{
                fontWeight: isSorted ? "400" : "300",
                color: "#888",
              }}
            >
              {info.getValue()}
            </strong>
          );
        },
      }),
      columnHelper.accessor("id", {
        header: "Código",
        cell: (info) => {
          const isSorted = info.column.getIsSorted();
          const codigoQuestao = info.getValue();
          return (
            <div className={styles.code_container}>
              <span
                style={{
                  color: "#888",
                  fontWeight: isSorted ? "400" : "300",
                }}
              >
                {info.getValue()}
              </span>
              <span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPopUp(true);
                    setQuestaoPopUp(codigoQuestao);
                    setIsLoaded(false);
                  }}
                  className={clsx(styles.visibility_button)}
                >
                  <Visibility fill="#888" height="20px" />
                </button>
              </span>
            </div>
          );
        },
      }),
      // Só inclui Abandonado se não for mobile
      ...(!isMobile
        ? [
            columnHelper.accessor("abandonado", {
              header: "Anulado",
              cell: (info) => {
                const val = info.getValue();
                const isSorted = info.column.getIsSorted();
                return (
                  <span
                    style={{
                      fontWeight: isSorted ? "400" : "300",
                      color: val ? "#ff4b4b" : "#888",
                    }}
                  >
                    {val ? "SIM" : "NÃO"}
                  </span>
                );
              },
            }),
          ]
        : []),
    ];

    // Definimos as sub-colunas de Score
    const scoreCols = [
      ...(!isMobile
        ? [
            columnHelper.accessor("respondentes", {
              header: "n",
              cell: (info) => {
                if (info.row.original.abandonado) {
                  return <span style={{ color: "#ccc" }}>—</span>;
                }
                const val = info.getValue();
                const compactFormatter = new Intl.NumberFormat("pt-BR", {
                  notation: "compact",
                  compactDisplay: "short",
                  maximumFractionDigits: 1,
                });
                const isSorted = info.column.getIsSorted();
                return (
                  <span
                    style={{
                      fontSize: isSorted ? "400" : "300",
                      color: "#888",
                    }}
                  >
                    {isMobile
                      ? compactFormatter.format(val).toLowerCase()
                      : val.toLocaleString("pt-BR")}
                  </span>
                );
              },
            }),
          ]
        : []),
      columnHelper.accessor("freq_acerto", {
        header: "Certa",
        cell: (info) => {
          if (info.row.original.abandonado) {
            return <span style={{ color: "#ccc" }}>—</span>;
          }
          const isSorted = info.column.getIsSorted();
          return (
            <span
              style={{
                color: "#52c41a",
                fontWeight: isSorted ? "400" : "300",
              }}
            >
              {info.getValue()}%
            </span>
          );
        },
      }),
      columnHelper.accessor("freq_erro", {
        header: "Errada",
        cell: (info) => {
          if (info.row.original.abandonado) {
            return <span style={{ color: "#ccc" }}>—</span>;
          }
          const isSorted = info.column.getIsSorted();
          return (
            <span
              style={{
                color: "#ff4b4b",
                fontWeight: isSorted ? "400" : "300",
              }}
            >
              {info.getValue()}%
            </span>
          );
        },
      }),
      ...(!isMobile && !hideExtraColumns
        ? [
            columnHelper.accessor("freq_branco", {
              header: "Branco",
              cell: (info) => {
                if (info.row.original.abandonado) {
                  return <span style={{ color: "#ccc" }}>—</span>;
                }
                const isSorted = info.column.getIsSorted();
                return (
                  <span
                    style={{
                      color: "#888",
                      fontWeight: isSorted ? "400" : "300",
                    }}
                  >
                    {info.getValue()}%
                  </span>
                );
              },
            }),
            columnHelper.accessor("freq_dupla_marcacao", {
              header: "Dupla",
              cell: (info) => {
                if (info.row.original.abandonado) {
                  return <span style={{ color: "#ccc" }}>—</span>;
                }
                const isSorted = info.column.getIsSorted();
                return (
                  <span
                    style={{
                      color: "#888",
                      fontWeight: isSorted ? "400" : "300",
                    }}
                  >
                    {info.getValue()}%
                  </span>
                );
              },
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
  }, [
    columnHelper,
    isMobile,
    setIsLoaded,
    setQuestaoPopUp,
    setShowPopUp,
    hideExtraColumns,
  ]);

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
    enableSortingRemoval: false,
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
          <DropdownBooks />
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
                        <span>
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
                className={clsx(
                  styles.probtable_tr1,
                  isAbandonado && styles.row_abandonado,
                  isActive && styles.row_active,
                )}
                onClick={() => {
                  if (!isAbandonado) {
                    setLastItemActivate(itemId);
                    setLastItemActivateNum(row.original.posicao);
                    setItemGraphData(null);
                    setAcertosData(null);
                    const topo = document.getElementById("topo-pagina");
                    if (topo) {
                      topo.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }
                  }
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
