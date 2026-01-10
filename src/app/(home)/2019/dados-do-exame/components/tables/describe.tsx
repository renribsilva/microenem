'use client'

import { useMemo, memo } from 'react';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import styles from "./tables.module.css";
import { useDescribe } from '../../../../../../hooks/use_describe_data';

const labelMap: Record<string, string> = {
  mean: "Média", median: "Mediana", mode: "Moda", sd: "Desvio Padrão",
  min: "Mínima", max: "Máxima", skew: "Assimetria", kurtosis: "Curtose",
  q1: "1º quartil", q3: "3º quartil", p99: "Percentil 99"
};

const rowOrder = ["mean", "median", "mode", "min", "max", "sd", "q1", "q3", "p99", "skew", "kurtosis"];

const formatValue = (key: string, val: any, type: 'nota' | 'acerto') => {
  if (typeof val !== "number") return val;
  const isSpecial = key === 'skew' || key === 'kurtosis';
  return val.toLocaleString('pt-BR', { 
    maximumFractionDigits: isSpecial ? 2 : (type === 'nota' ? 1 : 0), 
    minimumFractionDigits: 0 
  });
};

const columnHelper = createColumnHelper<any>();


const TableRow = memo(({ row, selectedRowId, onRowClick }: any) => {
  const isSelected = selectedRowId === row.original.id;
  
  return (
    <tr 
      className={`${styles.describe_tr} ${isSelected ? styles.row_selected : ''}`}
      onClick={() => onRowClick(row.original)}
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

export function DescribeTable({ area, onRowClick, selectedRowId }: { 
  area: string, 
  onRowClick: (data: any) => void,
  selectedRowId?: string 
}) {
  // O hook useDescribe DEVE estar retornando dados novos quando a area muda
  const { describeData } = useDescribe(area);

  const tableData = useMemo(() => {
    if (!describeData?.notas) return [];
    return rowOrder
      .filter(key => describeData.notas[key] !== undefined)
      .map((key) => ({
        id: key, 
        metric: labelMap[key] || key,
        nota: formatValue(key, describeData.notas[key], 'nota'),
        acerto: formatValue(key, describeData.acertos?.[key], 'acerto')
      }));
  }, [describeData, area]); // Adicionado area como dependência por segurança

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
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!describeData?.notas) return null;

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
                key={`${area}-${row.id}`} // KEY COM AREA PARA FORÇAR RE-RENDER NA TROCA DE ABA
                row={row}
                selectedRowId={selectedRowId}
                onRowClick={onRowClick}
              />
            ))}
          </tbody>
        </table>
        <div className={styles.describe_footer}>
          n = {describeData.notas.n.toLocaleString('pt-BR')}
        </div>
      </div>
    </div>
  );
}