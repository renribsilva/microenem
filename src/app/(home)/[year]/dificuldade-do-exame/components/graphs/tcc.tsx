"use client";

import { useMemo } from "react";
import Chart from "react-apexcharts";
import { useChartTheme } from "../../../../../../hooks/use_chart_theme";
import styles from "./graphs.module.css";
import { useHomeData } from "../../../../../../context/home_context";
import Dropdown from "../../../../../../components/tsx/dropdown";

export default function TCCChart() {
  const { chartProps, activeTCC } = useHomeData();
  const { panelColor, gridColor, axisColor } = useChartTheme();

  const { chartColor, xMin, xMax, bMedio, proficienciaAtual, resultadoAtual } =
    chartProps;

  const series = useMemo(
    () => [
      {
        name: "Acertos esperados", // Série 0 (Prioridade)
        type: "line",
        data:
          activeTCC?.data_teorico?.map((val, i) => ({
            x: activeTCC?.labels_x[i],
            y: val !== null ? Math.round(val * 10) / 10 : null,
          })) || [],
      },
      {
        name: "Média observada", // Série 1
        type: "scatter",
        data:
          activeTCC?.data_empirico?.map((val, i) => ({
            x: activeTCC?.labels_x[i],
            y: val,
          })) || [],
      },
    ],
    [activeTCC],
  );

  const yBMedio = useMemo(() => {
    if (!activeTCC || !bMedio) return 22.5;
    const closestIndex = activeTCC.labels_x.reduce(
      (prev: number, curr: number, idx: number) => {
        return Math.abs(curr - bMedio) <
          Math.abs(activeTCC.labels_x[prev] - bMedio)
          ? idx
          : prev;
      },
      0,
    );
    return activeTCC.data_teorico[closestIndex];
  }, [activeTCC, bMedio]);

  const options: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        id: "tcc-chart",
        type: "line",
        toolbar: {
          offsetX: 0,
          offsetY: -10,
          show: true,
        },
        zoom: { enabled: false },
        animations: {
          enabled: false,
          dynamicAnimation: {
            enabled: false,
          },
        },
      },
      markers: {
        size: [1, 1],
        strokeColors: "#fff",
        strokeWidth: 0,
        hover: {
          size: 6,
        },
      },
      colors: [chartColor, "#94a3b8"],
      stroke: {
        curve: "smooth",
        width: [1, 1],
        colors: [chartColor],
        connectNulls: true,
      },
      grid: { borderColor: gridColor },
      xaxis: {
        type: "numeric",
        min: xMin,
        max: xMax,
        tickAmount: 10,
        labels: {
          style: { colors: axisColor },
          formatter: (val) => Number(val).toFixed(0),
        },
        tooltip: { enabled: false },
        title: {
          text: "Notas na escala do ENEM",
          style: { color: axisColor, fontWeight: "bold" },
        },
      },
      yaxis: {
        min: 0,
        max: 45,
        tickAmount: 9,
        labels: {
          style: { colors: axisColor },
          formatter: (val) => Number(val).toFixed(0),
        },
        title: {
          text: "Acertos",
          style: { color: axisColor, fontWeight: "bold" },
        },
      },
      tooltip: {
        theme: "dark",
        followCursor: true,
        enabled: true,
        marker: { show: true },
        x: {
          formatter: function (value: number) {
            const css = {
              label: [
                "font-weight: 300",
                "margin-left: 4px",
                `color: ${panelColor}`,
              ].join("; "),
              value: ["font-weight: bold"].join("; "),
            };
            return `
             <div style="margin-top: 2px;">
                <span style="${css.label}">Proficiência: </span>
                <span style="${css.value}">${value}</span>
              </div>
            `;
          },
        },
        y: {
          formatter: function (val, { series, seriesIndex, dataPointIndex }) {
            const css = {
              value: [
                "font-weight: bold",
                `color: ${axisColor}`,
                "margin: 0px",
                "padding: 0px",
              ].join("; "),
            };
            if (val !== null && val !== undefined) {
              return `
                <span style="${css.value}">
                  ${Number(val).toFixed(0)}
                </span>
            `;
            }
            const currentSeries = series[seriesIndex];
            // Busca para trás (valor anterior mais próximo)
            let closestVal = null;
            for (let i = dataPointIndex; i >= 0; i--) {
              if (currentSeries[i] !== null && currentSeries[i] !== undefined) {
                closestVal = currentSeries[i];
                break;
              }
            }
            // Se não achou para trás, busca para frente
            if (closestVal === null) {
              for (let i = dataPointIndex; i < currentSeries.length; i++) {
                if (
                  currentSeries[i] !== null &&
                  currentSeries[i] !== undefined
                ) {
                  closestVal = currentSeries[i];
                  break;
                }
              }
            }
            return `
             <div>
                <p style="${css.value}">
                  ${Number(closestVal).toFixed(0)}
                </p>
              </div>
            `;
          },
        },
      },
      annotations: {
        yaxis: [
          {
            y: yBMedio,
            borderColor: chartColor,
            borderWidth: 2,
            strokeDashArray: 4,
            label: {
              text: `Dificuldade Média: ${Number(bMedio).toFixed(1)}`,
              style: {
                color: "#000000ff",
                background: chartColor,
                fontWeight: "bold",
              },
              offsetY: 25,
              offsetX: -10,
              borderColor: chartColor,
              borderWidth: 6,
            },
          },
        ],
        points: [
          {
            x: proficienciaAtual,
            y: resultadoAtual,
            marker: {
              size: 6,
              fillColor: chartColor,
              strokeColor: "#fff",
              strokeWidth: 0,
              radius: 2,
            },
          },
        ],
      },
    }),
    [
      chartColor,
      gridColor,
      axisColor,
      xMin,
      xMax,
      panelColor,
      yBMedio,
      bMedio,
      proficienciaAtual,
      resultadoAtual,
    ],
  );

  return (
    <div className={styles.tcc_container}>
      <div className={styles.tcc_cabecalho}>
        <div className={styles.tcc_title}>
          <h3 className={styles.tcc_title_h3}>Curva característica do teste</h3>
          <p className={styles.tcc_subtitle_p}>
            Comportamento esperado (teórico) e observado (empírico) da relação
            nota/acerto. Destaque para o ponto de inflexão que representa a
            dificuldade média da prova.
          </p>
        </div>
        <Dropdown />
      </div>
      <div className={styles.tcc_graph_container}>
        <div className={styles.tcc_graph_wrapper}>
          <Chart
            options={options}
            series={series}
            type="line"
            height="100%"
            width="100%"
          />
        </div>
      </div>
    </div>
  );
}
