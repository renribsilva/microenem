"use client";

import { useMemo, useRef } from "react";
import Chart from "react-apexcharts";
import { useChartTheme } from "../../../../../../hooks/use_chart_theme";
import { useHomeData } from "../../../../../../context/home_context";
import { useYearData } from "../../../../../../context/year_context";
import { useSidebar } from "../../../../../../context/sidebar_context";

export default function AcertosChart() {
  const { chartProps, activeTCC } = useHomeData();
  const { isMobile } = useSidebar();
  const { panelColor, axisColor, textColor } = useChartTheme();
  const { lastItemActivate, lastItemActivateNum, probInfoData, itemGraphData } =
    useYearData();

  const { chartColor } = chartProps;
  const probData = probInfoData.probData;
  const parentRef = useRef<HTMLDivElement>(null);
  const { xMin, xMax } = chartProps;

  const series = useMemo(() => {
    if (!probData || !lastItemActivate || !probData[lastItemActivate]) {
      return [];
    }
    if (!itemGraphData || !Array.isArray(itemGraphData.x)) {
      return [];
    }
    return [
      {
        name: "Frequência de acertos",
        type: "scatter",
        data: itemGraphData.x.map((valorX, index) => ({
          x: valorX,
          y: itemGraphData.y[index],
        })),
      },
    ];
  }, [itemGraphData, lastItemActivate, probData]);

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
        min: xMin,
        max: xMax,
        tickAmount: isMobile ? 5 : 10,
        labels: {
          style: { colors: axisColor },
          // Proteção aqui:
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
      title: {
        text: `Frequência de acertos do item ${lastItemActivateNum}`,
        style: { color: textColor, fontSize: "16px", fontWeight: "bold" },
      },
      subtitle: {
        text: [
          `Frequência relativa de acertos observados em cada`,
          `faixa de proficiência`,
          `(cod: ${lastItemActivate}; p: ${activeTCC?.metadata?.cor}).`,
          // eslint-disable-next-line
        ] as any,
        style: { color: textColor, fontSize: "13px" },
      },
      legend: {
        position: "bottom",
        labels: { colors: textColor },
        floating: true,
      },
    };
  }, [
    activeTCC,
    axisColor,
    xMin,
    chartColor,
    panelColor,
    xMax,
    lastItemActivate,
    lastItemActivateNum,
    isMobile,
    textColor,
  ]);

  return (
    <div ref={parentRef} style={{ height: "350px", width: "100%" }}>
      <Chart
        options={options}
        series={series}
        type="line"
        height="100%"
        width="100%"
      />
    </div>
  );
}
