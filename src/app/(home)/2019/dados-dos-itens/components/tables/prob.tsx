"use client";

import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import styles from "./tables.module.css"

import Probtrace from "../../../json/probtrace_2019.json";
import constantes from "../../../../json/constantes.json";
import { useChartTheme } from "../../../../../../hooks/chart_theme";

type ItemStatus = 'acerto' | 'erro';
type ItemData = {
  status: ItemStatus;
  posicao: number; // Aqui guardamos o CO_POSICAO
};

interface ProbsTableProps {
  logic: any;
  activeCodes: number[];
  area: string;
  itemSelection: Record<number, ItemData>;
}

// Tipo para os dados da linha
type ProbRow = {
  id: number;
  estado: "acerto" | "erro";
  probabilidade: number | null;
};

export default function ProbsTable({ logic, activeCodes, area, itemSelection }: ProbsTableProps) {
  
  const {gridColor} = useChartTheme();

  const columnHelper = createColumnHelper<ProbRow>();
  const { proficienciaAtual, selectedLabel } = logic;
  const data = useMemo(() => {
    if (!activeCodes.length || !logic) return [];
    const [co_p_selected] = selectedLabel.split("_");
    const provaData = (Probtrace.datasets as any)[co_p_selected];
    const areaIdx = constantes.area.indexOf(area || "LC");
    const d = constantes.d[areaIdx];
    const k = constantes.k[areaIdx];
    const thetaAlvo = (proficienciaAtual - d) / k;
    const thetaLabels = Probtrace.theta_labels;
    const closestIndex = thetaLabels.reduce((prevIdx, currVal, currIdx) => {
      return Math.abs(currVal - thetaAlvo) < Math.abs(thetaLabels[prevIdx] - thetaAlvo)
        ? currIdx
        : prevIdx;
    }, 0);

    // Mapeia os códigos ativos para o formato da TanStack
    return activeCodes.map((code) => {
      const itemKey = String(code);
      const status = itemSelection[code]?.status || "acerto";
      const quadraturas = provaData?.[itemKey];
      const probBruta = quadraturas ? quadraturas[closestIndex] : null;

      return {
        id: code,
        estado: status,
        probabilidade: probBruta !== null 
            ? (status === "erro" ? 1 - probBruta : probBruta) 
            : null,
      };
    });
  }, [activeCodes, logic, area, itemSelection, selectedLabel, proficienciaAtual]);

  // 2. Definição das Colunas
  const columns = useMemo(() => [
    columnHelper.accessor("id", {
      header: "ITEM",
      cell: (info) => <strong>{info.getValue()}</strong>,
    }),
    columnHelper.accessor("estado", {
      header: "ESTADO",
      cell: (info) => (
        <span style={{ fontSize: "0.75rem", color: "#888" }}>
          {info.getValue().toUpperCase()}
        </span>
      ),
    }),
    columnHelper.accessor("probabilidade", {
      header: "~PROB.",
      cell: (info) => {
        const val = info.getValue();
        const status = info.row.original.estado;
        const color = status === "erro" ? "#ff4d4f" : "#52c41a";
        return (
          <span style={{ fontWeight: "bold", color }}>
            {val !== null ? `${(val * 100).toFixed(1)}%` : "N/A"}
          </span>
        );
      },
    }),
  ], [columnHelper]);

  // 3. Inicialização da Tabela
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (activeCodes.length === 0) {
    return (
      <section className={styles.probtable_fallback}>
        Selecione itens na tabela para ver as probabilidades de acerto ou erro para uma determinada proficiência.
      </section>
    );
  }

  return (
    <section className={styles.probtable_container}>
      <div className={styles.probtable_proef}>
        <strong>Proficiência:</strong> {Math.round(proficienciaAtual)}
      </div>
      <table className={styles.probtable_table}>
        <thead className={styles.probtable_thead}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} style={{ borderBottom: `1px solid ${gridColor}`, fontSize: "0.8rem", color: "#666" }}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} style={{ textAlign: header.id === "id" ? "left" : "right", padding: "8px" }}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} style={{ borderBottom: `1px solid ${gridColor}`}}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} style={{ textAlign: cell.column.id === "id" ? "left" : "right", padding: "8px" }}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}