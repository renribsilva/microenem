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
import { InscritosItem } from "../../../../../../types/year_types";
import TDShort from "../../../../../../components/skt/visao-geral/td_short";

const STATIC_GROUPS = [
  {
    grupo: "Inscritos",
    subRows: [{ grupo: "Não treineiros" }, { grupo: "Treineiros" }],
  },
] as unknown as InscritosItem[];

export default function Treineiros() {
  const { overviewData } = useYearData();
  const isLoading =
    !overviewData?.inscritosData || overviewData.inscritosData.length === 0;

  const data = useMemo(
    () => (isLoading ? STATIC_GROUPS : overviewData.inscritosData),
    [isLoading, overviewData?.inscritosData],
  );

  const columns = useMemo<ColumnDef<InscritosItem>[]>(
    () => [
      {
        accessorKey: "grupo",
        header: "",
        cell: ({ row, getValue }) => (
          <p
            className={styles.card_abstencao_subtitle}
            style={{
              paddingLeft: `${row.depth * 1}rem`,
              margin: 0,
              textAlign: "left",
            }}
          >
            {getValue() as string}
          </p>
        ),
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ getValue }) =>
          isLoading || getValue() === undefined ? (
            <TDShort />
          ) : (
            <span className={styles.card_abstencao_num}>
              {Number(getValue()).toLocaleString("pt-BR")}
            </span>
          ),
      },
      {
        accessorKey: "freq",
        header: "(%)",
        cell: ({ getValue }) =>
          isLoading || getValue() === undefined ? (
            <TDShort />
          ) : (
            <span className={styles.card_abstencao_num}>
              {String(getValue())}%
            </span>
          ),
      },
    ],
    [isLoading],
  );

  // eslint-disable-next-line
  const table = useReactTable({
    data,
    columns,
    initialState: {
      expanded: true,
    },
    getSubRows: (row) => row?.subRows,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <div className={styles.table_container} style={{ width: "100%" }}>
      <table
        className={styles.table_body}
        style={{ width: "100%", tableLayout: "auto" }}
      >
        <thead className={styles.table_thead}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className={styles.table_thead_tr}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={styles.table_thead_th}
                  style={{
                    textAlign: header.index === 0 ? "left" : "right",
                  }}
                >
                  <span className={styles.card_abstencao_subtitle}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className={styles.table_tbody_tr}>
              {row.getVisibleCells().map((cell, index) => (
                <td
                  key={cell.id}
                  className={styles.table_tbody_td}
                  style={{
                    textAlign: index === 0 ? "left" : "right",
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
  );
}
