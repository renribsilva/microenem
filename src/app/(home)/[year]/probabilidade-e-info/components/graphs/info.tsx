"use client";

import { useMemo } from "react";
import Chart from "react-apexcharts";
import { useChartTheme } from "../../../../../../hooks/use_chart_theme";
import { useYearData } from "../../../../../../context/year_context";
import { useHomeData } from "../../../../../../context/home_context";
import styles from "./graphs.module.css";

function transformTheta(theta: number, k: number, d: number) {
  return theta * k + d;
}

export default function InfoChart() {
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
          const finalY = parseFloat(
            (status === "erro" ? 1 - (yValue || 0) : yValue || 0).toFixed(3),
          );
          return {
            x: transformTheta(
              infoLabels[idx],
              constantesData.k,
              constantesData.d,
            ),
            y: finalY, // O valor real que vai para o gráfico
          };
        });

        return {
          item: code,
          name: `Item ${code}`,
          data: dataPoints,
          color: colorIndex !== -1 ? fixedPalette[colorIndex % 45] : "#999",
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
  ]);

  // --- CONFIGURAÇÕES DO APEXCHARTS ---
  const options: ApexCharts.ApexOptions = useMemo(() => {
    return {
      chart: {
        id: "icc-chart",
        type: "line",
        toolbar: { show: true, offsetX: 0, offsetY: 0 },
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
        max: ymax,
        tickAmount: 5,
        labels: {
          style: { colors: axisColor },
          formatter: (val) => Number(val).toFixed(1),
        },
        title: { text: "Informação", style: { color: axisColor } },
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
              text: `Traço de info. da nota ${proficienciaAtual.toFixed(0)}`,
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
  ]);

  return (
    <div style={{ minHeight: "350px", minWidth: "0", flex: "1 1 50%" }}>
      <div className={styles.tcc_cabecalho}>
        <div className={styles.tcc_title}>
          <h3 className={styles.tcc_title_h3}>Curva de informação do item</h3>
          <p className={styles.tcc_subtitle_p}>
            Pontos da proficiência para os quais o item apresenta maior precisão
            para distinguir quem domina de quem não domina a habilidade
            avalidada.
          </p>
        </div>
      </div>
      <Chart
        options={options}
        series={series}
        type="line"
        height="100%"
        // width="100%"
      />
    </div>
  );
}
