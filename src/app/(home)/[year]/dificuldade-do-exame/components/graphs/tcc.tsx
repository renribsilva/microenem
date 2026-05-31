"use client";

import { useMemo } from "react";
import Chart from "react-apexcharts";
import { useChartTheme } from "../../../../../../hooks/use_chart_theme";
import styles from "./graphs.module.css";
import { useHomeData } from "../../../../../../context/home_context";
import Dropdown from "../../../../../../components/tsx/dropdown";

export default function TCCChart() {
  const { chartProps, activeTCC } = useHomeData();
  const { textColor, gridColor, axisColor } = useChartTheme();

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
      noData: {
        text: "Atualizando...",
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
        enabledOnSeries: [1],
        x: {
          formatter: function (value: number) {
            const css = {
              label: [
                "font-weight: bold",
                "margin-left: 8px",
                `color: #fff`,
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
          formatter: function (_val, { series, dataPointIndex }) {
            const css = {
              container: ["display: flex", "align-items: center"].join("; "),
              value: [
                "font-weight: 300",
                "opacity: 0.7",
                `color: #fff`,
                "opacity: 0.7",
                "margin: 0px",
                "padding: 0px",
                "padding: 5px",
              ].join("; "),
              marker1: [
                `width: 10px`,
                `height: 10px`,
                `border-radius: 50%`,
                `background-color: #94a3b8`,
                `display: inline-block;`,
                "margin-right: 5px",
              ].join("; "),
              marker2: [
                `width: 10px`,
                `height: 10px`,
                `border-radius: 50%`,
                `background-color: ${chartColor}`,
                `display: inline-block;`,
                "margin-right: 5px",
              ].join("; "),
            };
            const val0 = series[0][dataPointIndex];
            let val1 = series[1][dataPointIndex];
            const series1 = series[1];
            if (!val1) {
              for (let i = dataPointIndex; i >= 0; i--) {
                if (series1[i] !== null && series1[i] !== undefined) {
                  val1 = series1[i];
                  break;
                }
              }
            }
            return `
             <div>
                <div style="${css.container}">
                  <div style="${css.marker1}"></div>
                  <div> 
                    <span style="${css.value}">Média de acertos: </span>
                    <span>${Number(val1).toFixed(0)}</span>
                  </div>
                </div>
                <div style="${css.container}">
                  <div style="${css.marker2}"></div>
                  <div> 
                    <span style="${css.value}">Acertos esperados: </span>
                    <span>${Number(val0).toFixed(0)}</span>
                  </div>
                </div>
              </div>
            `;
          },
          title: {
            formatter: function () {
              return null;
            },
          },
        },
        marker: {
          show: false,
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
      legend: {
        position: "bottom",
        labels: { colors: textColor },
        markers: {
          strokeWidth: 0,
          offsetX: -2,
        },
      },
    }),
    [
      chartColor,
      gridColor,
      axisColor,
      xMin,
      xMax,
      yBMedio,
      bMedio,
      textColor,
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
