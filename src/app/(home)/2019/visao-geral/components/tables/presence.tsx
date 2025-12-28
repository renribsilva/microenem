'use client'

import React, { useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
  ColumnDef // Import necessário para tipagem
} from '@tanstack/react-table'
import presence_data from "../../json/overview/presenca.json"
import styles from "./tables.module.css"

// 1. Defina a interface do dado
export interface InscritoData {
  grupo: string
  total: number
  freq: number
  subRows?: InscritoData[]
}

const data = presence_data as InscritoData[]

export default function Presence() {

  // 2. Tipagem das colunas
  const columns = useMemo<ColumnDef<InscritoData>[]>(() => [
    {
      accessorKey: 'grupo',
      header: '',
      cell: ({ row, getValue }) => (
        <div style={{ paddingLeft: `${row.depth * 2}rem` }}>
          {getValue() as string}
        </div>
      ),
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ getValue }) => (getValue() as number)?.toLocaleString('pt-BR'),
    },
    {
      accessorKey: 'freq',
      header: '(%)',
      cell: ({ getValue }) => `${getValue()}%`,
    },
  ], [])

  const table = useReactTable({
    data,
    columns,
    initialState: {
      expanded: true, 
    },
    getSubRows: row => row.subRows,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  })

  return (
    <div className={styles.table_container}>
      <table className={styles.table}>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}