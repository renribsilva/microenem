"use client";

import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
  ColumnDef,
  createColumnHelper,
} from "@tanstack/react-table";
import styles from "./tables.module.css";
import { useYearData } from "../../../../../../context/year_context";
import TDMedium from "../../../../../../components/skt/td";
import { useSidebar } from "../../../../../../context/sidebar_context";

interface StatusRow {
  grupo: string;
  total: number | string | null;
  freq: string | null;
  isTotal: boolean;
}

const statusMap: Record<string, string> = {
  "1": "Sem problemas*",
  "2": "Anulada",
  "3": "Cópia do Texto Motivador",
  "4": "Em branco",
  "6": "Fuga ao Tema",
  "7": "Fuga ao Tipo Textual",
  "8": "Texto insuficiente",
  "9": "Parte desconectada",
};

const STATUS_KEYS = ["1", "2", "3", "4", "6", "7", "8", "9"];

export default function StatusRedacaoTable() {
  const { isMobile } = useSidebar();
  const { redacaoData } = useYearData();
  const statusData = redacaoData?.statusData;

  const isLoading = !statusData || !statusData.datasets || !statusData.labels;

  const tableData = useMemo<StatusRow[]>(() => {
    if (isLoading) {
      const fallbackRows: StatusRow[] = STATUS_KEYS.map((key) => ({
        grupo: statusMap[key],
        total: null,
        freq: null,
        isTotal: false,
      }));

      return [
        {
          grupo: "Total de Registros (n)",
          total: null,
          freq: null,
          isTotal: true,
        },
        ...fallbackRows,
      ];
    }

    const nTotal = statusData.datasets[0]?.n_total || 0;
    const firstRow: StatusRow = {
      grupo: "Total de Registros (n)",
      total: nTotal,
      freq: "100.00",
      isTotal: true,
    };

    const rows: StatusRow[] = statusData.labels.map((label, index) => {
      const total = statusData.datasets[0]?.data?.[index] || 0;
      const freq = nTotal > 0 ? ((total / nTotal) * 100).toFixed(2) : "0.00";
      return {
        grupo: statusMap[label] || `Status ${label}`,
        total: total,
        freq: freq,
        isTotal: false,
      };
    });

    return [firstRow, ...rows];
  }, [statusData, isLoading]);

  const columnHelper = createColumnHelper<StatusRow>();

  const columns = useMemo<ColumnDef<StatusRow>[]>(
    () => [
      columnHelper.accessor("grupo", {
        header: "",
        size: 180,
        minSize: 0,
        maxSize: isMobile ? 90 : 180,
        enableResizing: false,
        cell: ({ row, getValue }) => {
          const val = getValue() as string;
          return (
            <div
              title={val}
              className={styles.table_metricLabel}
              style={{
                paddingLeft: `${row.depth * 2}rem`,
              }}
            >
              {val}
            </div>
          );
        },
      }),
      columnHelper.accessor("total", {
        header: "Total",
        size: 60,
        minSize: 0,
        maxSize: 80,
        enableResizing: false,
        cell: ({ getValue }) => {
          const val = getValue() as number | string | null;
          if (isLoading || val === null || val === "---") {
            return (
              <div className={styles.table_fixed_cell}>
                <TDMedium />
              </div>
            );
          }
          return (
            <div className={styles.table_fixed_cell}>
              <span className={styles.table_valueText}>
                {typeof val === "number" ? val.toLocaleString("pt-BR") : val}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor("freq", {
        header: "(%)",
        size: 60,
        minSize: 0,
        maxSize: 70,
        enableResizing: false,
        cell: ({ getValue }) => {
          const val = getValue() as string | null;
          if (isLoading || val === null || val === "---") {
            return (
              <div className={styles.table_fixed_cell}>
                <TDMedium />
              </div>
            );
          }
          return (
            <div className={styles.table_fixed_cell}>
              <span className={styles.table_valueText}>{val}%</span>
            </div>
          );
        },
      }),
    ],
    [isMobile, columnHelper, isLoading],
  );

  // eslint-disable-next-line
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    defaultColumn: {
      size: 90,
      minSize: 50,
      maxSize: 300,
    },
  });

  return (
    <div className={styles.table_container}>
      <table
        className={styles.table_body}
        style={{ tableLayout: "fixed", width: "100%" }}
      >
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className={styles.table_tr}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={styles.table_th}
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
            <tr key={row.id} className={styles.table_tr}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={styles.table_td}
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
      <div className={styles.table_footer}>
        * Recorte de análise do gráfico e tabela de competências.
      </div>
    </div>
  );
}
