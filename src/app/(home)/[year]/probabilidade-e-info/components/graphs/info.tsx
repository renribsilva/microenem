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

export default function InfoChart() {
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

  const infoLabels = probInfoData.infoLabels;
  const infoData = probInfoData.infoData;

  // --- PROCESSAMENTO DE DADOS PARA APEXCHARTS ---
  const { series, ymax } = useMemo(() => {
    const codes = activeCodes;
    const allItemsInProva = Object.keys(infoData || {});
    const chartSeries = codes
      .map((code) => {
        const itemKey = String(code);
        const isAbandoned = abandonadosCodes.has(code);
        if (isAbandoned) {
          return null;
        }
        const status = selectedItems[code]?.status;
        const rawPoints = infoData?.[itemKey] as (number | null)[];
        if (!rawPoints) return null;
        const colorIndex = allItemsInProva.indexOf(itemKey);

        const dataPoints = rawPoints.map((yValue, idx) => {
          // Se for erro, inverte o valor (1 - y). Se não, usa o y normal.
          const finalY = parseFloat((yValue || 0).toFixed(3));
          return {
            x: transformTheta(
              infoLabels[idx],
              constantesData.k,
              constantesData.d,
            ),
            y: finalY, // O valor real que vai para o gráfico
          };
        });

        const baseColor =
          colorIndex !== -1 ? fixedPalette[colorIndex % 45] : "#999";
        const isFaded = curve !== null && curve.code !== code;
        const color = isFaded ? "rgba(150, 150, 150, 0.2)" : baseColor;

        return {
          item: code,
          name: `Item ${code}`,
          data: dataPoints,
          color,
          strokeDashArray: status === "erro" ? 4 : 0,
        };
      })
      .filter(Boolean);

    const allYValues = chartSeries.flatMap((s) =>
      s ? s.data.map((d) => d.y) : [],
    );
    const currentMax = allYValues.length > 0 ? Math.max(...allYValues) : 0;

    const safetyMax = currentMax === 0 ? 1 : currentMax * 1.1;

    return {
      series: chartSeries,
      ymax: safetyMax,
    };
  }, [
    selectedItems,
    infoData,
    activeCodes,
    fixedPalette,
    infoLabels,
    constantesData.k,
    constantesData.d,
    abandonadosCodes,
    curve,
  ]);

  // --- CONFIGURAÇÕES DO APEXCHARTS ---
  const options: ApexCharts.ApexOptions = useMemo(() => {
    // Fallbacks seguros para os eixos caso venham vazios/NaN/Infinity
    const safeXMin = Number.isFinite(xMin) ? xMin : 0;
    const safeXMax = Number.isFinite(xMax) ? xMax : 1000;
    const safeYMax = Number.isFinite(ymax) && ymax > 0 ? ymax : 1;
    const safeProficiencia = Number.isFinite(proficienciaAtual)
      ? proficienciaAtual
      : 0;

    return {
      chart: {
        id: "icc-chart",
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
        min: safeXMin,
        max: safeXMax,
        labels: {
          style: { colors: axisColor },
          formatter: (val: string) => (val ? parseFloat(val).toFixed(0) : "0"),
        },
        title: {
          text: `Notas na escala do Enem (${deferredArea || ""})`,
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
        max: safeYMax, // Protegido contra Infinity/NaN
        tickAmount: 5,
        labels: {
          style: { colors: axisColor },
          formatter: (val) =>
            val !== undefined ? Number(val).toFixed(1) : "0.0",
        },
        title: { text: "Informação", style: { color: axisColor } },
      },
      grid: { borderColor: gridColor },
      legend: { show: false },
      annotations: {
        xaxis: [
          {
            x: safeProficiencia,
            borderColor: chartColor || "#ff0000",
            strokeDashArray: 0,
            label: {
              text: `Traço de info. da nota ${safeProficiencia.toFixed(0)}`,
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
    ymax,
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
          <span>Curva de informação do item</span>{" "}
          {curve && <span>{curve.num}</span>}
        </div>
        <div className={styles.subtitle} style={{ color: textColor }}>
          Pontos da proficiência para os quais o item apresenta maior precisão
          para distinguir quem domina de quem não domina a habilidade avalidada.
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
