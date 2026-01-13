"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import styles from "./tables.module.css"

import InputShell from "../../../../../../components/tsx/input_shell";
import { useHomeData } from "../../../../../../context/home_context";
import { useNineteenData } from "../../../../../../context/nineteen_context";

type TableRow = {
  id: number;
  posicao: number;
  estado: "acerto" | "erro";
  probabilidade: number | null;
  respondentes: number;
  freq_acerto: number;
  freq_erro: number;
  freq_branco: number;
  freq_dupla_marcacao: number;
};

export default function ProbsInfoTable() {

  const { chartLogic } = useHomeData();
  const { proficienciaAtual } = chartLogic;
  const { k, d, probData, probLabels, selectedItems, activeCodes, scoreData } = useNineteenData();
  
  const [sorting, setSorting] = useState<SortingState>([{ id: "posicao", desc: false }]);

  const columnHelper = createColumnHelper<TableRow>();

  const columns = useMemo(() => [
    // GRUPO 1: APENAS RÓTULO
    columnHelper.group({
      id: 'identificacao_grupo',
      header: 'Identificação',
      columns: [
        columnHelper.accessor("posicao", {
          header: "Item",
          cell: (info) => <strong>{info.getValue()}</strong>,
        }),
        columnHelper.accessor("id", {
          header: "Código",
          cell: (info) => <span style={{ fontSize: "0.9rem", color: "#888" }}>{info.getValue()}</span>,
        }),
      ]
    }),
    // GRUPO 2: APENAS RÓTULO
    columnHelper.group({
      id: 'probabilidade_grupo',
      header: 'Probabilidade',
      columns: [
        columnHelper.accessor("estado", {
          header: "Estado",
          cell: (info) => <span style={{ fontSize: "0.8rem", color: "#888" }}>{info.getValue()?.toUpperCase()}</span>,
        }),
        columnHelper.accessor("probabilidade", {
          header: "Prob*",
          cell: (info) => {
            const val = info.getValue();
            const color = info.row.original.estado === "erro" ? "#ff4d4f" : "#52c41a";
            return (
              <span style={{ fontWeight: "350", color }}>
                {val !== null ? `${(val * 100).toFixed(1)}%` : "N/A"}
              </span>
            );
          },
        }),
      ]
    }),
    // GRUPO 3: APENAS RÓTULO
    columnHelper.group({
      id: 'score_grupo',
      header: 'Erros e acertos',
      columns: [
        columnHelper.accessor("respondentes", {
          header: "n",
          cell: (info) => <span style={{ fontSize: "0.8rem", color: "#888" }}>{info.getValue()}</span>,
        }),
        columnHelper.accessor("freq_acerto", {
          header: "Acertaram",
          cell: (info) => <span style={{ fontSize: "0.8rem", color: "#888" }}>{info.getValue()}%</span>,
        }),
        columnHelper.accessor("freq_erro", {
          header: "Erraram",
          cell: (info) => <span style={{ fontSize: "0.8rem", color: "#888" }}>{info.getValue()}%</span>,
        }),
        columnHelper.accessor("freq_branco", {
          header: "Em branco",
          cell: (info) => <span style={{ fontSize: "0.8rem", color: "#888" }}>{info.getValue()}%</span>,
        }),
        columnHelper.accessor("freq_dupla_marcacao", {
          header: "Dupla marcação",
          cell: (info) => <span style={{ fontSize: "0.8rem", color: "#888" }}>{info.getValue()}%</span>,
        }),
      ]
    })
  ], [columnHelper]);

  const data = useMemo(() => {
    if (!activeCodes.length || !chartLogic) return [];
    const thetaAlvo = (proficienciaAtual - d) / k;
    const closestIndex = probLabels?.reduce((prevIdx, currVal, currIdx) => {
      return Math.abs(currVal - thetaAlvo) < Math.abs(probLabels[prevIdx] - thetaAlvo) ? currIdx : prevIdx;
    }, 0);

    return activeCodes.map((code) => {
      const itemKey = String(code);
      const status = selectedItems[code]?.status;
      const probBruta = probData?.[itemKey] ? probData[itemKey][closestIndex] : null;
      // Acessa os dados do item com segurança
      const itemScores = scoreData[code] || {};
      
      // Garante que se a chave (0, 1, 7, 8, 9) não existir, o valor seja 0
      const acertos   = Number(itemScores["1"] || 0);
      const erros     = Number(itemScores["0"] || 0);
      const marcDupla = Number(itemScores["7"] || 0);
      const brancos   = Number(itemScores["8"] || 0);

      const respondentesTotal = acertos + erros + marcDupla + brancos

      const safeDiv = (valor) => respondentesTotal > 0 ? ((valor / respondentesTotal) * 100).toFixed(1) : "0.0";
      
      return {
        id: code,
        posicao: selectedItems[code]?.posicao,
        estado: status,
        probabilidade: probBruta !== null ? (status === "erro" ? 1 - probBruta : probBruta) : null,
        respondentes: respondentesTotal,
        freq_acerto: safeDiv(acertos),
        freq_erro: safeDiv(erros),
        freq_branco: safeDiv(brancos),
        freq_dupla_marcacao: safeDiv(marcDupla)
      };
    });
  }, [activeCodes, chartLogic, selectedItems, proficienciaAtual, k, d, probData, probLabels]);
  
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // if (activeCodes.length === 0) return <section className={styles.probtable_fallback}>Selecione itens na tabela para vizualizar suas probabilidades e desempenho.</section>;

  return (
    <section className={styles.probtable_container}>
      <InputShell/>
      <table className={styles.probtable_table}>
        <thead className={styles.probtable_thead}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className={styles.probtable_tr}>
              {headerGroup.headers.map((header) => {
                // É um grupo se tiver colunas filhas
                const isGroup = header.column.columns.length > 0;
                const canSort = header.column.getCanSort() && !isGroup;

                return (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    /* Aplica a classe da linha apenas se for grupo */
                    className={`${styles.probtable_th} ${isGroup ? styles.probtable_group_th : ""}`}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                  >
                    <div 
                      className={styles.probtable_th_item} 
                      style={{ 
                        cursor: canSort ? 'pointer' : 'default',
                      }}
                    >
                      {!header.isPlaceholder && flexRender(header.column.columnDef.header, header.getContext())}

                      {canSort && (
                        <span style={{ fontSize: '10px' }}>
                          {{ asc: " 🔼", desc: " 🔽" }[header.column.getIsSorted() as string] ?? null}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className={styles.probtable_tr}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className={styles.probtable_td}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.table_footer}>
        * Probabilidades aproximadas relacionadas à proficiência destacada. Digite um novo valor ou arraste
        o botão para obter um novo traço de probabilidades.
      </div>
    </section>
  );
}