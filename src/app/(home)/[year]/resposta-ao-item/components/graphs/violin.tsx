"use client";

import { useMemo } from "react";
import { useYearData } from "../../../../../../context/year_context";
import { useChartTheme } from "../../../../../../hooks/use_chart_theme";
import { useHomeData } from "../../../../../../context/home_context";
import { useSidebar } from "../../../../../../context/sidebar_context";
import dynamic from "next/dynamic";
import styles from "./graphs.module.css";

const Chart = dynamic(() => import("react-apexcharts"));

export default function ViolinBinsChart() {
  const { violinData, lastItemActivate, lastItemActivateNum } = useYearData();
  const { textColor, axisColor, gridColor } = useChartTheme();
  const { activeTCC } = useHomeData();
  const { isMobile } = useSidebar();

  const maxAbsValue = useMemo(() => {
    if (!violinData) return 100;
    const maxVal = Math.max(...violinData["1"], ...violinData["0"]);
    if (maxVal === 0) return 100;
    const withBuffer = maxVal * 1.1;
    return Math.ceil(withBuffer);
  }, [violinData]);

  const subtitleText = useMemo(() => {
    return [
      `Frequência absoluta de acertos e erros por faixa de proficiência`,
      violinData
        ? `(cod: ${lastItemActivate}; p: ${activeTCC?.metadata?.cor}).`
        : ``,
    ]
      .filter(Boolean)
      .join(" ");
  }, [violinData, lastItemActivate, activeTCC]);

  const series = useMemo(() => {
    if (!violinData) return [];
    return [
      {
        name: "Acertos",
        data: violinData["1"] || [],
      },
      {
        name: "Erros",
        data: (violinData["0"] || []).map((v: number) => -v),
      },
    ];
  }, [violinData]);

  const erroColor = "#FF4560";
  const acertoColor = "#00E396";

  const options: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
        stacked: true,
        toolbar: { show: true },
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
      colors: [acertoColor, erroColor],
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: "90%",
        },
      },
      stroke: {
        width: 1,
        colors: [gridColor],
      },
      dataLabels: { enabled: false },
      tooltip: {
        theme: "dark",
        followCursor: true,
        shared: true,
        intersect: false,
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
                "margin: 0px",
                "padding: 0px",
                "padding: 5px",
              ].join("; "),
              marker1: [
                `width: 10px`,
                `height: 10px`,
                `border-radius: 50%`,
                `background-color: ${erroColor}`,
                `display: inline-block;`,
                "margin-right: 5px",
              ].join("; "),
              marker2: [
                `width: 10px`,
                `height: 10px`,
                `border-radius: 50%`,
                `background-color: ${acertoColor}`,
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
                    <span style="${css.value}">Erraram: </span>
                    <span>
                      ${Math.abs(Number(val1)).toLocaleString("pt-BR", {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                </div>
                <div style="${css.container}">
                  <div style="${css.marker2}"></div>
                  <div> 
                    <span style="${css.value}">Acertaram: </span>
                    <span>
                      ${Number(val0).toLocaleString("pt-BR", {
                        maximumFractionDigits: 0,
                      })}
                    </span>
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
      grid: {
        padding: {
          bottom: 20,
        },
        borderColor: gridColor,
      },
      yaxis: {
        labels: {
          style: { colors: violinData ? axisColor : "#fff" },
        },
      },
      xaxis: {
        categories: violinData?.labels || [],
        axisBorder: {
          show: false,
        },
        min: -maxAbsValue,
        max: maxAbsValue,
        tickAmount: isMobile ? 2 : 4,
        title: {
          text: "Quantidade de Alunos",
          style: { color: axisColor },
        },
        labels: {
          style: { colors: axisColor },
          formatter: function (val): string {
            const absoluteVal = Math.abs(Number(val));
            if (absoluteVal >= 1000) {
              const formatted = (absoluteVal / 1000).toLocaleString("pt-BR", {
                maximumFractionDigits: 1,
              });
              return `${formatted}k`;
            }
            return absoluteVal.toString();
          },
        },
      },
      legend: {
        labels: { colors: textColor },
        inverseOrder: true,
        floating: true,
        offsetX: 20,
        markers: {
          strokeWidth: 0,
          offsetX: -2,
        },
      },
    }),
    [violinData, isMobile, maxAbsValue, textColor, axisColor, gridColor],
  );

  if (!violinData) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title} style={{ color: textColor }}>
            Frequência de resposta ao item{" "}
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
          Frequência de resposta ao item{" "}
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
          type="bar"
          height="100%"
          width="100%"
        />
      </div>
    </div>
  );
}
