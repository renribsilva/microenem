'use client'

import { useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
  ColumnDef
} from '@tanstack/react-table'
import styles from './tables.module.css'
import { useYearData } from '../../../../../../context/year_context';

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
  "4": "Em branco",
  "6": "Fuga ao Tema",
  "7": "Fuga ao Tipo Textual",
  "8": "Texto insuficiente",
  "9": "Parte desconectada"
};

export default function StatusRedacaoTable() {

  const { statusData } = useYearData();

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

  const columns = useMemo<ColumnDef<StatusRow>[]>(() => [
    {
      accessorKey: 'grupo',
      header: '',
      cell: ({ row, getValue }) => {
        const val = getValue() as string; 
        return (
          <div 
            title={val} // Mostra o texto completo ao pairar o mouse
            style={{ 
              paddingLeft: `${row.depth * 2}rem`, 
              fontWeight: '300',
              // Estilo para Ellipsis:
              maxWidth: '180px', // Limita a largura no mobile
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {val}
          </div>
        )
      },
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ getValue }) => {
        const val = getValue() as number;
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
      cell: ({ getValue }) => {
        const val = getValue() as string;
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
      <table className={styles.table_body} style={{ tableLayout: 'fixed', width: '100%' }}>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header, i) => (
                <th 
                  key={header.id} 
                  style={{ width: i === 0 ? '50%' : '25%' }} // Dá mais espaço para a primeira coluna
                >
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
      
      <div className={styles.table_footer}>
        * Recorte de análise do gráfico e tabela de competências.
      </div>
    </div>
  )
}
