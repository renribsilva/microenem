"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

import styles from "./tables.module.css";
import { useYearData } from "../../../../../../context/year_context";
import { useChartTheme } from "../../../../../../hooks/use_chart_theme";
import clsx from "clsx";
import { useSidebar } from "../../../../../../context/sidebar_context";
import TDMedium from "../../../../../../components/skt/td";

type RankingRow = {
  ranking: number;
  media: number;
};

const MOCK_DATA: RankingRow[] = Array.from({ length: 20 }, (_, index) => ({
  ranking: index + 1,
  media: 0,
}));

export default function RankingTable() {
  const { meanData, setActiveRanking } = useYearData();
  const { isMobile } = useSidebar();
  const columnHelper = createColumnHelper<RankingRow>();
  const { textColor } = useChartTheme();
  const activeRanking = meanData?.activeRanking;
  const top2000Data = meanData?.top2000Data;

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isLoading = !isMounted || !top2000Data;

  const mainContainerRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const pageIndexRef = useRef(pagination.pageIndex);

  const [pageInput, setPageInput] = useState<string>("1");
  const [rankInput, setRankInput] = useState<string>("");

  // Re-calcula a página caso a altura mude (ResizeObserver)
  useEffect(() => {
    const mainEl = mainContainerRef.current;
    if (!mainEl) return;

    const updatePageSize = () => {
      const totalHeight = mainEl.clientHeight || mainEl.offsetHeight;
      const headerH = headerRef.current?.offsetHeight || 60;
      const footerH = footerRef.current?.offsetHeight || 50;
      const tableHeaderH = 40;
      const rowHeight = 37;

      const availableForRows = totalHeight - headerH - footerH - tableHeaderH;

      if (availableForRows > 50) {
        const calculatedSize = Math.max(
          5,
          Math.floor(availableForRows / rowHeight),
        );

        setPagination((prev) => {
          if (prev.pageSize === calculatedSize) return prev;

          let newPageIndex = prev.pageIndex;
          if (activeRanking && top2000Data && top2000Data.length > 0) {
            const activeIndex = top2000Data.findIndex(
              (item) => item.ranking === activeRanking,
            );
            if (activeIndex !== -1) {
              newPageIndex = Math.floor(activeIndex / calculatedSize);
            }
          }

          return {
            pageIndex: newPageIndex,
            pageSize: calculatedSize,
          };
        });
      }
    };

    const resizeObserver = new ResizeObserver(() => updatePageSize());
    resizeObserver.observe(mainEl);

    window.addEventListener("resize", updatePageSize);
    updatePageSize();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updatePageSize);
    };
  }, [activeRanking, top2000Data]);

  useEffect(() => {
    pageIndexRef.current = pagination.pageIndex;
  }, [pagination.pageIndex]);

  useEffect(() => {
    if (!activeRanking || !top2000Data || top2000Data.length === 0) return;
    const activeIndex = top2000Data.findIndex(
      (item) => item.ranking === activeRanking,
    );
    if (activeIndex !== -1) {
      const targetPageIndex = Math.floor(activeIndex / pagination.pageSize);
      if (targetPageIndex !== pageIndexRef.current) {
        setPagination((prev) => ({
          ...prev,
          pageIndex: targetPageIndex,
        }));
      }
    }
  }, [activeRanking, top2000Data, pagination.pageSize]);

  useEffect(() => {
    setPageInput(String(pagination.pageIndex + 1));
  }, [pagination.pageIndex]);

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

  const tableData = isMounted && top2000Data ? top2000Data : MOCK_DATA;

  //eslint-disable-next-line
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });

  const handlePageSubmit = () => {
    const pageNum = parseInt(pageInput, 10);
    const maxPage = table.getPageCount();

    if (isNaN(pageNum) || pageNum < 1) {
      setPageInput(String(pagination.pageIndex + 1));
      return;
    }

    const targetPage = Math.min(pageNum, maxPage);
    table.setPageIndex(targetPage - 1);
    setPageInput(String(targetPage));
  };

  const handleRankSubmit = () => {
    const rankNum = parseInt(rankInput, 10);
    if (isNaN(rankNum) || !top2000Data || top2000Data.length === 0) {
      setRankInput("");
      return;
    }

    const itemIndex = top2000Data.findIndex((item) => item.ranking === rankNum);

    if (itemIndex !== -1) {
      const targetPageIndex = Math.floor(itemIndex / pagination.pageSize);
      table.setPageIndex(targetPageIndex);
      setActiveRanking(rankNum);
    } else {
      alert("Posição/Ranking não encontrado.");
    }

    setRankInput("");
  };

  const canPrevious = isMounted ? table.getCanPreviousPage() : false;
  const canNext = isMounted ? table.getCanNextPage() : false;
  const pageCount = isMounted ? table.getPageCount() || 1 : 1;
  const pageIndex = isMounted ? table.getState().pagination.pageIndex + 1 : 1;

  return (
    <section
      ref={mainContainerRef}
      className={styles.meantable_container}
      suppressHydrationWarning
    >
      {/* CABEÇALHO DO CARD COM AS BUSCAS */}
      <div
        ref={headerRef}
        className={styles.meantable_cabecalho}
        suppressHydrationWarning
      >
        <h3 className={styles.card_title} suppressHydrationWarning>
          Top 2.500 Médias Simples
        </h3>
        <div className={styles.header_searches} suppressHydrationWarning>
          <div className={styles.page_info} suppressHydrationWarning>
            Ir para:
            <input
              type="number"
              min={1}
              max={2500}
              placeholder={activeRanking ? `#${String(activeRanking)}°` : "#1°"}
              value={rankInput}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "") {
                  setRankInput("");
                  return;
                }
                const num = parseInt(val, 10);
                if (num > 2500) {
                  setRankInput("2500");
                } else if (num < 1) {
                  setRankInput("1");
                } else {
                  setRankInput(val);
                }
              }}
              onKeyDown={(e) => {
                if (["-", "+", "e", "E"].includes(e.key)) {
                  e.preventDefault();
                }
                if (e.key === "Enter") {
                  handleRankSubmit();
                }
              }}
              onBlur={handleRankSubmit}
              className={styles.rank_input}
              suppressHydrationWarning
            />
          </div>
          <div className={styles.page_info} suppressHydrationWarning>
            Pág.{" "}
            <input
              type="number"
              min={1}
              max={pageCount}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onFocus={(e) => e.target.select()}
              onBlur={handlePageSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handlePageSubmit();
                  (e.target as HTMLInputElement).blur();
                }
              }}
              className={styles.page_input}
              suppressHydrationWarning
            />{" "}
            de <span suppressHydrationWarning>{pageCount}</span>
          </div>
        </div>
      </div>
      {/* Container flexível da tabela */}
      <div className={styles.table_scroll} suppressHydrationWarning>
        <table className={styles.meantable_table} suppressHydrationWarning>
          <thead className={styles.meantable_thead} suppressHydrationWarning>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} suppressHydrationWarning>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={styles.meantable_th}
                    suppressHydrationWarning
                  >
                    <div className={styles.th_content} suppressHydrationWarning>
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
          <tbody suppressHydrationWarning>
            {isLoading
              ? Array.from({ length: pagination.pageSize }).map((_, idx) => (
                  <tr
                    key={idx}
                    className={styles.meantable_tr}
                    suppressHydrationWarning
                  >
                    <td
                      className={styles.meantable_td}
                      suppressHydrationWarning
                    >
                      <span
                        style={{ display: "inline-block", width: "40px" }}
                        suppressHydrationWarning
                      >
                        <TDMedium />
                      </span>
                    </td>
                    <td
                      className={styles.meantable_td}
                      suppressHydrationWarning
                    >
                      <span
                        style={{ display: "inline-block", width: "80px" }}
                        suppressHydrationWarning
                      >
                        <TDMedium />
                      </span>
                    </td>
                  </tr>
                ))
              : table.getPaginationRowModel().rows.map((row) => {
                  const currentRank = row.original.ranking;
                  const isSelected = activeRanking === currentRank;
                  return (
                    <tr
                      key={row.id}
                      className={clsx(
                        styles.meantable_tr,
                        isSelected && styles.row_active,
                      )}
                      suppressHydrationWarning
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
                        <td
                          key={cell.id}
                          className={styles.meantable_td}
                          suppressHydrationWarning
                        >
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
      {/* Controles de Paginação (Rodapé) */}
      <div
        ref={footerRef}
        className={styles.pagination_controls}
        suppressHydrationWarning
      >
        <div className={styles.page_navigation} suppressHydrationWarning>
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!isMounted || isLoading || !canPrevious}
            className={styles.page_btn}
            title="Ir para a primeira página"
            suppressHydrationWarning
          >
            «
          </button>

          <button
            onClick={() => table.previousPage()}
            disabled={!isMounted || isLoading || !canPrevious}
            className={styles.page_btn}
            suppressHydrationWarning
          >
            ‹
          </button>

          <span
            className={styles.footer_page_indicator}
            suppressHydrationWarning
          >
            <strong suppressHydrationWarning>{pageIndex}</strong> / {pageCount}
          </span>

          <button
            onClick={() => table.nextPage()}
            disabled={!isMounted || isLoading || !canNext}
            className={styles.page_btn}
            suppressHydrationWarning
          >
            ›
          </button>

          <button
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!isMounted || isLoading || !canNext}
            className={styles.page_btn}
            title="Ir para a última página"
            suppressHydrationWarning
          >
            »
          </button>
        </div>
      </div>
    </section>
  );
}
