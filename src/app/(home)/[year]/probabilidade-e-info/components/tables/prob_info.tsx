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

import InputShell from "../../../../../../components/tsx/input_shell";
import { useHomeData } from "../../../../../../context/home_context";
import { useYearData } from "../../../../../../context/year_context";

type TableRow = {
  id: number;
  posicao: number;
  isAbandonado: boolean;
  estado: "acerto" | "erro";
  probabilidade: number | null;
  informacao: number | null;
};

export default function ProbsInfoTable() {
  const { chartProps } = useHomeData();
  const { proficienciaAtual } = chartProps;
  const {
    constantesData,
    probInfoData,
    selectedItems,
    activeCodes,
    abandonadosCodes,
  } = useYearData();

  const probLabels = probInfoData.probLabels;
  const probData = probInfoData.probData;
  const infoData = probInfoData.infoData;
  const [sorting, setSorting] = useState<SortingState>([
    { id: "posicao", desc: false },
  ]);
  const columnHelper = createColumnHelper<TableRow>();
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 800 : false,
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 800);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const columns = useMemo(
    () => [
      // GRUPO 1: APENAS RÓTULO
      columnHelper.group({
        id: "identificacao_grupo",
        header: "Identificação",
        columns: [
          columnHelper.accessor("posicao", {
            header: "Item",
            cell: (info) => <strong>{info.getValue()}</strong>,
          }),
          columnHelper.accessor("id", {
            header: "Código",
            cell: (info) => (
              <span style={{ fontSize: "0.9rem", color: "#888" }}>
                {info.getValue()}
              </span>
            ),
          }),
        ],
      }),
      // GRUPO 2: APENAS RÓTULO
      columnHelper.group({
        id: "probabilidade_grupo",
        header: "Probabilidade",
        columns: [
          columnHelper.accessor("estado", {
            header: "Estado",
            cell: (info) => (
              <span style={{ fontSize: "0.8rem", color: "#888" }}>
                {info.getValue()?.toUpperCase()}
              </span>
            ),
          }),
          columnHelper.accessor("probabilidade", {
            header: "Prob¹",
            cell: (info) => {
              const val = info.getValue();
              const { estado, isAbandonado } = info.row.original;
              const color = isAbandonado
                ? "#888"
                : estado === "erro"
                  ? "#ff4d4f"
                  : "#52c41a";
              return (
                <span style={{ fontWeight: "350", color }}>
                  {val !== null ? `${(val * 100).toFixed(1)}%` : "N/A"}
                </span>
              );
            },
          }),
        ],
      }),
      // GRUPO 3: APENAS RÓTULO
      columnHelper.group({
        id: "informacao_grupo",
        header: isMobile ? "Info" : "Informação",
        columns: [
          columnHelper.accessor("informacao", {
            header: "Valor²",
            cell: (info) => {
              const val = info.getValue();
              return (
                <span style={{ fontWeight: "350", color: "#888" }}>
                  {val !== null ? val : "N/A"}
                </span>
              );
            },
          }),
        ],
      }),
    ],
    [columnHelper, isMobile],
  );

  const data = useMemo(() => {
    if (!activeCodes.length || !chartProps) return [];
    const thetaAlvo = (proficienciaAtual - constantesData.d) / constantesData.k;
    const closestIndex = probLabels?.reduce((prevIdx, currVal, currIdx) => {
      return Math.abs(currVal - thetaAlvo) <
        Math.abs(probLabels[prevIdx] - thetaAlvo)
        ? currIdx
        : prevIdx;
    }, 0);

    return activeCodes.map((code) => {
      const itemKey = String(code);
      const status = selectedItems[code]?.status;
      const probBruta = probData?.[itemKey]
        ? probData[itemKey][closestIndex]
        : null;
      const infoBruta = infoData?.[itemKey]
        ? infoData[itemKey][closestIndex]
        : null;
      const isAbandonado = abandonadosCodes?.has(code);

      return {
        id: code,
        posicao: selectedItems[code]?.posicao,
        estado: status,
        isAbandonado: isAbandonado,
        probabilidade:
          probBruta !== null
            ? status === "erro"
              ? 1 - probBruta
              : probBruta
            : null,
        informacao: infoBruta !== null ? Number(infoBruta.toFixed(2)) : null,
      };
    });
  }, [
    abandonadosCodes,
    infoData,
    activeCodes,
    chartProps,
    selectedItems,
    proficienciaAtual,
    probData,
    constantesData,
    probLabels,
  ]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <section className={styles.probtable_container}>
      <h3 className={styles.card_title}>
        Tabela de probabilidade e informação do item
      </h3>
      <p className={styles.card_subtitle_p}>
        {`Probabilidade¹ e informação² estimadas do item ` +
          `para a proficiência ${proficienciaAtual}, segundo ` +
          `os parâmetros de chute, dificuldade e discriminação.`}
      </p>
      <InputShell />
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
                    className={
                      `${styles.probtable_th} ` +
                      `${isGroup ? styles.probtable_group_th : ""}`
                    }
                    onClick={
                      canSort
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    <div
                      className={styles.probtable_th_item}
                      style={{
                        cursor: canSort ? "pointer" : "default",
                      }}
                    >
                      {!header.isPlaceholder &&
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}

                      {canSort && (
                        <span style={{ fontSize: "10px" }}>
                          {{ asc: " 🔼", desc: " 🔽" }[
                            header.column.getIsSorted() as string
                          ] ?? null}
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
        ¹ <strong>Probabilidade:</strong> Chance estimada de acerto. No ENEM,
        errar itens para os quais se tem alta probabilidade de acerto tende a
        reduzir a nota devido à inconsistência pedagógica. <br />²{" "}
        <strong>Informação:</strong> Quanto mais informação um item fornece,
        menos incerteza se tem sobre a nota estimada. Em geral, essa incerteza é
        maior nas extremidados da régua do ENEM.
      </div>
    </section>
  );
}
