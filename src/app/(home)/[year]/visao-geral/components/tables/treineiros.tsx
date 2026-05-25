"use client";

import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import styles from "./tables.module.css";
import { useYearData } from "../../../../../../context/year_context";
import { InscritosType } from "../../../../../../types/year_types";

export default function Treineiros() {
  const { overviewData } = useYearData();

  const data = overviewData.inscritosData;

  // 2. Tipagem das colunas
  const columns = useMemo<ColumnDef<InscritosType>[]>(
    () => [
      {
        accessorKey: "grupo",
        header: "",
        cell: ({ row, getValue }) => (
          <div style={{ paddingLeft: `${row.depth * 2}rem` }}>
            {getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ getValue }) => (getValue() as number)?.toLocaleString("pt-BR"),
      },
      {
        accessorKey: "freq",
        header: "(%)",
        cell: ({ getValue }) => `${getValue()}%`,
      },
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    initialState: {
      expanded: true,
    },
    getSubRows: (row) => row.subRows,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <div className={styles.table_container}>
      <table className={styles.table_body}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
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
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
