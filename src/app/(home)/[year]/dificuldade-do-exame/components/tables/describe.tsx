"use client";

import { useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import styles from "./tables.module.css";
import { useHomeData } from "../../../../../../context/home_context";
import { useYearData } from "../../../../../../context/year_context";
import { TableDataItem } from "../../../../../../types/year_types";
import { clsx } from "clsx";
import { useSidebar } from "../../../../../../context/sidebar_context";

const columnHelper = createColumnHelper<TableDataItem>();

// Lista estática com a estrutura fixa de todas as medidas necessárias na tabela
const MEDIDAS_PADRAO = [
  { id: "mean", metric: "Média" },
  { id: "median", metric: "Mediana" },
  { id: "mode", metric: "Moda" },
  { id: "min", metric: "Mínima¹" },
  { id: "max", metric: "Máxima²" },
  { id: "sd", metric: "Desvio Padrão" },
  { id: "q1", metric: "1º quartil" },
  { id: "q3", metric: "3º quartil" },
  { id: "p99", metric: "Percentil 99" },
  { id: "skew", metric: "Assimetria" },
  { id: "kurtosis", metric: "Curtose" },
];
export function DescribeTable() {
  const { deferredArea, selectedRowId, setSelectedRowId } = useHomeData();
  const { dificuldadeDoExame, dificuldadeDoExameAux } = useYearData();
  const { isMobile } = useSidebar();
  const describeRowData = dificuldadeDoExameAux.describeRowData;
  const describeDifData = dificuldadeDoExame.describeDifData;
  const stableData = useMemo<TableDataItem[]>(() => {
    const hasData = describeRowData?.data && describeRowData.data.length > 0;

    return MEDIDAS_PADRAO.map((medida) => {
      // Se houver dados carregados, procura a linha correspondente pelo ID
      const realRow = hasData
        ? describeRowData.data.find((item) => item.id === medida.id)
        : null;

      return {
        id: medida.id,
        metric: realRow?.metric || medida.metric,
        nota: !describeDifData ? "---" : realRow?.nota || "---",
        acerto: !describeDifData ? "---" : realRow?.acerto || "---",
      };
    });
  }, [describeRowData, describeDifData]);

  const formatCellText = (value: number | string) => {
    if (value === "---" || value === undefined || value === null) return "---";
    const num = Number(value);
    if (!isNaN(num) && num === 0) {
      return "0";
    }
    return value;
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("metric", {
        header: "Medidas",
        cell: (info) => (
          <span className={styles.describe_metricLabel}>{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("nota", {
        header: "Notas",
        cell: (info) => (
          <span className={styles.describe_valueText}>
            {formatCellText(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("acerto", {
        header: "Acertos",
        cell: (info) => (
          <span className={styles.describe_valueText}>
            {formatCellText(info.getValue())}
          </span>
        ),
      }),
    ],
    [],
  );

  // eslint-disable-next-line
  const table = useReactTable({
    data: stableData, // Usa a lista de dados protegida contra quebras
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className={styles.describe_wrapper}>
      <div className={styles.describe_cabecalho}>
        <h3 className={styles.describe_title}>
          Descrição estatística de {deferredArea}
        </h3>
      </div>
      <div className={styles.describe_container}>
        <table className={styles.describe_table}>
          <thead className={styles.describe_thead}>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className={styles.describe_tr}>
                {hg.headers.map((header) => (
                  <th key={header.id} className={styles.describe_th}>
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
              <tr
                key={`${deferredArea}-${row.id}`}
                className={clsx(
                  styles.describe_tr,
                  selectedRowId === row.original.id && styles.row_selected,
                )}
                onClick={() => {
                  setSelectedRowId(row.original.id);
                  const topo = document.getElementById("topo-pagina");
                  if (topo && isMobile) {
                    topo.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={styles.describe_td}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.describe_footer}>
          <div>
            <span>¹ Prova de referência: </span>
            {describeRowData?.cor_min_ref || "---"} (cod:{" "}
            {describeRowData?.cod_min_ref || "---"})
          </div>
          <div>
            <span>² Prova de referência: </span>
            {describeRowData?.cor_max_ref || "---"} (cod:{" "}
            {describeRowData?.cod_max_ref || "---"})
          </div>
          <div>
            (n ={" "}
            {describeRowData?.n
              ? describeRowData.n.toLocaleString("pt-BR")
              : "0"}
            )
          </div>
        </div>
      </div>
    </div>
  );
}
