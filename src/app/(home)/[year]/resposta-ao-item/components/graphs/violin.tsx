"use client";

import { useMemo } from "react";
import Chart from "react-apexcharts";
import { useYearData } from "../../../../../../context/year_context";
import { useChartTheme } from "../../../../../../hooks/use_chart_theme";
import { useHomeData } from "../../../../../../context/home_context";
import { useSidebar } from "../../../../../../context/sidebar_context";

export default function ViolinBinsChart() {
  const { respostaAoItemData, lastItemActivate, lastItemActivateNum } =
    useYearData();
  const { panelColor, textColor, axisColor, gridColor } = useChartTheme();
  const { activeTCC } = useHomeData();
  const { isMobile } = useSidebar();

  const scoreData = respostaAoItemData.scoreData;

  const binsData = useMemo(() => {
    if (!scoreData || !lastItemActivate || !scoreData[lastItemActivate])
      return null;
    const rawBins = scoreData[lastItemActivate].bins;
    if (
      !rawBins ||
      !Array.isArray(rawBins["0"]) ||
      !Array.isArray(rawBins["1"]) ||
      !Array.isArray(rawBins.labels)
    ) {
      return null;
    }
    const v0 = rawBins["0"];
    const v1 = rawBins["1"];
    const labels = rawBins.labels;
    const filteredIndices = labels
      .map((_, i) => i)
      .filter((i) => v0[i] > 0 || v1[i] > 0);
    return {
      "0": filteredIndices.map((i) => v0[i]).reverse(),
      "1": filteredIndices.map((i) => v1[i]).reverse(),
      labels: filteredIndices.map((i) => labels[i]).reverse(),
    };
  }, [scoreData, lastItemActivate]);

  const maxAbsValue = useMemo(() => {
    if (!binsData) return 100;
    const maxVal = Math.max(...binsData["1"], ...binsData["0"]);
    if (maxVal === 0) return 100;
    const withBuffer = maxVal * 1.1;
    return Math.ceil(withBuffer);
  }, [binsData]);

  const series = useMemo(() => {
    if (!binsData) return [];
    return [
      {
        name: "Acertos",
        data: binsData["1"] || [],
      },
      {
        name: "Erros",
        data: (binsData["0"] || []).map((v: number) => -v),
      },
    ];
  }, [binsData]);

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
          style: { colors: axisColor },
        },
      },
      xaxis: {
        categories: binsData?.labels || [],
        axisBorder: {
          show: false,
        },
        min: -maxAbsValue,
        max: maxAbsValue,
        tickAmount: isMobile ? 2 : 4,
        title: {
          text: "Quantidade de Alunos",
          style: { color: axisColor },
          // eslint-disable-next-line
        } as any,
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
      title: {
        text: `Frequência de resposta ao item ${lastItemActivateNum}`,
        style: { color: textColor, fontSize: "16px", fontWeight: "bold" },
      },
      subtitle: {
        text: [
          `Frequência absoluta de acertos e erros`,
          `por faixa de proficiência`,
          `(cod: ${lastItemActivate}; p: ${activeTCC?.metadata?.cor || ""}).`,
          // eslint-disable-next-line
        ] as any,
        style: { color: textColor, fontSize: "13px" },
      },
    }),
    [
      binsData,
      isMobile,
      lastItemActivate,
      activeTCC,
      maxAbsValue,
      textColor,
      axisColor,
      panelColor,
      lastItemActivateNum,
      gridColor,
    ],
  );

  return (
    <div style={{ height: "350px" }}>
      <Chart
        options={options}
        series={series}
        type="bar"
        height="100%"
        width="100%"
      />
    </div>
  );
}
