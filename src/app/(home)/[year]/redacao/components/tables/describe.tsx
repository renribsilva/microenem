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

interface TableDataItem {
  id: string;
  metric: string;
  comp1: string;
  comp2: string;
  comp3: string;
  comp4: string;
  comp5: string;
  total: string;
}

export default function NotasRedacaoTable() {
  const { redacaoData } = useYearData();
  const { isMobile } = useSidebar();
  const { deferredArea, selectedRowId, setSelectedRowId } = useHomeData();

  const competenciaRowData: CompetenciaRowType | undefined =
    redacaoData?.competenciaRowData;

  const formatValue = (id: string, value: number | undefined) => {
    if (value === undefined || value === null) return "-";
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
    if (!competenciaRowData) {
      return [];
    }

    const metrics = [
      { id: "media", label: "Média" },
      { id: "mediana", label: "Mediana" },
      { id: "moda", label: "Moda" },
      { id: "q1", label: "Q1" },
      { id: "q3", label: "Q3" },
      { id: "p99", label: "P99" },
      { id: "sd", label: isMobile ? "D.P." : "Desvio Padrão" },
      { id: "skew", label: isMobile ? "Assim." : "Assimetria" },
      { id: "kurtosis", label: isMobile ? "Curt." : "Curtose" },
    ];

    return metrics.map((m) => ({
      id: m.id,
      metric: m.label,
      comp1: formatValue(
        m.id,
        competenciaRowData.NU_NOTA_COMP1?.estatisticas?.[m.id],
      ),
      comp2: formatValue(
        m.id,
        competenciaRowData.NU_NOTA_COMP2?.estatisticas?.[m.id],
      ),
      comp3: formatValue(
        m.id,
        competenciaRowData.NU_NOTA_COMP3?.estatisticas?.[m.id],
      ),
      comp4: formatValue(
        m.id,
        competenciaRowData.NU_NOTA_COMP4?.estatisticas?.[m.id],
      ),
      comp5: formatValue(
        m.id,
        competenciaRowData.NU_NOTA_COMP5?.estatisticas?.[m.id],
      ),
      total: formatValue(
        m.id,
        competenciaRowData.NU_NOTA_REDACAO?.estatisticas?.[m.id],
      ),
    }));
  }, [isMobile, competenciaRowData]);

  const columnHelper = createColumnHelper<TableDataItem>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("metric", {
        header: isMobile ? "" : "Medidas",
        cell: (info) => (
          <span className={styles.describe_metricLabel}>{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("comp1", { header: "C1" }),
      columnHelper.accessor("comp2", { header: "C2" }),
      columnHelper.accessor("comp3", { header: "C3" }),
      columnHelper.accessor("comp4", { header: "C4" }),
      columnHelper.accessor("comp5", { header: "C5" }),
      columnHelper.accessor("total", {
        header: isMobile ? "N.T." : "Nota Total",
        cell: (info) => <strong>{info.getValue()}</strong>,
      }),
    ],
    [isMobile, columnHelper],
  );

  // eslint-disable-next-line
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className={styles.describe_wrapper}>
      <div className={styles.describe_container}>
        <table className={styles.describe_table}>
          <thead className={styles.describe_thead}>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className={styles.describe_tr}>
                {hg.headers.map((header) => (
                  <th key={header.id} className={styles.describe_th}>
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
            {!competenciaRowData ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className={styles.describe_td}
                  style={{ textAlign: "center" }}
                >
                  Carregando...
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
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
                    <td key={cell.id} className={styles.describe_td}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
