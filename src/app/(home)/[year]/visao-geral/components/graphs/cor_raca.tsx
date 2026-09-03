"use client";

import { useChartTheme } from "../../../../../../hooks/use_chart_theme";
import { useMemo } from "react";
import { useYearData } from "../../../../../../context/year_context";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface CorRacaItem {
  x: string;
  y: number;
  abs: number;
}

export default function COR_RACA() {
  const { textColor } = useChartTheme();
  const { overviewData } = useYearData();
  const corRacaData = overviewData?.corRacaData;

  const series: { data: CorRacaItem[] }[] = useMemo(() => {
    if (!corRacaData?.datasets?.[0]?.tree) {
      return [{ data: [] }];
    }

    return [
      {
        data: corRacaData.datasets[0].tree
          .map((item) => ({
            x: item.label,
            y: item.value,
            abs: item.abs,
          }))
          .sort((a, b) => b.y - a.y),
      },
    ];
  }, [corRacaData]);

  const options: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: "treemap",
        toolbar: { show: true },
        animations: {
          enabled: false,
          dynamicAnimation: {
            enabled: false,
          },
        },
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
          useFillColorAsStroke: true,
        },
      },
      dataLabels: {
        distributed: true,
        style: {
          fontSize: "12px",
          fontWeight: "bold",
        },
        offsetY: -4,
        formatter: function (val, { seriesIndex, dataPointIndex, w }) {
          const series = w.config.series as { data: CorRacaItem[] }[];
          const item = series?.[seriesIndex]?.data?.[dataPointIndex];
          if (!item) return [String(val), ""];
          return [String(val), `${item.y}%`];
        },
      },
      tooltip: {
        theme: "dark",
        y: {
          formatter: function (val, { seriesIndex, dataPointIndex, w }) {
            const series = w.config.series as { data: CorRacaItem[] }[];
            const item = series?.[seriesIndex]?.data?.[dataPointIndex];
            if (!item) return "";
            const absoluto = item.abs.toLocaleString("pt-BR");
            const css = {
              label: ["font-weight: 300", "opacity: 0.7"].join("; "),
              value: ["font-weight: bold", "margin-left: 4px"].join("; "),
            };
            return `
              <div style="margin-top: 2px;">
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
              bg: [`color: #fff`, "padding-left: 5px"].join("; "),
            };
            return `<span style="${css.bg}">${val}<span>`;
          },
        },
        marker: {
          show: false,
        },
      },
    }),
    [textColor],
  );

  if (!corRacaData?.datasets?.[0]?.tree) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <span style={{ color: textColor }}>Carregando...</span>
      </div>
    );
  }

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
