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
  const { gridColor, axisColor } = useChartTheme();
  const {
    abandonadosCodes,
    fixedPalette,
    constantesData,
    probInfoData,
    selectedItems,
    activeCodes,
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
          color: colorIndex !== -1 ? fixedPalette[colorIndex % 45] : "#999",
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
  ]);

  const options: ApexCharts.ApexOptions = useMemo(() => {
    return {
      chart: {
        id: "icc-chart",
        type: "line",
        toolbar: { show: false, offsetX: 0, offsetY: 0 },
        zoom: {
          enabled: false,
        },
        animations: {
          enabled: false,
          dynamicAnimation: {
            enabled: false,
          },
        },
      },
      stroke: {
        curve: "monotoneCubic",
        width: 2,
        lineCap: "round",
        dashArray: series.map((s) => s.strokeDashArray),
      },
      colors: series.map((s) => s.color),
      xaxis: {
        type: "numeric",
        min: xMin,
        max: xMax,
        labels: {
          style: { colors: axisColor },
          formatter: (val: string) => parseFloat(val).toFixed(0),
        },
        title: {
          text: `Notas na escala do Enem (${deferredArea})`,
          style: { color: axisColor },
        },
        axisBorder: { show: false },
        tooltip: {
          enabled: true,
        },
        crosshairs: {
          show: true,
          width: 1,
          position: "back",
          opacity: 0.9,
          stroke: {
            color: axisColor,
            width: 1,
            dashArray: 3,
          },
        },
      },
      tooltip: {
        enabled: true,
        shared: true,
        custom: function () {
          return "";
        },
        marker: {
          show: false,
        },
      },
      yaxis: {
        min: 0,
        max: 1,
        tickAmount: 5,
        labels: {
          style: { colors: axisColor },
          formatter: (val) => Number(val).toFixed(1),
        },
        title: { text: "Probabilidade", style: { color: axisColor } },
      },
      grid: { borderColor: gridColor },
      legend: { show: false },
      annotations: {
        xaxis: [
          {
            x: proficienciaAtual,
            borderColor: chartColor || "#ff0000",
            strokeDashArray: 0,
            label: {
              text: `Traço de prob. da nota ${proficienciaAtual.toFixed(0)}`,
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
  ]);

  return (
    <div style={{ minHeight: "350px", minWidth: "0", flex: "1 1 50%" }}>
      <div className={styles.tcc_cabecalho}>
        <div className={styles.tcc_title}>
          <h3 className={styles.tcc_title_h3}>Curva característica do item</h3>
          <p className={styles.tcc_subtitle_p}>
            Modelagem da probabilidade de acerto em função da proficiência
            estimada.
          </p>
        </div>
      </div>
      <Chart options={options} series={series} type="line" height="100%" />
    </div>
  );
}
