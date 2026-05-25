"use client";

import Chart from "react-apexcharts";
import { useMemo, useState } from "react";
import { useChartTheme } from "../../../../../../hooks/use_chart_theme";
import customTooltip from "../../../../../../components/tsx/customTooltip";
import { useHomeData } from "../../../../../../context/home_context";
import { useYearData } from "../../../../../../context/year_context";
import styles from "./graphs.module.css";

type NotaKey =
  | "NU_NOTA_COMP1"
  | "NU_NOTA_COMP2"
  | "NU_NOTA_COMP3"
  | "NU_NOTA_COMP4"
  | "NU_NOTA_COMP5"
  | "NU_NOTA_REDACAO";

export default function NotasRedacaoChart() {
  const { redacaoData } = useYearData();
  const { textColor, gridColor, axisColor } = useChartTheme();
  const { selectedRowId } = useHomeData();
  const [selectedNota, setSelectedNota] = useState<NotaKey>("NU_NOTA_REDACAO");
  const competenciaRowData = redacaoData.competenciaRowData;
  const currentData = (competenciaRowData as any)[selectedNota];
  const nTotal = currentData?.estatisticas?.n || 0;
  const categories = useMemo(
    () => currentData?.frequencia?.labels || [],
    [currentData],
  );

  // Paleta Dark Mode
  const barColor = "#6366f1";
  const accentColor = "#22d3ee";
  const alertColor = "#fb7185";

  const series = useMemo(() => {
    if (!currentData) return [];
    return [
      {
        name: "Participantes",
        data: currentData.frequencia.values
          .map((absVal: number, i: number) => {
            const percentage =
              nTotal > 0 ? Number(((absVal / nTotal) * 100).toFixed(2)) : 0;
            return {
              x: categories[i].toString(),
              y: absVal,
              rel: percentage,
            };
          })
          .reverse(),
      },
    ];
  }, [currentData, nTotal, categories]);

  const options: ApexCharts.ApexOptions = useMemo(() => {
    const metricId = selectedRowId || "media";
    const rawValue = currentData?.estatisticas[metricId];
    const numericValue = Number(rawValue);
    const isSpecialMetric = ["skew", "kurtosis"].includes(metricId);
    const shouldShowAnnotation =
      rawValue !== undefined &&
      !isSpecialMetric &&
      !["n", "sd"].includes(metricId);

    let closestCategory = "";
    if (shouldShowAnnotation && categories.length > 0) {
      closestCategory = categories
        .reduce((prev: number, curr: number) =>
          Math.abs(curr - numericValue) < Math.abs(prev - numericValue)
            ? curr
            : prev,
        )
        .toString();
    }

    return {
      chart: {
        type: "bar",
        animations: { enabled: false },
        toolbar: { show: false },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: "80%",
          borderRadius: 0, // REMOVIDO ARREDONDAMENTO
          dataLabels: { position: "top" },
        },
      },
      colors: [barColor],
      annotations: {
        yaxis: shouldShowAnnotation
          ? [
              {
                y: closestCategory,
                borderColor: accentColor,
                label: {
                  borderColor: accentColor,
                  style: {
                    color: "#000",
                    background: accentColor,
                    fontWeight: "700",
                  },
                  text: `${metricId.toUpperCase()}: ${numericValue.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}`,
                  position: "left",
                  offsetX: 80,
                },
              },
            ]
          : [],
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => {
          if (val >= 1000) {
            return `${(val / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}k`;
          }
          return val.toLocaleString("pt-BR");
        },
        offsetX: 35,
        style: { fontSize: "10px", colors: [axisColor] },
      },
      xaxis: {
        tickAmount: 5,
        labels: {
          style: { colors: axisColor, fontSize: "10px" },
          formatter: (val: number) => {
            if (val >= 1000 || val <= -1000) {
              const formatted = (val / 1000).toLocaleString("pt-BR", {
                minimumFractionDigits: val % 1000 === 0 ? 0 : 1,
                maximumFractionDigits: 1,
              });
              return `${formatted}k`;
            }
            return val.toLocaleString("pt-BR");
          },
        },
        title: { text: "Quantidade de alunos", style: { color: axisColor } },
      },
      yaxis: {
        labels: { style: { colors: axisColor, fontSize: "9px" } },
        title: { text: "Pontuação", style: { color: axisColor } },
      },
      grid: {
        borderColor: gridColor,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: false } },
      },
      tooltip: {
        theme: "dark",
        intersect: false,
        followCursor: true,
        custom: function ({ seriesIndex, dataPointIndex, w }: any) {
          const dataConfig = w.config.series[seriesIndex].data[dataPointIndex];
          return customTooltip({
            label: `Nota: ${dataConfig.x}`,
            value: `${dataConfig.rel.toFixed(1)}`,
            absolute: dataConfig.y.toLocaleString("pt-BR"),
          });
        },
      },
    };
  }, [
    textColor,
    gridColor,
    selectedNota,
    selectedRowId,
    currentData,
    categories,
  ]);

  const selectOptions: { key: NotaKey; label: string }[] = [
    { key: "NU_NOTA_REDACAO", label: "Nota Total" },
    { key: "NU_NOTA_COMP1", label: "C1" },
    { key: "NU_NOTA_COMP2", label: "C2" },
    { key: "NU_NOTA_COMP3", label: "C3" },
    { key: "NU_NOTA_COMP4", label: "C4" },
    { key: "NU_NOTA_COMP5", label: "C5" },
  ];

  const baseHeight = 1200;
  const isCompetencia = selectedNota.includes("COMP");
  const calculatedHeight = isCompetencia ? 310 : baseHeight;

  return (
    <div style={{ width: "100%" }}>
      {/* Navegador Estilizado */}
      <div
        style={{
          display: "flex",
          gap: "2px",
          marginBottom: "20px",
          borderBottom: `1px solid ${gridColor}`,
          paddingBottom: "2px",
        }}
      >
        {selectOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSelectedNota(opt.key)}
            style={{
              padding: "8px 16px",
              borderRadius: "4px 4px 0 0", // Bordas levemente arredondadas apenas no topo
              border: "none",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: selectedNota === opt.key ? "bold" : "normal",
              backgroundColor:
                selectedNota === opt.key ? barColor : "transparent",
              color: selectedNota === opt.key ? "#fff" : textColor,
              transition: "0.2s",
              opacity: selectedNota === opt.key ? 1 : 0.6,
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div style={{ minHeight: `${calculatedHeight}px` }}>
        <Chart
          options={options}
          series={series}
          type="bar"
          height={calculatedHeight}
          width="100%"
        />
        {/* <div className={styles.table_footer}>
          Aviso: não inclui redações de reaplicações (o que explica o ano de 2020 ter, nesta análise, 27 redações nota mil e não 28 como divulgado pelo Inep)
        </div> */}
      </div>
    </div>
  );
}
