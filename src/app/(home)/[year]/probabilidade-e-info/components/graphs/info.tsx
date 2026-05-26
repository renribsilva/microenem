"use client";

import { useMemo } from "react";
import Chart from "react-apexcharts";
import { useChartTheme } from "../../../../../../hooks/use_chart_theme";
import { useYearData } from "../../../../../../context/year_context";
import { useHomeData } from "../../../../../../context/home_context";
import styles from "./graphs.module.css";

export default function InfoChart() {
  const { chartProps, deferredArea } = useHomeData();
  const { chartColor, proficienciaAtual, xMin, xMax } = chartProps;
  const { gridColor, axisColor, textColor } = useChartTheme();
  const {
    abandonadosCodes,
    fixedPalette,
    constantesData,
    probInfoData,
    selectedItems,
    lastItemActivate,
  } = useYearData();

  const infoLabels = probInfoData.infoLabels;
  const infoData = probInfoData.infoData;
  const transformTheta = (theta: number) =>
    theta * constantesData.k + constantesData.d;

  // --- PROCESSAMENTO DE DADOS PARA APEXCHARTS ---
  const { series, hasAbandonedItem, ymax } = useMemo(() => {
    let abandonedFound = false;
    let currentMax = 0; // Inicializa o rastreador do valor máximo

    const codes = Object.keys(selectedItems).map(Number);
    const allItemsInProva = Object.keys(infoData || {});

    const chartSeries = codes
      .map((code) => {
        const itemKey = String(code);
        const isAbandoned = abandonadosCodes.has(code);
        if (isAbandoned) {
          if (code === lastItemActivate) abandonedFound = true;
          return null;
        }

        const status = selectedItems[code]?.status;
        const rawPoints = infoData?.[itemKey] as (number | null)[];
        if (!rawPoints) return null;

        const colorIndex = allItemsInProva.indexOf(itemKey);

        const dataPoints = rawPoints.map((yValue, idx) => {
          // Lógica de inversão se for erro (cuidado: na TRI a info
          // do erro é a mesma do acerto,
          // mas mantive sua lógica de 1 - yValue se for requisito de UI)
          const finalY = yValue || 0;

          // Atualiza o valor máximo global da série
          if (finalY > currentMax) currentMax = finalY;

          return {
            x: transformTheta(infoLabels[idx]),
            y: finalY,
          };
        });

        return {
          item: code,
          name: `Item ${code}`,
          data: dataPoints,
          color: colorIndex !== -1 ? fixedPalette[colorIndex % 45] : "#999",
          strokeDashArray: status === "erro" ? 4 : 0,
        };
      })
      .filter(Boolean);

    // Adiciona uma margem de segurança (ex: 10%) para
    // a curva não encostar no topo
    const safetyMax = currentMax === 0 ? 1 : currentMax * 1.1;

    return {
      series: chartSeries,
      hasAbandonedItem: abandonedFound,
      ymax: safetyMax,
    };
  }, [
    selectedItems,
    infoData,
    fixedPalette,
    infoLabels,
    transformTheta,
    abandonadosCodes,
    lastItemActivate,
  ]);

  // const xMin = Math.floor(transformTheta(-6) / 100) * 100;
  // const xMax = Math.ceil(transformTheta(6) / 100) * 100;

  // --- CONFIGURAÇÕES DO APEXCHARTS ---
  const options: ApexCharts.ApexOptions = useMemo(() => {
    return {
      chart: {
        id: "icc-chart",
        type: "line",
        toolbar: { show: true, offsetX: 0, offsetY: 0 },
        zoom: {
          enabled: false,
        },
        animations: {
          enabled: false,
          dynamicAnimation: {
            enabled: false,
          },
        },
      },
      stroke: {
        curve: "monotoneCubic",
        width: 2,
        lineCap: "round",
        dashArray: series.map((s: any) => s.strokeDashArray),
      },
      colors: series.map((s: any) => s.color),
      xaxis: {
        type: "numeric",
        min: xMin,
        max: xMax,
        labels: {
          style: { colors: axisColor },
          formatter: (val: any) => parseFloat(val).toFixed(0),
        },
        title: {
          text: `Notas na escala do Enem (${deferredArea})`,
          style: { color: axisColor },
        },
        axisBorder: { show: false },
        tooltip: {
          enabled: true,
        },
        crosshairs: {
          show: true,
          width: 1,
          position: "back",
          opacity: 0.9,
          stroke: {
            color: axisColor,
            width: 1,
            dashArray: 3,
          },
        },
      },
      tooltip: {
        enabled: true,
        shared: true,
        custom: function () {
          return "";
        },
        marker: {
          show: false,
        },
      },
      yaxis: {
        min: 0,
        max: ymax,
        tickAmount: 5,
        labels: {
          style: { colors: axisColor },
          formatter: (val) => Number(val).toFixed(1),
        },
        title: { text: "Informação", style: { color: axisColor } },
      },
      grid: { borderColor: gridColor },
      legend: { show: false },
      annotations: {
        xaxis: [
          {
            x: proficienciaAtual,
            borderColor: chartColor || "#ff0000",
            strokeDashArray: 0,
            label: {
              text: `Traço de info. da nota ${proficienciaAtual.toFixed(0)}`,
              style: { color: "#fff", background: chartColor || "#ff0000" },
              borderWidth: 0,
              orientation: "horizontal",
              offsetY: -15,
            },
          },
        ],
      },
    };
  }, [
    series,
    xMin,
    ymax,
    xMax,
    deferredArea,
    proficienciaAtual,
    chartColor,
    axisColor,
    gridColor,
  ]);

  return (
    <div style={{ minHeight: "350px", minWidth: "0", flex: "1 1 50%" }}>
      <div className={styles.tcc_cabecalho}>
        <div className={styles.tcc_title}>
          <h3 className={styles.tcc_title_h3}>Curva de informação do item</h3>
          <p className={styles.tcc_subtitle_p}>
            Pontos da proficiência para os quais o item apresenta maior precisão
            para distinguir quem domina de quem não domina a habilidade
            avalidada.
          </p>
        </div>
      </div>
      <Chart
        options={options}
        series={series as any}
        type="line"
        height="100%"
        // width="100%"
      />
    </div>
  );
}
