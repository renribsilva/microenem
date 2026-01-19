"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

import styles from "./tables.module.css";
import { useHomeData } from "../../../../../../context/home_context";
import { useNineteenData } from "../../../../../../context/nineteen_context";
import Dropdown from "../../../../../../components/tsx/dropdown";

type TableRow = {
  id: number;
  posicao: number;
  respondentes: number;
  freq_acerto: string;
  freq_erro: string;
  freq_branco: string;
  freq_dupla_marcacao: string;
  abandonado: boolean;
  param_b: number
};

export default function ScoreTable() {
  const { chartLogic, deferredArea } = useHomeData();
  const { selectedLabel } = chartLogic;
  const { 
    scoreData, 
    getCodeByLabel, 
    getParamByLabel,
    abandonadosCodes, 
    lastItemActivate,
    setLastItemActivate,
    setLastItemActivateNum
  } = useNineteenData();
  
  const [sorting, setSorting] = useState<SortingState>([{ id: "posicao", desc: false }]);
  const columnHelper = createColumnHelper<TableRow>();
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 800 : false);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 800);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const columns = useMemo(() => {
    // Definimos as sub-colunas de Identificação
    const idCols = [
      columnHelper.accessor("posicao", {
        header: "Item",
        cell: (info) => <strong>{info.getValue()}</strong>,
      }),
      // Só inclui Código se não for mobile
      ...(!isMobile ? [
        columnHelper.accessor("id", {
          header: "Código",
          cell: (info) => <span style={{ fontSize: "0.85rem", color: "#888" }}>{info.getValue() || "—"}</span>,
        })
      ] : []),
      // Só inclui Abandonado se não for mobile
      ...(!isMobile ? [
        columnHelper.accessor("abandonado", {
          header: "Aband?",
          cell: (info) => {
            const val = info.getValue();
            return (
              <span style={{ fontSize: "0.85rem", color: val ? "#ff4b4b" : "#888" }}>
                {val ? "Sim" : "Não"}
              </span>
            );
          },
        })
      ] : []),
    ];

    // Definimos as sub-colunas de Score
    const scoreCols = [
      columnHelper.accessor("respondentes", {
        header: "n",
        cell: (info) => {
          const val = info.getValue();

          // Formatador para números compactos (ex: 1,5 mi)
          const compactFormatter = new Intl.NumberFormat('pt-BR', {
            notation: "compact",
            compactDisplay: "short",
            maximumFractionDigits: 1
          });

          return (
            <span style={{ fontSize: "0.8rem", color: "#888" }}>
              {isMobile 
                ? compactFormatter.format(val).toLowerCase() 
                : val.toLocaleString('pt-BR')}
            </span>
          );
        },
      }),
      columnHelper.accessor("freq_acerto", {
        header: "Acerto",
        cell: (info) => (
          <span style={{ fontSize: "0.85rem", color: "#52c41a", fontWeight: "500" }}>
            {info.getValue()}%
          </span>
        ),
      }),
      columnHelper.accessor("freq_erro", { 
        header: "Erro", 
        cell: (info) => (
          <span style={{ fontSize: "0.85rem", color: "#ff4b4b", fontWeight: "500" }}>
            {info.getValue()}%
          </span>
        )
      }),
      // Só inclui Branco e Dupla se não for mobile
      ...(!isMobile ? [
        columnHelper.accessor("freq_branco", { 
          header: "Branco", 
          cell: (info) => <span style={{ color: "#888" }}>{info.getValue()}%</span> 
        }),
        columnHelper.accessor("freq_dupla_marcacao", { 
          header: "Dupla", 
          cell: (info) => <span style={{ color: "#888" }}>{info.getValue()}%</span> 
        }),
      ] : []),
    ];

    const paramCols = [
      // Só inclui Código se não for mobile
      ...(!isMobile ? [
        columnHelper.accessor("param_b", {
          header: "b*",
          cell: (info) => <span style={{ fontSize: "0.85rem", color: "#888" }}>{info.getValue() || "—"}</span>,
        })
      ] : []),
    ];

    return [
      columnHelper.group({
        id: 'identificacao_grupo',
        header: isMobile ? 'Item' : 'Identificação',
        columns: idCols,
      }),
      ...(!isMobile ? [
        columnHelper.group({
        id: 'param_grupo',
        header: isMobile ? 'Param' : 'Parâmetro',
        columns: paramCols,
        })] : []
      ),
      columnHelper.group({
        id: 'score_grupo',
        header: isMobile ? 'Frequência' : 'Frequência de Respostas',
        columns: scoreCols,
      })
    ];
  }, [columnHelper, isMobile]);

  const data = useMemo(() => {

    const ranges: Record<string, { start: number; end: number }> = {
      "LC": { start: 1, end: 45 },
      "CH": { start: 46, end: 90 },
      "CN": { start: 91, end: 135 },
      "MT": { start: 136, end: 180 },
    };

    const { start, end } = ranges[deferredArea] || { start: 1, end: 45 };
    
    // Gera o range e mapeia os dados
    return Array.from({ length: end - start + 1 }, (_, i) => {
      const num = start + i;
      const code = getCodeByLabel(num, selectedLabel);
      const param = getParamByLabel(num, selectedLabel);
      const itemScores = scoreData?.[code]?.counts || {};
      
      const v1 = Number(itemScores["1"] ?? 0);
      const v0 = Number(itemScores["0"] ?? 0);
      const v7 = Number(itemScores["7"] ?? 0);
      const v8 = Number(itemScores["8"] ?? 0);

      const total = v1 + v0 + v7 + v8;
      const safeDiv = (v: number) => total > 0 ? ((v / total) * 100).toFixed(1) : "0.0";
      
      return {
        id: code,
        posicao: num,
        abandonado: abandonadosCodes?.has(code) || false,
        respondentes: total,
        freq_acerto: safeDiv(v1),
        freq_erro: safeDiv(v0),
        freq_branco: safeDiv(v8),
        freq_dupla_marcacao: safeDiv(v7),
        param_b: param
      };
    });
  }, [scoreData, deferredArea, selectedLabel, getCodeByLabel, abandonadosCodes]);

  useEffect(() => {
    if (data.length > 0) {
      setLastItemActivate(data[0].id);
      setLastItemActivateNum(data[0].posicao);
    }
  }, [deferredArea, selectedLabel]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // --- LÓGICA PARA INICIAR COM O PRIMEIRO ATIVO ---
  useEffect(() => {
    if (data.length > 0 && !lastItemActivate) {
      setLastItemActivate(data[0].id);
      setLastItemActivateNum(1);
    }
  }, [data, lastItemActivate, setLastItemActivate, setLastItemActivateNum]);

  // if (activeCodes.length === 0) return <section className={styles.probtable_fallback}>Selecione itens na tabela para vizualizar suas probabilidades e desempenho.</section>;
  
  return (
    <section className={styles.probtable_container}>
      <div className={styles.probtable_cabecalho}>
        <div>
          <h3 className={styles.card_title}>Tabela de frequência de respostas</h3>
          <p className={styles.card_subtitle_p}>
            Frequência relativa de acertos e erros observada em cada item dos exames.
          </p>
        </div>
        <Dropdown />
      </div>
      <table className={styles.probtable_table}>
        <thead className={styles.probtable_thead}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr 
              key={headerGroup.id} 
              className={styles.probtable_tr}
            >
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
          {table.getRowModel().rows.map((row, index) => {
            const isAbandonado = row.original.abandonado;
            const itemId = row.original.id; 
            
            // VERIFICA SE É O ITEM ATIVO
            const isActive = lastItemActivate === itemId;

            return (
              <tr 
                key={row.id} 
                className={`
                  ${styles.probtable_tr} 
                  ${isAbandonado ? styles.row_abandonado : ""} 
                  ${isActive ? styles.row_active : ""}
                `}
                onClick={() => {
                  setLastItemActivate(itemId);
                  setLastItemActivateNum(row.original.posicao); 
                }}
                style={{ 
                  backgroundColor: isActive 
                    ? "rgba(0, 227, 150, 0.1)"
                    : isAbandonado ? "rgba(255, 75, 75, 0.05)" : "transparent",
                  borderLeft: isActive
                    ? "4px solid #00E396" 
                    : isAbandonado ? "4px solid #ff4b4b" : "4px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.2s ease" 
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={styles.probtable_td}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className={styles.table_footer}>
        * Parâmetro de dificuldade: associado à dificuldade do item, sendo que quanto maior seu valor, mais difícil é o item.
      </div>
    </section>
  );
}