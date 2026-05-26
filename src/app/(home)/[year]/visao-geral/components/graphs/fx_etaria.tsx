"use client";

import Chart from "react-apexcharts";
import { useChartTheme } from "../../../../../../hooks/use_chart_theme";
import { useMemo } from "react";
import { useYearData } from "../../../../../../context/year_context";

interface CorRacaItem {
  x: string;
  y: number;
  abs: number;
}

interface TreemapSeries {
  name: string;
  data: CorRacaItem[];
}

export default function FX_ETARIA() {
  const { panelColor, textColor, gridColor } = useChartTheme();
  const { overviewData } = useYearData();
  const fxEtariaData = overviewData.fxEtariaData;
  const barColor = "rgba(255, 208, 53, 1)";
  const series: TreemapSeries[] = useMemo(
    () =>
      fxEtariaData.datasets.map((dataset) => ({
        name: "Porcentagem",
        data: dataset.data.map((val, i) => ({
          x: fxEtariaData.labels[i],
          y: val,
          abs: dataset.abs_values[i],
        })),
      })),
    [fxEtariaData],
  );

  const allValues = fxEtariaData.datasets.flatMap((d) => d.data);
  const maxValue = Math.max(...allValues);
  const chartMax = Math.ceil((maxValue + 10) / 10) * 10;

  const options: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
        animations: {
          enabled: false,
          dynamicAnimation: {
            enabled: false,
          },
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          dataLabels: {
            position: "top",
          },
        },
      },
      colors: [barColor],
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val}%`,
        offsetX: 20,
        style: {
          fontSize: "10px",
          fontWeight: "300",
          colors: [textColor],
        },
      },
      xaxis: {
        type: "numeric",
        max: chartMax,
        labels: {
          style: {
            colors: textColor,
            fontSize: "10px",
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: textColor },
        },
      },
      grid: {
        borderColor: gridColor,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: false } },
        padding: {
          top: -20,
        },
      },
      tooltip: {
        theme: "dark",
        intersect: false,
        followCursor: true,
        arrow: false,
        marker: {
          show: false,
        },
        inverseOrder: true,
        y: {
          formatter: function (val, { seriesIndex, dataPointIndex, w }) {
            const series = w.config.series as { data: CorRacaItem[] }[];
            const item = series[seriesIndex].data[dataPointIndex];
            const absoluto = item.abs.toLocaleString("pt-BR");
            const css = {
              label: ["font-weight: 300", "opacity: 0.7"].join("; "),
              value: ["font-weight: bold", "margin-left: 4px"].join("; "),
            };
            return `
              <div>
                <span style="${css.label}">Porcentagem:</span>
                <span style="${css.value}">${val}%</span>
              </div>
              <div style="margin-top: 2px;">
                <span style="${css.label}">Total:</span>
                <span style="${css.value}">${absoluto}</span>
              </div>
            `;
          },
          title: {
            formatter: function () {
              return "";
            },
          },
        },
        x: {
          show: true,
          formatter: function (val) {
            const css = {
              bg: [`color: ${panelColor}`, "padding-left: 5px"].join("; "),
            };
            return `<span style="${css.bg}">${val}<span>`;
          },
        },
      },
      title: {
        text: "Faixa Etária",
        align: "center",
        style: {
          color: textColor,
          fontSize: "16px",
          fontWeight: "bold",
        },
      },
      legend: {
        show: false,
      },
    }),
    [textColor, gridColor, panelColor, chartMax],
  );

  return (
    <div style={{ flex: 1 }}>
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
