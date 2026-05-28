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
import { TableDataItem } from "../../../../../../types/year_types";
import { clsx } from "clsx";

const columnHelper = createColumnHelper<TableDataItem>();

export function DescribeTable() {
  const { deferredArea, selectedRowId, setSelectedRowId } = useHomeData();
  const { dificuldadeDoExameAux } = useYearData();
  const describeRowData = dificuldadeDoExameAux.describeRowData;

  const columns = useMemo(
    () => [
      columnHelper.accessor("metric", {
        header: "Medidas",
        cell: (info) => (
          <span className={styles.describe_metricLabel}>{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("nota", {
        header: "Notas",
        cell: (info) => (
          <span className={styles.describe_valueText}>{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("acerto", {
        header: "Acertos",
        cell: (info) => (
          <span className={styles.describe_valueText}>{info.getValue()}</span>
        ),
      }),
    ],
    [],
  );

  // eslint-disable-next-line
  const table = useReactTable({
    data: describeRowData.data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!describeRowData.data.length) return null;

  return (
    <div className={styles.describe_wrapper}>
      <div className={styles.describe_cabecalho}>
        <h3 className={styles.describe_title}>
          Descrição estatística de {deferredArea}
        </h3>
      </div>
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
            {table.getRowModel().rows.map((row) => (
              <tr
                key={`${deferredArea}-${row.id}`}
                className={clsx(
                  styles.describe_tr,
                  selectedRowId === row.original.id && styles.row_selected,
                )}
                onClick={() => setSelectedRowId(row.original.id)}
                style={{ cursor: "pointer" }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={styles.describe_td}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.describe_footer}>
          <div>
            ¹ Prova de referência: {describeRowData.cor_min_ref} (cod:{" "}
            {describeRowData.cod_min_ref})
          </div>
          <div>
            ² Prova de referência: {describeRowData.cor_max_ref} (cod:{" "}
            {describeRowData.cod_max_ref})
          </div>
          <div>(n = {describeRowData.n.toLocaleString("pt-BR")})</div>
        </div>
      </div>
    </div>
  );
}
