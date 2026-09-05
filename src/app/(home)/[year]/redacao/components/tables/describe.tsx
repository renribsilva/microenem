"use client";

import { useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import styles from "./tables.module.css";
import { useHomeData } from "../../../../../../context/home_context";
import { useYearData } from "../../../../../../context/year_context";
import { CompetenciaRowType } from "../../../../../../types/year_types";
import clsx from "clsx";
import { useSidebar } from "../../../../../../context/sidebar_context";
import TDMedium from "../../../../../../components/skt/td";

interface TableDataItem {
  id: string;
  metric: string;
  comp1: string | number;
  comp2: string | number;
  comp3: string | number;
  comp4: string | number;
  comp5: string | number;
  total: string | number;
}

const MEDIDAS_PADRAO = [
  { id: "media", label: "Média" },
  { id: "mediana", label: "Mediana" },
  { id: "moda", label: "Moda" },
  { id: "q1", label: "Q1" },
  { id: "q3", label: "Q3" },
  { id: "p99", label: "P99" },
  { id: "sd", label: "Desvio Padrão" },
  { id: "skew", label: "Assimetria" },
  { id: "kurtosis", label: "Curtose" },
];

export default function NotasRedacaoTable() {
  const { redacaoData } = useYearData();
  const { isMobile } = useSidebar();
  const { deferredArea, selectedRowId, setSelectedRowId } = useHomeData();

  const competenciaRowData: CompetenciaRowType | undefined =
    redacaoData?.competenciaRowData;

  const isLoading = !competenciaRowData;

  const formatValue = (id: string, value: number | undefined) => {
    if (value === undefined || value === null) return "---";
    if (id === "skew" || id === "kurtosis") {
      return value.toLocaleString("pt-BR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });
    }
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const tableData = useMemo<TableDataItem[]>(() => {
    const hasData = !!competenciaRowData;

    return MEDIDAS_PADRAO.map((m) => {
      const label =
        m.id === "sd" && isMobile
          ? "D.P."
          : m.id === "skew" && isMobile
            ? "Assim."
            : m.id === "kurtosis" && isMobile
              ? "Curt."
              : m.label;

      return {
        id: m.id,
        metric: label,
        comp1: hasData
          ? formatValue(
              m.id,
              competenciaRowData.NU_NOTA_COMP1?.estatisticas?.[m.id],
            )
          : "---",
        comp2: hasData
          ? formatValue(
              m.id,
              competenciaRowData.NU_NOTA_COMP2?.estatisticas?.[m.id],
            )
          : "---",
        comp3: hasData
          ? formatValue(
              m.id,
              competenciaRowData.NU_NOTA_COMP3?.estatisticas?.[m.id],
            )
          : "---",
        comp4: hasData
          ? formatValue(
              m.id,
              competenciaRowData.NU_NOTA_COMP4?.estatisticas?.[m.id],
            )
          : "---",
        comp5: hasData
          ? formatValue(
              m.id,
              competenciaRowData.NU_NOTA_COMP5?.estatisticas?.[m.id],
            )
          : "---",
        total: hasData
          ? formatValue(
              m.id,
              competenciaRowData.NU_NOTA_REDACAO?.estatisticas?.[m.id],
            )
          : "---",
      };
    });
  }, [isMobile, competenciaRowData]);

  const columnHelper = createColumnHelper<TableDataItem>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("metric", {
        header: "",
        size: 90,
        minSize: 0,
        maxSize: isMobile ? 50 : 100,
        enableResizing: false,
        cell: (info) => (
          <span className={styles.describe_metricLabel}>{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("comp1", {
        header: "C1",
        size: 30,
        minSize: 0,
        maxSize: 35,
        enableResizing: false,
        cell: (info) =>
          isLoading || info.getValue() === "---" ? (
            <div className={styles.describe_fixed_cell}>
              <TDMedium />
            </div>
          ) : (
            <div className={styles.describe_fixed_cell}>
              <span className={styles.describe_valueText}>
                {info.getValue()}
              </span>
            </div>
          ),
      }),
      columnHelper.accessor("comp2", {
        header: "C2",
        size: 30,
        minSize: 0,
        maxSize: 35,
        enableResizing: false,
        cell: (info) =>
          isLoading || info.getValue() === "---" ? (
            <div className={styles.describe_fixed_cell}>
              <TDMedium />
            </div>
          ) : (
            <div className={styles.describe_fixed_cell}>
              <span className={styles.describe_valueText}>
                {info.getValue()}
              </span>
            </div>
          ),
      }),
      columnHelper.accessor("comp3", {
        header: "C3",
        size: 30,
        minSize: 0,
        maxSize: 35,
        enableResizing: false,
        cell: (info) =>
          isLoading || info.getValue() === "---" ? (
            <div className={styles.describe_fixed_cell}>
              <TDMedium />
            </div>
          ) : (
            <div className={styles.describe_fixed_cell}>
              <span className={styles.describe_valueText}>
                {info.getValue()}
              </span>
            </div>
          ),
      }),
      columnHelper.accessor("comp4", {
        header: "C4",
        size: 30,
        minSize: 0,
        maxSize: 35,
        enableResizing: false,
        cell: (info) =>
          isLoading || info.getValue() === "---" ? (
            <div className={styles.describe_fixed_cell}>
              <TDMedium />
            </div>
          ) : (
            <div className={styles.describe_fixed_cell}>
              <span className={styles.describe_valueText}>
                {info.getValue()}
              </span>
            </div>
          ),
      }),
      columnHelper.accessor("comp5", {
        header: "C5",
        size: 30,
        minSize: 0,
        maxSize: 35,
        enableResizing: false,
        cell: (info) =>
          isLoading || info.getValue() === "---" ? (
            <div className={styles.describe_fixed_cell}>
              <TDMedium />
            </div>
          ) : (
            <div className={styles.describe_fixed_cell}>
              <span className={styles.describe_valueText}>
                {info.getValue()}
              </span>
            </div>
          ),
      }),
      columnHelper.accessor("total", {
        header: isMobile ? "N.T." : "Nota Total",
        size: 65,
        minSize: 0,
        maxSize: isMobile ? 35 : 65,
        enableResizing: false,
        cell: (info) =>
          isLoading || info.getValue() === "---" ? (
            <div className={styles.describe_fixed_cell}>
              <TDMedium />
            </div>
          ) : (
            <div className={styles.describe_fixed_cell}>
              <span className={styles.describe_valueText}>
                <strong>{info.getValue()}</strong>
              </span>
            </div>
          ),
      }),
    ],
    [isMobile, isLoading, columnHelper],
  );

  // eslint-disable-next-line
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      size: 45,
      minSize: 45,
      maxSize: 45,
    },
  });

  return (
    <div className={styles.describe_wrapper}>
      <div className={styles.describe_container}>
        <table
          className={styles.describe_table}
          style={{ tableLayout: "fixed", width: "100%" }}
        >
          <thead className={styles.describe_thead}>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className={styles.describe_tr}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className={styles.describe_th}
                    style={{
                      width: `${header.getSize()}px`,
                      minWidth: `${header.getSize()}px`,
                      maxWidth: `${header.getSize()}px`,
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={`${deferredArea}-${row.id}`}
                className={clsx(
                  styles.describe_tr,
                  selectedRowId === row.original.id && styles.row_selected,
                )}
                onClick={() => {
                  setSelectedRowId(row.original.id);
                  const topo = document.getElementById("topo-pagina");
                  if (topo) {
                    topo.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={styles.describe_td}
                    style={{
                      width: `${cell.column.getSize()}px`,
                      minWidth: `${cell.column.getSize()}px`,
                      maxWidth: `${cell.column.getSize()}px`,
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
