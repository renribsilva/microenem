"use client";

import { useMemo, useState } from "react";
import { useHomeData } from "../../../../../../context/home_context";
import { useYearData } from "../../../../../../context/year_context";
import { useChartTheme } from "../../../../../../hooks/use_chart_theme";
import styles from "./tables.module.css";
import { useSidebar } from "../../../../../../context/sidebar_context";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";
import dynamic from "next/dynamic";

const Sort = dynamic(() => import("../../../../../../components/svg/sort"));
const Visibility = dynamic(
  () => import("../../../../../../components/svg/open_in_new"),
);

type ImpactoRow = {
  id: number;
  codigo: string;
  status: string;
  a: number;
  b: number;
  c: number;
  impacto: number;
};

export default function MarginImpactTable() {
  const { deferredArea, selectedLabel } = useHomeData();
  const { isMobile } = useSidebar();
  const {
    EAPData,
    selectedItems,
    getParamByLabel,
    getCodeByLabel,
    needUpdateEAP,
    isInitialRender,
    abandonadosCodes,
    setShowPopUp,
    setQuestaoPopUp,
    setIsLoaded,
    setListCode,
  } = useYearData();

  const { textColor } = useChartTheme();
  const [sorting, setSorting] = useState<SortingState>([
    { id: "id", desc: false },
  ]);

  const isTRIDivergente = false;
  // (deferredArea === "LC" && currentYear === "2024") ||
  // (deferredArea === "MT" && currentYear === "2019");

  const paramsPorCodigo = useMemo(() => {
    const ranges = {
      LC: { start: 1, end: 45 },
      CH: { start: 46, end: 90 },
      CN: { start: 91, end: 135 },
      MT: { start: 136, end: 180 },
    };

    const { start, end } = ranges[deferredArea] || { start: 1, end: 45 };
    const map: Record<string, { a: number; b: number; c: number }> = {};

    for (let i = start; i <= end; i++) {
      const code = getCodeByLabel(i, selectedLabel);
      if (code) {
        map[code] = {
          a: getParamByLabel(i, selectedLabel, "a"),
          b: getParamByLabel(i, selectedLabel, "b"),
          c: getParamByLabel(i, selectedLabel, "c"),
        };
      }
    }
    return map;
  }, [deferredArea, selectedLabel, getCodeByLabel, getParamByLabel]);

  const impactosArray = useMemo(() => {
    if (!EAPData?.impacto_individual || isInitialRender) return [];
    const baseArray = Object.entries(EAPData.impacto_individual).map(
      ([codigo, info]) => {
        const params = paramsPorCodigo[codigo];
        const isAbandonado = abandonadosCodes?.has(Number(codigo));
        const status = selectedItems[codigo]?.status
          ? selectedItems[codigo].status
          : isAbandonado
            ? "anulado"
            : "erro";
        const valRaw = info.valor;
        const valNum =
          valRaw === null || (Array.isArray(valRaw) && valRaw[0] === null)
            ? NaN
            : Number(Array.isArray(valRaw) ? valRaw[0] : valRaw);
        const posRaw = info.posicao;
        const posNum = Number(Array.isArray(posRaw) ? posRaw[0] : posRaw);

        return {
          id: posNum,
          codigo,
          status: status,
          a: isAbandonado ? NaN : params?.a,
          b: isAbandonado ? NaN : params?.b,
          c: isAbandonado ? NaN : params?.c,
          impacto: valNum,
        };
      },
    );

    return baseArray;
  }, [
    EAPData,
    abandonadosCodes,
    paramsPorCodigo,
    selectedItems,
    isInitialRender,
  ]);

  const columnHelper = createColumnHelper<ImpactoRow>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "Item",
        cell: (info) => {
          const isSorted = info.column.getIsSorted();
          return (
            <span style={{ fontWeight: isSorted ? "400" : "300" }}>
              {info.getValue()}
            </span>
          );
        },
      }),
      columnHelper.accessor("codigo", {
        header: "Código",
        cell: (info) => {
          const isSorted = info.column.getIsSorted();
          const codigoQuestao = Number(info.getValue());
          const rawData = info.table.options.data;
          const sortedByPosicao = [...rawData].sort((a, b) => a.id - b.id);
          const orderedCodes = sortedByPosicao.map((item) =>
            Number(item.codigo),
          );
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
                  onClick={() => {
                    setShowPopUp(true);
                    setQuestaoPopUp(codigoQuestao);
                    setListCode(orderedCodes);
                    setIsLoaded(false);
                  }}
                  className={styles.visibility_button}
                >
                  <Visibility fill="#888" height="20px" />
                </button>
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const isSorted = info.column.getIsSorted();
          return (
            <span style={{ fontWeight: isSorted ? "400" : "300" }}>
              {info.getValue().toLocaleUpperCase()}
            </span>
          );
        },
      }),
      columnHelper.accessor("a", {
        header: "a¹",
        cell: (info) => {
          const isSorted = info.column.getIsSorted();
          return (
            <span style={{ fontWeight: isSorted ? "400" : "300" }}>
              {info.getValue()?.toFixed(3) ?? "---"}
            </span>
          );
        },
      }),
      columnHelper.accessor("b", {
        header: "b²",
        cell: (info) => {
          const isSorted = info.column.getIsSorted();
          return (
            <span style={{ fontWeight: isSorted ? "400" : "300" }}>
              {info.getValue()?.toFixed(3) ?? "---"}
            </span>
          );
        },
      }),
      columnHelper.accessor("c", {
        header: "c³",
        cell: (info) => {
          const isSorted = info.column.getIsSorted();
          return (
            <span style={{ fontWeight: isSorted ? "400" : "300" }}>
              {info.getValue()?.toFixed(3) ?? "---"}
            </span>
          );
        },
      }),
      columnHelper.accessor("impacto", {
        header: "Impacto",
        cell: (info) => {
          const value = info.getValue();
          const isSorted = info.column.getIsSorted();
          if (isTRIDivergente) return <span>---</span>;
          const formatted =
            value > 0
              ? `+${value.toFixed(2)}`
              : isNaN(value)
                ? String(value)
                : value.toFixed(2);
          return (
            <span
              style={{
                color: value < 0 ? "#ef4444" : "inherit",
                fontWeight: isSorted ? "400" : "300",
              }}
            >
              {formatted}
            </span>
          );
        },
      }),
    ],
    [
      columnHelper,
      isTRIDivergente,
      setListCode,
      setIsLoaded,
      setQuestaoPopUp,
      setShowPopUp,
    ],
  );

  // eslint-disable-next-line
  const table = useReactTable({
    data: impactosArray,
    columns,
    state: {
      sorting,
      columnVisibility: {
        a: !isMobile,
        b: !isMobile,
        c: !isMobile,
      },
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSortingRemoval: false,
  });

  return (
    <div className={styles.impact_container}>
      <div className={styles.tcc_cabecalho}>
        <div className={styles.tcc_title}>
          <h3 className={styles.tcc_title_h3} style={{ color: textColor }}>
            Impacto virtual do item
          </h3>
          <p className={styles.tcc_subtitle_p}>
            Qual seria o impacto na nota final se o item tivesse o seu status
            invertido, mantidos os outros status inalterados?
          </p>
        </div>
      </div>
      <div className={styles.margin_container}>
        {EAPData && (
          <table className={styles.margin_table}>
            <thead className={styles.margin_thead}>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className={styles.margin_tr}>
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const isSorted = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        className={styles.margin_th}
                        onClick={
                          canSort
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
                      >
                        <div
                          className={clsx(
                            styles.margin_th_item,
                            canSort && styles.sortable,
                            isSorted && styles.sorted,
                          )}
                          style={{
                            cursor: canSort ? "pointer" : "default",
                          }}
                        >
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
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => {
                return (
                  <tr
                    key={row.id}
                    className={clsx(styles.margin_tr1)}
                    style={needUpdateEAP ? { opacity: 0.2 } : {}}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className={styles.margin_td}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {table.getRowModel().rows.length === 0 && (
          <div className={styles.eap_initial}>
            <p style={{ fontSize: "16px", fontWeight: 500 }}>
              Calcule o desempenho TRI para ver o impacto virtual de cada item.
            </p>
          </div>
        )}
      </div>
      <div className={styles.table_footer}>
        <div>
          ¹ Parâmetro de discriminação: é o poder de discriminação do item para
          diferenciar os participantes que dominam dos participantes que não
          dominam a habilidade avaliada.
        </div>
        {!isMobile && (
          <>
            <div>
              ² Parâmetro de dificuldade: associado à dificuldade do item, sendo
              que quanto maior seu valor, mais difícil é o item.
            </div>
            <div>
              ³ Parâmetro de acerto ao acaso: é a probabilidade de um
              participante acertar o item não dominando a habilidade exigida.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
