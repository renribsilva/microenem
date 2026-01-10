'use client'

import { useMemo, memo } from 'react';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import styles from "./tables.module.css";
import { useDescribe } from '../../../../../../hooks/use_describe_data';

/**
 * 1. Constantes e Helpers fora do componente
 * Isso evita que sejam recriados a cada renderização, economizando memória.
 */
const labelMap: Record<string, string> = {
  mean: "Média", 
  median: "Mediana", 
  mode: "Moda", 
  sd: "Desvio Padrão",
  min: "Mínima", 
  max: "Máxima", 
  skew: "Assimetria", 
  kurtosis: "Curtose",
  q1: "1º quartil", 
  q3: "3º quartil", 
  p99: "Percentil 99"
};

const rowOrder = [
  "mean", "median", "mode", "min", "max", "sd", "q1", "q3", "p99", "skew", "kurtosis"
];

const formatValue = (key: string, val: any, type: 'nota' | 'acerto') => {
  if (typeof val !== "number") return val;
  const isSpecial = key === 'skew' || key === 'kurtosis';
  
  return val.toLocaleString('pt-BR', { 
    maximumFractionDigits: isSpecial ? 2 : (type === 'nota' ? 1 : 0), 
    minimumFractionDigits: 0 
  });
};

const columnHelper = createColumnHelper<any>();

/**
 * 2. Componente de Linha Memoizado
 * Crucial para performance: ao clicar em uma linha, apenas a linha que era ativa
 * e a nova linha ativa são renderizadas novamente.
 */
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
}, (prev, next) => {
  // Regra de memoização: só re-renderiza se o status de seleção desta linha mudou
  const wasSelected = prev.selectedRowId === prev.row.original.id;
  const isSelected = next.selectedRowId === next.row.original.id;
  return wasSelected === isSelected && prev.row.id === next.row.id;
});

TableRow.displayName = 'TableRow';

/**
 * 3. Componente Principal
 */
export function DescribeTable({ area, onRowClick, selectedRowId }: { 
  area: string, 
  onRowClick: (data: any) => void,
  selectedRowId?: string 
}) {
  const { describeData } = useDescribe(area);

  // Formatação dos dados memorizada
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
  }, [describeData]);

  // Definição de colunas memorizada
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
                key={row.id}
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