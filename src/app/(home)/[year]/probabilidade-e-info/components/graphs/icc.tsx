"use client";

import { useMemo } from "react";
import { useChartTheme } from "../../../../../../hooks/use_chart_theme";
import { useYearData } from "../../../../../../context/year_context";
import { useHomeData } from "../../../../../../context/home_context";
import styles from "./graphs.module.css";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

function transformTheta(theta: number, k: number, d: number) {
  return theta * k + d;
}

export default function ICCChart() {
  const { chartProps, deferredArea } = useHomeData();
  const { chartColor, proficienciaAtual, xMin, xMax } = chartProps;
  const { textColor, gridColor, axisColor } = useChartTheme();
  const {
    abandonadosCodes,
    fixedPalette,
    constantesData,
    probInfoData,
    selectedItems,
    activeCodes,
    curve,
  } = useYearData();

  const probLabels = probInfoData.probLabels;
  const probData = probInfoData.probData;

  // --- PROCESSAMENTO DE DADOS PARA APEXCHARTS ---
  const { series } = useMemo(() => {
    const codes = activeCodes;
    const allItemsInProva = Object.keys(probData || {});
    const chartSeries = codes
      .map((code) => {
        const itemKey = String(code);
        const isAbandoned = abandonadosCodes.has(code);
        if (isAbandoned) {
          return null;
        }
        const status = selectedItems[code]?.status;
        const rawPoints = probData?.[itemKey] as (number | null)[];
        if (!rawPoints) return null;
        const colorIndex = allItemsInProva.indexOf(itemKey);
        const baseColor =
          colorIndex !== -1 ? fixedPalette[colorIndex % 45] : "#999";

        const isFaded = curve !== null && curve.code !== code;
        const color = isFaded ? "rgba(150, 150, 150, 0.2)" : baseColor;

        return {
          item: code,
          name: `Item ${code}`,
          data: rawPoints.map((yValue, idx) => ({
            x: transformTheta(
              probLabels[idx],
              constantesData.k,
              constantesData.d,
            ),
            y: parseFloat(
              (status === "erro" ? 1 - (yValue || 0) : yValue || 0).toFixed(3),
            ),
          })),
          color,
          strokeDashArray: status === "erro" ? 4 : 0,
        };
      })
      .filter(Boolean);

    return { series: chartSeries };
  }, [
    selectedItems,
    probData,
    fixedPalette,
    probLabels,
    activeCodes,
    abandonadosCodes,
    constantesData.k,
    constantesData.d,
    curve,
  ]);

  const options: ApexCharts.ApexOptions = useMemo(() => {
    return {
      chart: {
        id: "icc-chart",
        type: "line",
        toolbar: { show: false, offsetX: 0, offsetY: 0 },
        zoom: { enabled: false },
        animations: { enabled: false },
      },
      stroke: {
        curve: "monotoneCubic",
        width:
          series.length > 0
            ? series.map((s) =>
                curve !== null && s.item === curve.code ? 3 : 2,
              )
            : 2,
        lineCap: "round",
        dashArray:
          series.length > 0 ? series.map((s) => s.strokeDashArray) : [],
      },
      colors: series.length > 0 ? series.map((s) => s.color) : ["#3b82f6"],
      xaxis: {
        type: "numeric",
        min: Number.isFinite(xMin) ? xMin : 0,
        max: Number.isFinite(xMax) ? xMax : 1000,
        labels: {
          style: { colors: axisColor },
          formatter: (val: string) => (val ? parseFloat(val).toFixed(0) : "0"),
        },
        title: {
          text: `Notas na escala do Enem (${deferredArea || ""})`,
          style: { color: axisColor },
        },
        axisBorder: { show: false },
        tooltip: { enabled: true },
        crosshairs: {
          show: true,
          width: 1,
          position: "back",
          opacity: 0.9,
          stroke: { color: axisColor, width: 1, dashArray: 3 },
        },
      },
      tooltip: {
        enabled: true,
        shared: true,
        custom: () => "",
        marker: { show: false },
      },
      yaxis: {
        min: 0,
        max: 1,
        tickAmount: 5,
        labels: {
          style: { colors: axisColor },
          formatter: (val) =>
            val !== undefined ? Number(val).toFixed(1) : "0.0",
        },
        title: { text: "Probabilidade", style: { color: axisColor } },
      },
      grid: { borderColor: gridColor },
      legend: { show: false },
      annotations: {
        xaxis: [
          {
            x: Number.isFinite(proficienciaAtual) ? proficienciaAtual : 0,
            borderColor: chartColor || "#ff0000",
            strokeDashArray: 0,
            label: {
              text: [
                `Traço de prob. da nota`,
                `${(Number.isFinite(proficienciaAtual)
                  ? proficienciaAtual
                  : 0
                ).toFixed(0)}`,
                //eslint-disable-next-line
              ] as any,
              style: { color: "#fff", background: chartColor || "#ff0000" },
              borderWidth: 0,
              orientation: "horizontal",
              offsetY: -15,
            },
          },
        ],
      },
    };
  }, [
    series,
    xMin,
    xMax,
    deferredArea,
    proficienciaAtual,
    chartColor,
    axisColor,
    gridColor,
    curve,
  ]);
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title} style={{ color: textColor }}>
          <span>Curva característica do item</span>{" "}
          {curve && <span>{curve.num}</span>}
        </div>
        <div className={styles.subtitle} style={{ color: textColor }}>
          Modelagem da probabilidade de acerto em função da proficiência
          estimada.
        </div>
      </div>
      <div className={styles.chartWrapper}>
        <Chart
          options={options}
          series={series}
          type="line"
          height="100%"
          width="100%"
        />
      </div>
    </div>
  );
}
