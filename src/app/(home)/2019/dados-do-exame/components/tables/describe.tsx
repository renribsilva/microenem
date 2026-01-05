'use client'

import { useMemo } from 'react';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import styles from "./tables.module.css";
import { useDescribe } from '../../../../../../hooks/use_describe_data';

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
  "mean", 
  "median", 
  "mode", 
  "sd", 
  "min", 
  "max", 
  "q1", 
  "q3", 
  "p99",
  "skew", 
  "kurtosis"];

const columnHelper = createColumnHelper<any>();

export function DescribeTable({ area, onRowClick, selectedRowId }: { 
  area: string, 
  onRowClick: (data: any) => void,
  selectedRowId?: string 
}) {

  const { describeData } = useDescribe(area);

  const tableData = useMemo(() => {
    if (!describeData) return [];
    return rowOrder
      .filter(key => describeData.notas[key] !== undefined)
      .map((key) => {
        const valNota = describeData.notas[key];
        const valAcerto = describeData.acertos?.[key];
        const formatNotas = (val: any) => {
          if (typeof val !== "number") return val;
          // Se for Skewness ou Kurtosis, força 2 casas decimais
          if (key === 'skew' || key === 'kurtosis') {
            return val.toLocaleString('pt-BR', { 
              maximumFractionDigits: 2, 
              minimumFractionDigits: 0 
            });
          }
          return val.toLocaleString('pt-BR', { 
            maximumFractionDigits: 1, 
            minimumFractionDigits: 0
          });
        };
        const formatAcertos = (val: any) => {
          if (typeof val !== "number") return val;
          
          // Se for Skewness ou Kurtosis, força 2 casas decimais
          if (key === 'skew' || key === 'kurtosis') {
            return val.toLocaleString('pt-BR', { 
              maximumFractionDigits: 2, 
              minimumFractionDigits: 0 
            });
          }
          return val.toLocaleString('pt-BR', { 
            maximumFractionDigits: 0, 
            minimumFractionDigits: 0
          });
        };
        return {
          id: key, 
          metric: labelMap[key] || key,
          nota: formatNotas(valNota),
          acerto: formatAcertos(valAcerto)
        };
      });
  }, [describeData]);

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
              <tr key={hg.id}>
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
              <tr 
                key={row.id} 
                className={`${styles.describe_tr} ${selectedRowId === row.original.id ? styles.row_selected : ''}`}
                onClick={() => onRowClick(row.original)}
                style={{ cursor: 'pointer' }}
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className={styles.describe_td}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
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