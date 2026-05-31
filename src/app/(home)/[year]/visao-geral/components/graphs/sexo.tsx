"use client";

import { useMemo } from "react";
import Chart from "react-apexcharts";
import { useChartTheme } from "../../../../../../hooks/use_chart_theme";
import { useYearData } from "../../../../../../context/year_context";

const doughnutColors = ["rgba(60, 245, 188, 0.7)", "rgba(245, 99, 59, 0.7)"];

export default function SEXO() {
  const { textColor } = useChartTheme();
  const { overviewData } = useYearData();
  const sexoData = overviewData.sexoData;
  const series = useMemo(() => sexoData.datasets[0].data, [sexoData]);
  const absValues = useMemo(() => sexoData.datasets[0].abs_values, [sexoData]);
  const labels = useMemo(() => sexoData.labels, [sexoData]);

  const options: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: "donut",
        toolbar: { show: true },
        animations: {
          enabled: false,
          dynamicAnimation: {
            enabled: false,
          },
        },
      },
      colors: doughnutColors,
      stroke: {
        show: false,
      },
      labels: labels,
      plotOptions: {
        pie: {
          donut: {
            size: "45%",
          },
          offsetY: -5,
        },
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: "12px",
          fontWeight: "light",
          colors: [textColor],
        },
        dropShadow: { enabled: false },
      },
      legend: {
        position: "top",
        labels: { colors: textColor },
        markers: {
          strokeWidth: 0,
          offsetX: -2,
        },
        offsetY: -5,
      },
      tooltip: {
        fillSeriesColor: false,
        theme: "dark",
        y: {
          formatter: function (val, { seriesIndex }) {
            const absolute = absValues[seriesIndex].toLocaleString("pt-BR");
            const label = labels[seriesIndex];
            const css = {
              label: ["font-weight: 300", "opacity: 0.7"].join("; "),
              value: ["font-weight: bold", "margin-left: 4px"].join("; "),
              title: ["margin-bottom: 14px"],
            };
            return `
              <div style="${css.title}">
                <span >${label}</span>
              </div>
              <div>
                <span style="${css.label}">Porcentagem:</span>
                <span style="${css.value}">${val}%</span>
              </div>
              <div style="margin-top: 2px;">
                <span style="${css.label}">Total:</span>
                <span style="${css.value}">${absolute}</span>
              </div>
            `;
          },
          title: {
            formatter: function () {
              return "";
            },
          },
        },
        marker: {
          show: false,
        },
      },
      title: {
        text: "Sexo",
        align: "center",
        style: {
          color: textColor,
          fontSize: "16px",
          fontWeight: "bold",
        },
      },
    }),
    [textColor, absValues, labels],
  );

  return (
    <div style={{ flex: 1 }}>
      <Chart
        options={options}
        series={series}
        type="donut"
        height="100%"
        width="100%"
      />
    </div>
  );
}
