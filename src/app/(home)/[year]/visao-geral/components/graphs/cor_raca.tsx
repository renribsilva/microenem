"use client";

import Chart from "react-apexcharts";
import { useChartTheme } from "../../../../../../hooks/use_chart_theme";
import customTooltip from "../../../../../../components/tsx/customTooltip";
import { useMemo } from "react";
import { useYearData } from "../../../../../../context/year_context";

export default function COR_RACA() {
  const { textColor, panelColor } = useChartTheme();
  const { overviewData } = useYearData();
  const corRacaData = overviewData.corRacaData;

  const series = [
    {
      data: corRacaData.datasets[0].tree
        .map((item: any) => ({
          x: item.label,
          y: item.value,
          abs: item.abs,
        }))
        .sort((a: any, b: any) => b.y - a.y),
    },
  ];

  const options: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: "treemap",
        toolbar: { show: true },
        background: "transparent",
        animations: {
          enabled: false,
          dynamicAnimation: {
            enabled: false,
          },
        },
      },
      stroke: {
        show: true,
        width: 2,
        colors: [panelColor],
      },
      title: {
        text: "Cor ou raça",
        align: "center",
        style: {
          color: textColor,
          fontSize: "16px",
          fontWeight: "bold",
        },
      },
      // subtitle: {
      //   text: `*n = ${n}`,
      //   align: 'center',
      //   style: {
      //     color: textColor,
      //     fontSize: '13px',
      //     fontWeight: 'normal',
      //   }
      // },
      colors: [
        "#1D85B1",
        "#2D6B86",
        "#009BDB",
        "#2E4E5C",
        "#222E33",
        "#1B2429",
      ],
      plotOptions: {
        treemap: {
          distributed: true,
          enableShades: false,
          borderRadius: 0,
        },
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: "12px",
          fontWeight: "bold",
        },
        textAnchor: "middle",
        distributed: true,
        offsetY: -4,
        formatter: (val: any, op?: any) => {
          const label = String(val);
          // Se o texto for muito longo e a área for pequena, abrevia ou corta
          if (op.value < 8 && label.length > 10) {
            return [label.substring(0, 8) + "...", `${op.value}%`];
          }
          return [label, `${op.value}%`];
        },
      },
      tooltip: {
        theme: "dark",
        custom: function ({ seriesIndex, dataPointIndex, w }: any) {
          const data = w.config.series[seriesIndex].data[dataPointIndex];
          const label = data.x;
          const value = data.y;
          const absolute = data.abs;
          return customTooltip({ label, value, absolute });
        },
      },
    }),
    [textColor, panelColor, series],
  );

  return (
    <div style={{ flex: 1 }}>
      <Chart
        options={options}
        series={series}
        type="treemap"
        height="100%"
        width="100%"
      />
    </div>
  );
}
