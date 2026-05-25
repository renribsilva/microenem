'use client'

import { useMemo, memo, useState, useEffect } from 'react';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import styles from "./tables.module.css";
import { useHomeData } from '../../../../../../context/home_context';
import { useYearData } from '../../../../../../context/year_context';

const columnHelper = createColumnHelper<any>();

const TableRow = memo(({ row, selectedRowId, onRowClick }: any) => {
  // A comparação agora é exata com o ID 'media'
  const isSelected = selectedRowId === row.original.id;  
  
  return (
    <tr 
      className={`${styles.describe_tr} ${isSelected ? styles.row_selected : ''}`}
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

export default function NotasRedacaoTable() {

  const { competenciaRowData } = useYearData();
  const { deferredArea, selectedRowId, setSelectedRowId } = useHomeData();
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 800 : false);
  
  useEffect(() => {
    if (!selectedRowId || selectedRowId === 'mean') {
      setSelectedRowId('media');
    }
  }, [selectedRowId, setSelectedRowId]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 800);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatValue = (id: string, value: number) => {
    if (value === undefined || value === null) return '-';
    if (id === 'skew' || id === 'kurtosis') {
      return value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    }
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const tableData = useMemo(() => {
    const metrics = [
      { id: 'media', label: 'Média' }, // O ID aqui é 'media'
      { id: 'mediana', label: isMobile ? 'Media.' : 'Mediana' },
      { id: 'moda', label: 'Moda' },
      { id: 'q1', label: 'Q1' },
      { id: 'q3', label: 'Q3' },
      { id: 'p99', label: 'P99' },
      { id: 'sd', label: isMobile ? 'D.P.' : 'Desvio Padrão' },
      { id: 'skew', label: isMobile ? 'Assim.' : 'Assimetria' },
      { id: 'kurtosis', label: isMobile ? 'Curt.' : 'Curtose' }
    ];

    return metrics.map(m => ({
      id: m.id,
      metric: m.label,
      comp1: formatValue(m.id, (competenciaRowData as any).NU_NOTA_COMP1.estatisticas[m.id]),
      comp2: formatValue(m.id, (competenciaRowData as any).NU_NOTA_COMP2.estatisticas[m.id]),
      comp3: formatValue(m.id, (competenciaRowData as any).NU_NOTA_COMP3.estatisticas[m.id]),
      comp4: formatValue(m.id, (competenciaRowData as any).NU_NOTA_COMP4.estatisticas[m.id]),
      comp5: formatValue(m.id, (competenciaRowData as any).NU_NOTA_COMP5.estatisticas[m.id]),
      total: formatValue(m.id, (competenciaRowData as any).NU_NOTA_REDACAO.estatisticas[m.id]),
    }));
  }, [isMobile]);

  const columns = useMemo(() => [
    columnHelper.accessor('metric', {
      header: isMobile ? '' : 'Medidas',
      cell: info => <span className={styles.describe_metricLabel}>{info.getValue()}</span>,
    }),
    columnHelper.accessor('comp1', { header: 'C1' }),
    columnHelper.accessor('comp2', { header: 'C2' }),
    columnHelper.accessor('comp3', { header: 'C3' }),
    columnHelper.accessor('comp4', { header: 'C4' }),
    columnHelper.accessor('comp5', { header: 'C5' }),
    columnHelper.accessor('total', { 
        header: isMobile ? 'N.T.' : 'Nota Total',
        cell: info => <strong>{info.getValue()}</strong>
    }),
  ], [isMobile]);

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
                key={`${deferredArea}-${row.original.id}`}
                row={row}
                selectedRowId={selectedRowId}
                onRowClick={setSelectedRowId}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
