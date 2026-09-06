"use client";

import { useMemo } from "react";
import { useChartTheme } from "../../../../../../hooks/use_chart_theme";
import { useYearData } from "../../../../../../context/year_context";
import styles from "./graphs.module.css";
import { useSidebar } from "../../../../../../context/sidebar_context";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function DensityNotasChart() {
  const { isMobile } = useSidebar();
  const { acertosData, acertosNum } = useYearData();
  const { gridColor, textColor, axisColor } = useChartTheme();

  const chartData = useMemo(() => {
    if (!acertosData || acertosNum === null) return null;
    const current = acertosData[String(acertosNum)];
    if (!current?.density) return null;

    const xRaw = current.density.x;
    const yRaw = current.density.y;

    const xArray = Array.isArray(xRaw) ? xRaw : [xRaw];
    const yArray = Array.isArray(yRaw) ? yRaw : [yRaw];

    return {
      densityPoints: xArray.map((xVal: number, i: number) => ({
        x: xVal,
        y: yArray[i],
      })),
      minX: xArray[0],
      maxX: xArray[xArray.length - 1],
      mean: current.mean,
    };
  }, [acertosData, acertosNum]);

  const series = useMemo(
    () => [
      {
        name: "Densidade",
        data: chartData?.densityPoints || [],
      },
    ],
    [chartData],
  );

  const options: ApexCharts.ApexOptions = useMemo(() => {
    if (!chartData) return {};
    return {
      chart: {
        type: "area",
        toolbar: { show: true },
        animations: {
          enabled: false,
          dynamicAnimation: {
            enabled: false,
          },
        },
        zoom: {
          enabled: false,
        },
      },
      // Paleta: Azul Turquesa / Ciano
      colors: ["#00B5AD"],
      fill: {
        type: "solid",
        opacity: 0.2,
      },
      stroke: {
        curve: "smooth",
        width: 3,
      },
      xaxis: {
        type: "numeric",
        tickAmount: isMobile ? 5 : 10,
        min: chartData.minX,
        max: chartData.maxX,
        labels: {
          style: { colors: axisColor },
          formatter: (v) => Number(v).toFixed(1),
        },
        title: { text: "Notas na escala do ENEM", style: { color: axisColor } },
      },
      yaxis: {
        labels: {
          style: { colors: axisColor },
          formatter: (v) => Number(v).toFixed(3),
        },
        title: { text: "Densidade f(x)", style: { color: axisColor } },
      },
      grid: { borderColor: gridColor, strokeDashArray: 4 },
      dataLabels: { enabled: false },
      tooltip: { enabled: false },
      annotations: {
        xaxis: [
          {
            x: chartData.mean,
            borderColor: "#F2711C",
            strokeDashArray: 5,
            borderWidth: 2,
            label: {
              text:
                chartData?.mean != null
                  ? `MÉDIA: ${Number(chartData.mean).toFixed(1)}`
                  : "MÉDIA: ---",
              position: "left",
              orientation: "horizontal",
              offsetY: -105,
              style: {
                color: "#fff",
                background: "#1B1C1D",
                fontSize: "11px",
                fontWeight: "bold",
                padding: { left: 10, right: 10, top: 6, bottom: 6 },
              },
              borderWidth: 1.5,
              borderColor: "#F2711C",
            },
          },
        ],
      },
    };
  }, [chartData, gridColor, isMobile, axisColor]);

  if (!acertosData) {
    return (
      <div className={`${styles.container}`}>
        <div className={styles.header}>
          <div className={styles.title} style={{ color: textColor }}>
            Distribuição das notas: {acertosNum} acertos
          </div>
          <div className={styles.subtitle} style={{ color: textColor }}>
            Pontos da proficiência para os quais as notas são mais frequentes.
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
          Distribuição das notas: {acertosNum} acertos
        </div>
        <div className={styles.subtitle} style={{ color: textColor }}>
          Pontos da proficiência para os quais as notas são mais frequentes.
        </div>
      </div>
      <div className={styles.chartWrapper}>
        <Chart
          options={options}
          series={series}
          type="area"
          height="100%"
          width="100%"
        />
      </div>
      <div className={styles.table_footer}>
        Observação: 0/x e x/x acertos são casos de sequências de respostas
        idênticas e, à primeira vista, deveriam apresentar valores iguais para
        max, min e média. No entando, alguns cadernos da mesma área podem conter
        um pool de itens distintos, como é o caso da área de Linguagens que tem
        tanto questões de Inglês quanto de Espanhol. Essa diferença reflete na
        nota final do exame, mesmo que a sequência de respostas seja idêntica.
      </div>
    </div>
  );
}
