'use client'

import { useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
  ColumnDef
} from '@tanstack/react-table'
import statusData from "../../json/status_redacao.json"
import styles from './tables.module.css'

// Definindo a interface para o dado da linha
interface StatusRow {
  grupo: string;
  total: number;
  freq: string;
  isTotal: boolean;
}

const statusMap: Record<string, string> = {
  "1": "Sem problemas*",
  "2": "Anulada",
  "3": "Cópia do Texto Motivador",
  "4": "Texto Insuficiente",
  "6": "Fuga ao Tema",
  "7": "Não Atendimento ao Tipo Textual",
  "8": "Texto em Branco",
  "9": "Outros problemas"
};

export default function StatusRedacaoTable() {

  const tableData = useMemo<StatusRow[]>(() => {
    const nTotal = statusData?.datasets[0]?.n_total || 0;
    
    const firstRow: StatusRow = {
      grupo: "Total de Registros (n)",
      total: nTotal,
      freq: "100.00",
      isTotal: true
    };

    const rows: StatusRow[] = statusData.labels.map((label, index) => {
      const total = statusData.datasets[0].data[index];
      const freq = ((total / nTotal) * 100).toFixed(2);
      
      return {
        grupo: statusMap[label] || `Status ${label}`,
        total: total,
        freq: freq,
        isTotal: false
      }
    });

    return [firstRow, ...rows];
  }, []);

  // Ajustado para usar ColumnDef<StatusRow> em vez de any
  const columns = useMemo<ColumnDef<StatusRow>[]>(() => [
    {
      accessorKey: 'grupo',
      header: '',
      cell: ({ row, getValue }) => {
        const isTotal = row.original.isTotal;
        const val = getValue() as string; // Cast de unknown para string
        return (
          <div style={{ 
            paddingLeft: `${row.depth * 2}rem`, 
            fontWeight: '300' 
          }}>
            {val}
          </div>
        )
      },
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ getValue }) => {
        const val = getValue() as number; // Cast de unknown para number
        return (
          <span style={{ fontWeight: '300' }}>
            {val?.toLocaleString('pt-BR')}
          </span>
        );
      },
    },
    {
      accessorKey: 'freq',
      header: '(%)',
      cell: ({ row, getValue }) => {
        const val = getValue() as string; // Cast de unknown para string
        return (
          <span style={{ fontWeight: '300' }}>
            {val}%
          </span>
        );
      },
    },
  ], [])

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  })

  return (
    <div className={styles.table_container}>
      <table className={styles.table_body}>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr 
              key={row.id} 
              style={{ backgroundColor: 'transparent' }}
            >
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className={styles.table_footer}>
        * Recorte de análise dos gráficos.
      </div>
    </div>
  )
}