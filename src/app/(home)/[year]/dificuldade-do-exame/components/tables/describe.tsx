'use client'

import { useMemo, memo } from 'react';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import styles from "./tables.module.css";
import { useHomeData } from '../../../../../../context/home_context';
import { useNineteenData } from '../../../../../../context/nineteen_context';

const columnHelper = createColumnHelper<any>();

const TableRow = memo(({ row, selectedRowId, onRowClick }: any) => {
  
  const isSelected = selectedRowId === row.original.id;  
  
  return (
    <tr 
      className={`${styles.describe_tr} ${isSelected ? styles.row_selected : ''}`}
      // Alterado para passar apenas o ID da linha clicada
      onClick={() => onRowClick(row.original.id)} 
      style={{ cursor: 'pointer' }}
    >
      {row.getVisibleCells().map((cell: any) => (
        <td key={cell.id} className={styles.describe_td}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
});

TableRow.displayName = 'TableRow';

export function DescribeTable() {
  
  const { deferredArea, selectedRowId, setSelectedRowId } = useHomeData();
  const { describeRowData } = useNineteenData();

  const columns = useMemo(() => [
    columnHelper.accessor('metric', {
      header: 'Medidas',
      cell: info => <span className={styles.describe_metricLabel}>{info.getValue()}</span>,
    }),
    columnHelper.accessor('nota', {
      header: 'Notas',
      cell: info => <span className={styles.describe_valueText}>{info.getValue()}</span>,
    }),
    columnHelper.accessor('acerto', {
      header: 'Acertos',
      cell: info => <span className={styles.describe_valueText}>{info.getValue()}</span>,
    }),
  ], []);

  const table = useReactTable({
    // Usamos os dados que já vêm mastigados do provider
    data: describeRowData.data, 
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Proteção contra dados nulos
  if (!describeRowData.data.length) return null;

  return (
    <div className={styles.describe_wrapper}>
      <div className={styles.describe_container}>
        <table className={styles.describe_table}>
          <thead className={styles.describe_thead}>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id} className={styles.describe_tr}>
                {hg.headers.map(header => (
                  <th key={header.id} className={styles.describe_th}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <TableRow 
                // O ID da linha concatenado com a área garante o re-render correto no React
                key={`${deferredArea}-${row.original.id}`}
                row={row}
                selectedRowId={selectedRowId}
                onRowClick={setSelectedRowId}
              />
            ))}
          </tbody>
        </table>
        <div className={styles.describe_footer}>
          <div>
            n = {describeRowData.n.toLocaleString('pt-BR')}
          </div>
          <div>
            ¹ Prova de referência: {describeRowData.cor_min_ref} (cod: {describeRowData.cod_min_ref})
          </div>
          <div>
            ² Prova de referência: {describeRowData.cor_max_ref} (cod: {describeRowData.cod_max_ref})
          </div>
        </div>
      </div>
    </div>
  );
}