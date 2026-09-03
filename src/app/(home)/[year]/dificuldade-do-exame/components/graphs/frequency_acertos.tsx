"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useChartTheme } from "../../../../../../hooks/use_chart_theme";
import { useHomeData } from "../../../../../../context/home_context";
import { useYearData } from "../../../../../../context/year_context";
import dynamic from "next/dynamic";
import styles from "./graphs.module.css";

const Chart = dynamic(() => import("react-apexcharts"));

interface FreqItem {
  x: number;
  y: number;
  fillColor: string;
  strokeColor: string;
  abs: number;
}

const acertosColor: Record<string, string> = {
  bar: "#10b77f33",
  fill: "#10b77fcc",
  line: "#f43f5e",
};

export default function FrequencyAcertosChart() {
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

  // Contexto necessário
  const { deferredArea } = useHomeData();
  const { dificuldadeDoExame, dificuldadeDoExameAux } = useYearData();
  const activeSelectedRow = dificuldadeDoExameAux.activeSelectedRow;
  const describeDifData = dificuldadeDoExame.describeDifData;
  const frequencyDifData = dificuldadeDoExame.frequencyDifData;
  const { textColor, gridColor, axisColor } = useChartTheme();

  const xMin = 0;
  const xMax = 45;

  const getStatDescription = (id: string, valStr: string) => {
    if (!valStr) return "";
    const val = parseFloat(valStr.replace(/\./g, "").replace(",", "."));
    if (id === "skew") {
      if (val > 0) return `Poucos acertos mais frequentes.`;
      if (val < 0) return `Muitos acertos mais frequentes.`;
      return `Distribuição Simétrica.`;
    }
    if (id === "kurtosis") {
      if (val > 0) return `Acertos concentrados perto da média.`;
      if (val < 0) return `Acertos mais dispersos.`;
      return `Curtose Neutra.`;
    }
    return "";
  };

  const series = useMemo(() => {
    if (!frequencyDifData) return [];
    const percentData = frequencyDifData.datasets?.[1]?.data;
    const absoluteData = frequencyDifData.datasets?.[0]?.data;
    const perData = Array.isArray(percentData) ? percentData : [];

    const fillIds = ["sd", "q1", "q3", "p99"];

    const dataWithColors = perData.map((p, index) => {
      let pointColor = acertosColor["bar"];
      if (
        activeSelectedRow &&
        fillIds.includes(activeSelectedRow.id) &&
        describeDifData?.acertos
      ) {
        const n = describeDifData.acertos;
        let start = 0,
          end = 0;

        // Lógica de destaque baseada nos acertos da área atual
        if (activeSelectedRow.id === "sd") {
          start = Math.round(n.mean) - Math.round(n.sd);
          end = Math.round(n.mean) + Math.round(n.sd);
        } else if (activeSelectedRow.id === "q1") {
          start = Math.round(n.q1);
          end = Math.round(n.max);
        } else if (activeSelectedRow.id === "q3") {
          start = Math.round(n.q3);
          end = Math.round(n.max);
        } else if (activeSelectedRow.id === "p99") {
          start = Math.round(n.p99);
          end = Math.round(n.max);
        }

        if (p.x >= start && p.x <= end) {
          pointColor = acertosColor["fill"];
        }
      }

      return {
        x: p.x,
        y: p.y,
        fillColor: pointColor,
        strokeColor: pointColor,
        abs: absoluteData[index]?.y,
      };
    });
    return [
      {
        name: `Frequência ${deferredArea}`,
        data: dataWithColors,
      },
    ];
  }, [frequencyDifData, deferredArea, activeSelectedRow, describeDifData]);

  const options: ApexCharts.ApexOptions = useMemo(() => {
    const isShape = activeSelectedRow
      ? ["skew", "kurtosis"].includes(activeSelectedRow.id)
      : false;
    const mean = describeDifData?.acertos?.mean || 0;

    // Posição da linha vertical recalculada para a área atual
    const valX =
      isShape ||
      activeSelectedRow?.id === "sd" ||
      activeSelectedRow?.id === "mean"
        ? Math.round(mean)
        : Math.round(
            parseFloat(
              activeSelectedRow?.acerto?.replace(/\./g, "").replace(",", ".") ||
                "0",
            ),
          );

    const rawDataYArray = frequencyDifData?.datasets?.[1]?.data || [];
    const rawDataY = Array.isArray(rawDataYArray) ? rawDataYArray : [];

    const yMax =
      rawDataY.length > 0 ? Math.max(...rawDataY.map((p) => p.y)) : 0;

    return {
      chart: {
        id: `freq-${deferredArea}`,
        type: "bar",
        toolbar: { show: true, offsetY: toolbarOffsetY },
        zoom: { enabled: false },
        animations: {
          enabled: false,
          dynamicAnimation: {
            enabled: false,
          },
        },
      },
      plotOptions: {
        bar: {
          columnWidth: "95%",
          distributed: false,
        },
      },
      dataLabels: { enabled: false },
      xaxis: {
        type: "numeric",
        min: xMin,
        max: xMax,
        tickPlacement: "on",
        tickAmount: 9,
        labels: {
          style: { colors: axisColor },
          formatter: (v) => Number(v).toFixed(0),
        },
        title: {
          text: "Acertos",
          style: { color: axisColor, fontWeight: "bold" },
        },
      },
      yaxis: {
        labels: {
          style: { colors: axisColor },
          formatter: (v) => Number(v).toFixed(0) + "%",
        },
        title: {
          text: "Frequência relativa",
          style: { color: axisColor, fontWeight: "bold" },
        },
      },
      grid: {
        borderColor: gridColor,
        padding: {
          top: 22,
        },
      },
      legend: { show: false },
      tooltip: {
        theme: "dark",
        intersect: false,
        followCursor: true,
        x: {
          formatter: function (value: number) {
            const css = {
              label: [
                "font-weight: bold",
                "margin-left: 4px",
                `color: #fff`,
              ].join("; "),
              value: ["font-weight: light"].join("; "),
            };
            return `
             <div style="margin-top: 2px;">
                <span style="${css.label}">Acertos:</span>
                <span style="${css.value}">${value}</span>
              </div>
            `;
          },
        },
        y: {
          formatter: function (val, { seriesIndex, dataPointIndex, w }) {
            const series = w.config.series as { data: FreqItem[] }[];
            const item = series[seriesIndex].data[dataPointIndex];
            const absoluto = item.abs.toLocaleString("pt-BR");
            const css = {
              label: ["font-weight: 300", "opacity: 0.7"].join("; "),
              value: ["font-weight: bold"].join("; "),
            };
            return `
              <div style="margin-top: 2px;">
                <span style="${css.label}">Porcentagem:</span>
                <span style="${css.value}">${val.toFixed(2)}%</span>
              </div>
              <div style="margin-top: 2px;">
                <span style="${css.label}">Total:</span>
                <span style="${css.value}">${absoluto}</span>
              </div>
            `;
          },
          title: {
            formatter: function () {
              return "";
            },
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
                  borderColor: acertosColor["line"],
                  borderWidth: 2,
                  label: {
                    text: [
                      `${activeSelectedRow.metric}: `,
                      `${activeSelectedRow.acerto}`,
                    ].join(""),
                    style: {
                      color: "#000",
                      background: acertosColor["line"],
                      fontWeight: "bold",
                    },
                    orientation: "horizontal",
                    offsetX:
                      valX < Math.round(describeDifData?.acertos?.q1)
                        ? 35
                        : valX > Math.round(describeDifData?.acertos?.q3)
                          ? -35
                          : 0,
                  },
                },
              ]
            : [],
        points:
          activeSelectedRow && isShape
            ? [
                {
                  x: 22.5,
                  y: yMax,
                  marker: { size: 0 },
                  label: {
                    text: [
                      `${activeSelectedRow.metric}: `,
                      `${activeSelectedRow.acerto}`,
                      getStatDescription(
                        activeSelectedRow.id,
                        activeSelectedRow.acerto,
                      ),
                    ],
                    style: { color: "#fff", background: acertosColor["line"] },
                  },
                },
              ]
            : [],
      },
    };
  }, [
    describeDifData,
    frequencyDifData,
    activeSelectedRow,
    axisColor,
    gridColor,
    deferredArea,
    toolbarOffsetY,
  ]);

  if (!frequencyDifData?.datasets) {
    return (
      <div className={`${styles.container}`}>
        <div className={styles.title} style={{ color: textColor }}>
          Frequência de acertos
        </div>
        <div className={styles.subtitle} style={{ color: textColor }}>
          Distribuição da frequência relativa de acertos.
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
          Frequência de acertos
        </div>
        <div className={styles.subtitle} style={{ color: textColor }}>
          Distribuição da frequência relativa de acertos.
        </div>
      </div>
      <div className={styles.chartWrapper}>
        <Chart
          options={options}
          series={series}
          type="bar"
          height="100%"
          width="100%"
        />
      </div>
    </div>
  );
}
