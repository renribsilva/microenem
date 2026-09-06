"use client";

import { useMemo } from "react";
import { useChartTheme } from "../../../../../../hooks/use_chart_theme";
import { useHomeData } from "../../../../../../context/home_context";
import { useYearData } from "../../../../../../context/year_context";
import { useSidebar } from "../../../../../../context/sidebar_context";
import dynamic from "next/dynamic";
import styles from "./graphs.module.css";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function AcertosChart() {
  const { chartProps, activeTCC } = useHomeData();
  const { isMobile } = useSidebar();
  const { gridColor, panelColor, axisColor, textColor } = useChartTheme();
  const { lastItemActivate, lastItemActivateNum, itemGraphData } =
    useYearData();

  const { chartColor } = chartProps;
  const { xMin, xMax } = chartProps;

  const subtitleText = useMemo(() => {
    return [
      `Frequência relativa de acertos observados em cada`,
      " ",
      `faixa de proficiência`,
      " ",
      itemGraphData
        ? `(cod: ${lastItemActivate}; p: ${activeTCC?.metadata?.cor}).`
        : ``,
    ];
  }, [itemGraphData, lastItemActivate, activeTCC]);

  const series = useMemo(() => {
    if (!itemGraphData?.dataset?.x || !itemGraphData?.dataset?.y) {
      return [];
    }
    return [
      {
        name: "Frequência de acertos",
        type: "scatter",
        data: itemGraphData.dataset.x.map((valorX, index) => ({
          x: valorX,
          y: itemGraphData.dataset.y[index],
        })),
      },
    ];
  }, [itemGraphData]);

  const options: ApexCharts.ApexOptions = useMemo(() => {
    return {
      chart: {
        id: "tcc-chart",
        type: "line",
        toolbar: {
          offsetX: -5,
          offsetY: 0,
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
        size: [1, 0],
        strokeWidth: 0,
        hover: {
          size: 6,
        },
        colors: chartColor,
      },
      stroke: {
        curve: "straight",
        width: [0, 1],
      },
      xaxis: {
        type: "numeric",
        min: xMin ?? undefined,
        max: xMax ?? undefined,
        tickAmount: isMobile ? 5 : 10,
        axisBorder: {
          show: false,
        },
        labels: {
          style: { colors: axisColor },
          formatter: (val) =>
            val !== undefined && val !== null ? Number(val).toFixed(0) : "",
        },
        tooltip: { enabled: false },
        title: {
          text: "Notas na escala do ENEM",
          style: { color: axisColor, fontWeight: "bold" },
        },
      },
      yaxis: {
        min: 0,
        max: 1,
        tickAmount: 10,
        labels: {
          style: { colors: axisColor },
          formatter: (val) =>
            val !== undefined && val !== null ? Number(val).toFixed(1) : "0.0",
        },
        title: {
          text: "Frequência de acertos",
          style: { color: axisColor, fontWeight: "bold" },
        },
      },
      grid: {
        padding: {
          bottom: 30,
        },
        borderColor: gridColor,
      },
      tooltip: {
        enabled: false,
        shared: false,
        intersect: false,
        theme: "dark",
        enabledOnSeries: [0],
        x: {
          show: true,
          formatter: (val) => `Proficiência: ${Number(val).toFixed(0)}`,
        },
        y: {
          formatter: function (_val, { series, dataPointIndex }) {
            const css = {
              container: ["display: flex", "align-items: center"].join("; "),
              value: [
                "font-weight: 300",
                "opacity: 0.7",
                `color: ${panelColor}`,
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
            let val0 = series[0][dataPointIndex];
            const series0 = series[0];
            if (!val0) {
              for (let i = dataPointIndex; i >= 0; i--) {
                if (series0[i] !== null || series0[i] !== undefined) {
                  val0 = series0[i];
                  break;
                }
              }
            }
            if (!val0) {
              for (let i = dataPointIndex; i >= 0; i--) {
                if (series0[i] !== null || series0[i] !== undefined) {
                  val0 = series0[i];
                  break;
                }
              }
            }
            return `
             <div>
                <div style="${css.container}">
                  <div style="${css.marker2}"></div>
                  <div> 
                    <span style="${css.value}">Frequência de acertos: </span>
                    <span>${Number(val0).toFixed(2)}</span>
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
      legend: {
        position: "bottom",
        labels: { colors: textColor },
        floating: true,
      },
    };
  }, [
    axisColor,
    gridColor,
    xMin,
    chartColor,
    panelColor,
    xMax,
    isMobile,
    textColor,
  ]);

  if (!itemGraphData || xMin === null || xMax === null) {
    return (
      <div className={`${styles.container}`}>
        <div className={styles.header}>
          <div className={styles.title} style={{ color: textColor }}>
            Frequência de acerto do item{" "}
            {lastItemActivateNum != 0 ? lastItemActivateNum : ""}
          </div>
          <div className={styles.subtitle} style={{ color: textColor }}>
            {subtitleText}
          </div>
        </div>
        <div className={styles.loading}>
          <span style={{ color: textColor }}>Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title} style={{ color: textColor }}>
          Frequência de acerto do item{" "}
          {lastItemActivateNum != 0 ? lastItemActivateNum : ""}
        </div>
        <div className={styles.subtitle} style={{ color: textColor }}>
          {subtitleText}
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
