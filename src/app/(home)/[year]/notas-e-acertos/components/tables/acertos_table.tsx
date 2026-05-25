"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  flexRender,
  createColumnHelper,
  VisibilityState,
} from "@tanstack/react-table";

import styles from "./tables.module.css";
import { useYearData } from "../../../../../../context/year_context";
import { useHomeData } from "../../../../../../context/home_context";
import Dropdown from "../../../../../../components/tsx/dropdown";

type TableRow = {
  id: number;
  n: number;
  mean: number;
  sd: number;
  min: number;
  max: number;
  skew: number;
  kurtosis: number;
};

export default function AcertosTable() {
  const { acertosData, acertosNum, setAcertosNum } = useYearData();
  const [sorting, setSorting] = useState<SortingState>([
    { id: "id", desc: false },
  ]);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 800;
      setColumnVisibility({
        n: !isMobile, // Adicionado N aqui
        skew: !isMobile,
        kurtosis: !isMobile,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const columnHelper = createColumnHelper<TableRow>();

  useEffect(() => {
    if (acertosNum === null || acertosNum === undefined) {
      setAcertosNum(0);
    }
  }, [setAcertosNum, acertosNum]);

  const columns = useMemo(
    () => [
      columnHelper.group({
        id: "identificacao_grupo",
        header: "Score",
        columns: [
          columnHelper.accessor("id", {
            header: "Acertos",
            cell: (info) => <strong>{info.getValue()}</strong>,
          }),
          columnHelper.accessor("n", {
            id: "n", // ID necessário para a visibilidade
            header: "n",
            cell: (info) => {
              const val = info.getValue();
              return (
                <span style={{ fontSize: "0.85rem", color: "#888" }}>
                  {val ? val.toLocaleString() : 0}
                </span>
              );
            },
          }),
        ],
      }),
      columnHelper.group({
        id: "score_grupo",
        header: "Estatísticas da Nota",
        columns: [
          columnHelper.accessor("min", {
            header: "Mín",
            cell: (info) =>
              info.getValue() !== 0 ? info.getValue().toFixed(1) : "—",
          }),
          columnHelper.accessor("mean", {
            header: "Média",
            cell: (info) => {
              const val = info.getValue();
              return (
                <span style={{ fontWeight: "600" }}>
                  {val !== 0 ? val.toFixed(1) : "—"}
                </span>
              );
            },
          }),
          columnHelper.accessor("max", {
            header: "Máx",
            cell: (info) =>
              info.getValue() !== 0 ? info.getValue().toFixed(1) : "—",
          }),
          columnHelper.accessor("sd", {
            header: "D.P.",
            cell: (info) => {
              const val = info.getValue();
              return (
                <span style={{ color: "#888" }}>
                  {val !== 0 ? val.toFixed(1) : "—"}
                </span>
              );
            },
          }),
          columnHelper.accessor("skew", {
            id: "skew",
            header: "Assimetria",
            cell: (info) => (
              <span style={{ color: "#888" }}>
                {info.getValue() !== 0 ? info.getValue().toFixed(1) : "—"}
              </span>
            ),
          }),
          columnHelper.accessor("kurtosis", {
            id: "kurtosis",
            header: "Curtose",
            cell: (info) => (
              <span style={{ color: "#888" }}>
                {info.getValue() !== 0 ? info.getValue().toFixed(1) : "—"}
              </span>
            ),
          }),
        ],
      }),
    ],
    [columnHelper],
  );

  const data = useMemo(() => {
    const source = acertosData || {};
    return Array.from({ length: 46 }, (_, i) => {
      const scoreKey = i.toString();
      const item = source[scoreKey] || {};
      return {
        id: i,
        n: item.n || 0,
        mean: item.mean || 0,
        sd: item.sd || 0,
        min: item.min || 0,
        max: item.max || 0,
        skew: item.skew || 0,
        kurtosis: item.kurtosis || 0,
      };
    });
  }, [acertosData]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <section className={styles.probtable_container}>
      <div className={styles.probtable_cabecalho}>
        <div>
          <h3 className={styles.card_title}>
            Estatísticas por Faixa de Acertos
          </h3>
          <p className={styles.card_subtitle_p}>
            <span>Resumo descritivo baseado no volume de acertos&nbsp;</span>
          </p>
        </div>
      </div>
      <div className={styles.table_scroll_wrapper}>
        <table className={styles.probtable_table}>
          <thead className={styles.probtable_thead}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className={styles.probtable_tr}>
                {headerGroup.headers.map((header) => {
                  const isGroup = header.column.columns.length > 0;
                  const canSort = header.column.getCanSort() && !isGroup;

                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className={`${styles.probtable_th} ${isGroup ? styles.probtable_group_th : ""}`}
                      onClick={
                        canSort
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                    >
                      <div className={styles.probtable_th_item}>
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
            {table.getRowModel().rows.map((row) => {
              const isActive = acertosNum === row.original.id;
              return (
                <tr
                  key={row.id}
                  className={`${styles.probtable_tr} ${isActive ? styles.row_active : ""}`}
                  onClick={() => setAcertosNum(row.original.id)}
                  style={{
                    backgroundColor: isActive
                      ? "rgba(0, 227, 150, 0.1)"
                      : "transparent",
                    borderLeft: isActive
                      ? "4px solid #00E396"
                      : "4px solid transparent",
                    cursor: "pointer",
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className={styles.probtable_td}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
