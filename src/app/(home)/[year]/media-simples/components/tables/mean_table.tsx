"use client";

import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

import styles from "./tables.module.css";
import { useYearData } from "../../../../../../context/year_context";
import { useChartTheme } from "../../../../../../hooks/use_chart_theme";
import clsx from "clsx";
import { useSidebar } from "../../../../../../context/sidebar_context";

type RankingRow = {
  ranking: number;
  media: number;
};

export default function RankingTable() {
  const { meanData, setActiveRanking } = useYearData();
  const { isMobile } = useSidebar();
  const columnHelper = createColumnHelper<RankingRow>();
  const { textColor } = useChartTheme();

  const activeRanking = meanData.activeRanking;
  const top2000Data = meanData.top2000Data;

  const columns = useMemo(
    () => [
      columnHelper.accessor("ranking", {
        header: "Ranking",
        cell: (info) => <span>#{info.getValue()}º</span>,
      }),
      columnHelper.accessor("media", {
        header: "Média Simples",
        cell: (info) => (
          <span style={{ color: textColor, fontWeight: "300" }}>
            {info.getValue().toFixed(2)}
          </span>
        ),
      }),
    ],
    [columnHelper, textColor],
  );

  // eslint-disable-next-line
  const table = useReactTable({
    data: top2000Data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <section className={styles.meantable_container}>
      <div className={styles.meantable_cabecalho}>
        <div>
          <h3 className={styles.card_title}>Top 2.500 Médias Simples</h3>
        </div>
      </div>

      {/* Container que limita a altura pela tela (viewport) */}
      <div className={styles.table_scroll_y}>
        <table className={styles.meantable_table}>
          <thead className={styles.meantable_thead_sticky}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className={styles.meantable_th}>
                    <div className={styles.th_content}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              const currentRank = row.original.ranking;
              const isSelected = activeRanking === currentRank;
              return (
                <tr
                  key={row.id}
                  className={clsx(
                    styles.meantable_tr,
                    isSelected && styles.row_active,
                  )}
                  onClick={() => {
                    setActiveRanking(currentRank);
                    const topo = document.getElementById("topo-pagina");
                    if (topo && isMobile) {
                      topo.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className={styles.meantable_td}>
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
