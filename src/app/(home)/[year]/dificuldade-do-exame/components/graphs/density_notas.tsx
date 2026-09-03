"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useChartTheme } from "../../../../../../hooks/use_chart_theme";
import { useHomeData } from "../../../../../../context/home_context";
import { useYearData } from "../../../../../../context/year_context";
import { FreqDensityType } from "../../../../../../types/year_types";
import dynamic from "next/dynamic";
import styles from "./graphs.module.css";

const Chart = dynamic(() => import("react-apexcharts"));

const densidadeColor: Record<string, string> = {
  curve: "#8b5cf6",
  curve_fill: "rgba(139, 92, 241, 0.1)",
  line: "#f97316",
  fill: "rgba(139, 92, 241, 0.45)",
  border: "rgba(139, 92, 241, 0.6)",
};

export default function DensityNotasChart() {
  const headerRef = useRef<HTMLDivElement>(null);
  const [toolbarOffsetY, setToolbarOffsetY] = useState<number>(-50);

  // Monitora redimensionamentos da largura/altura do container do header
  useEffect(() => {
    if (!headerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const headerHeight = entry.contentRect.height;
        setToolbarOffsetY(-headerHeight);
      }
    });
    observer.observe(headerRef.current);
    return () => {
      observer.disconnect();
    };
  }, []);

  const { deferredArea } = useHomeData();
  const { dificuldadeDoExame, dificuldadeDoExameAux } = useYearData();
  const activeSelectedRow = dificuldadeDoExameAux.activeSelectedRow;
  const densityDifData = dificuldadeDoExame.densityDifData;
  const describeDifData = dificuldadeDoExame.describeDifData;
  const { textColor, gridColor, axisColor } = useChartTheme();

  const { xMin, xMax } = useMemo(() => {
    if (!describeDifData?.notas) return { xMin: 0, xMax: 1000 };
    return {
      xMin: Math.floor(describeDifData.notas.min / 100) * 100,
      xMax: Math.ceil(describeDifData.notas.max / 100) * 100,
    };
  }, [describeDifData]);

  const getStatDescription = (id: string, valStr: string) => {
    if (!valStr) return "";
    const val = parseFloat(valStr.replace(/\./g, "").replace(",", "."));
    if (id === "skew") {
      if (val > 0) return `Notas baixas mais frequentes.`;
      if (val < 0) return `Notas altas mais frequentes.`;
      return `Distribuição Simétrica.`;
    }
    if (id === "kurtosis") {
      if (val > 0) return `Notas concentradas perto da média.`;
      if (val < 0) return `Notas mais dispersas.`;
      return `Mesocúrtica: Distribuição normal.`;
    }
    return "";
  };

  const series = useMemo(() => {
    if (!densityDifData) return [];
    const mainDs = densityDifData.datasets?.find(
      (ds: FreqDensityType["regular"]["datasets"][number]) =>
        ds.id === "main-density",
    );
    const dataArray = Array.isArray(mainDs?.data) ? mainDs.data : [];
    const sortedData = dataArray
      .sort((a, b) => a.x - b.x)
      .map((p) => [p.x, p.y * 100]);
    const datasets = [{ name: `Densidade ${deferredArea}`, data: sortedData }];

    const fillIds = ["sd", "q1", "q3", "p99"];
    if (
      activeSelectedRow &&
      fillIds.includes(activeSelectedRow.id) &&
      describeDifData?.notas
    ) {
      const n = describeDifData.notas;
      let start = 0,
        end = 0;
      if (activeSelectedRow.id === "sd") {
        start = n.mean - n.sd;
        end = n.mean + n.sd;
      } else if (activeSelectedRow.id === "q1") {
        start = n.q1;
        end = n.max;
      } else if (activeSelectedRow.id === "q3") {
        start = n.q3;
        end = n.max;
      } else if (activeSelectedRow.id === "p99") {
        start = n.p99;
        end = n.max;
      }

      const filtered = sortedData.filter((p) => p[0] >= start && p[0] <= end);
      datasets.push({ name: `Destaque`, data: filtered });
    }
    return datasets;
  }, [densityDifData, deferredArea, activeSelectedRow, describeDifData]);

  const options: ApexCharts.ApexOptions = useMemo(() => {
    const isShape = activeSelectedRow
      ? ["skew", "kurtosis"].includes(activeSelectedRow.id)
      : false;
    const isFill = activeSelectedRow
      ? ["sd", "q1", "q3", "p99"].includes(activeSelectedRow.id)
      : false;

    const centerPoint = (xMax + xMin) / 2;

    const valX = isShape
      ? centerPoint
      : activeSelectedRow?.id === "mean" || activeSelectedRow?.id === "sd"
        ? describeDifData?.notas?.mean || 0
        : parseFloat(
            activeSelectedRow?.nota?.replace(/\./g, "").replace(",", ".") ||
              "0",
          );

    const mainDs = densityDifData?.datasets?.find(
      (ds: FreqDensityType["regular"]["datasets"][number]) =>
        ds.id === "main-density",
    );
    const dataArray = Array.isArray(mainDs?.data) ? mainDs.data : [];
    const yMax =
      dataArray.length > 0 ? Math.max(...dataArray.map((p) => p.y * 100)) : 0;

    const chartColors = isFill
      ? [densidadeColor["curve"], densidadeColor["fill"]]
      : [densidadeColor["curve"]];
    const fillOpacity = isFill ? [0.2, 0.7] : [0.2];
    const strokeWidths = isFill ? [2, 0] : [2];

    return {
      chart: {
        id: `density-${deferredArea}`,
        type: "area" as const,
        toolbar: { show: true, offsetY: toolbarOffsetY },
        zoom: { enabled: false },
        animations: {
          enabled: false,
          dynamicAnimation: {
            enabled: false,
          },
        },
      },
      colors: chartColors,
      stroke: { curve: "smooth", width: strokeWidths },
      fill: { type: "solid", opacity: fillOpacity },
      xaxis: {
        type: "numeric",
        min: xMin,
        max: xMax,
        tickAmount: (xMax - xMin) / 200,
        labels: { style: { colors: axisColor } },
        title: { text: "Notas na escala do ENEM", style: { color: axisColor } },
        tooltip: {
          enabled: false,
        },
      },
      yaxis: {
        labels: {
          style: { colors: axisColor },
          formatter: (val: number) => Number(val).toFixed(1),
        },
        title: {
          text: "Densidade (x100)",
          style: { color: axisColor, fontWeight: "bold" },
        },
      },
      grid: { borderColor: gridColor },
      legend: { show: false },
      dataLabels: { enabled: false },
      tooltip: {
        theme: "dark",
        y: {
          formatter: function (val) {
            const css = {
              label: ["font-weight: 300", "opacity: 0.7"].join("; "),
              value: ["font-weight: bold", "margin-left: 4px"].join("; "),
            };
            return `
              <div style="margin-top: 2px;">
                <span style="${css.label}">Densidade (x100): </span>
                <span style="${css.value}">${val.toFixed(1)}%</span>
              </div>
           `;
          },
          title: {
            formatter: function () {
              return "";
            },
          },
        },

        x: {
          formatter: function (value: number) {
            const css = {
              label: [
                "font-weight: bold",
                "margin-left: 4px",
                `color: #fff`,
              ].join("; "),
              value: ["font-weight: bold"].join("; "),
            };
            return `
             <div style="margin-top: 2px;">
                <span style="${css.label}">Proficiência: </span>
                <span style="${css.value}">${value.toFixed(0)}</span>
              </div>
            `;
          },
        },

        marker: {
          show: false,
        },
      },
      annotations: {
        xaxis:
          activeSelectedRow && !isShape
            ? [
                {
                  x: valX,
                  borderColor: densidadeColor["line"],
                  borderWidth: 2,
                  label: {
                    text: [
                      `${activeSelectedRow.metric}: `,
                      `${activeSelectedRow.nota}`,
                    ].join(""),
                    style: {
                      color: "#000",
                      background: densidadeColor["line"],
                      fontWeight: "bold",
                    },
                    orientation: "horizontal",
                    offsetX:
                      valX < describeDifData?.notas?.q1
                        ? 40
                        : valX > describeDifData?.notas?.q3
                          ? -40
                          : 0,
                  },
                },
              ]
            : [],
        points:
          activeSelectedRow && isShape
            ? [
                {
                  x: centerPoint,
                  y: yMax,
                  marker: { size: 0 },
                  label: {
                    text: [
                      `${activeSelectedRow.metric}: ${activeSelectedRow.nota}`,
                      getStatDescription(
                        activeSelectedRow.id,
                        activeSelectedRow.nota,
                      ),
                    ],
                    style: {
                      color: "#fff",
                      background: densidadeColor["line"],
                    },
                  },
                },
              ]
            : [],
      },
    };
  }, [
    describeDifData,
    axisColor,
    activeSelectedRow,
    gridColor,
    xMin,
    xMax,
    deferredArea,
    densityDifData,
    toolbarOffsetY,
  ]);

  if (!densityDifData?.datasets) {
    return (
      <div className={`${styles.container}`}>
        <div className={styles.title} style={{ color: textColor }}>
          Curva de densidade
        </div>
        <div className={styles.subtitle} style={{ color: textColor }}>
          Distribuição da densidade das notas por proeficiência.
        </div>
        <div className={styles.loading}>
          <span style={{ color: textColor }}>Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header} ref={headerRef}>
        <div className={styles.title} style={{ color: textColor }}>
          Curva de densidade
        </div>
        <div className={styles.subtitle} style={{ color: textColor }}>
          Distribuição da densidade das notas por proeficiência.
        </div>
      </div>
      <div className={styles.chartWrapper}>
        <Chart
          options={options}
          series={series}
          type="area"
          height="100%"
          width="100%"
        />
      </div>
    </div>
  );
}
