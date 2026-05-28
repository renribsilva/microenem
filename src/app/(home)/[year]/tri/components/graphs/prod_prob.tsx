"use client";

import { useMemo } from "react";
import { useYearData } from "../../../../../../context/year_context";
import { useHomeData } from "../../../../../../context/home_context";
import Chart from "react-apexcharts";
import { useChartTheme } from "../../../../../../hooks/use_chart_theme";
import styles from "./graphs.module.css";

export default function ProdProbChart() {
  const {
    EAPData,
    constantesData,
    activeCodes,
    needUpdateEAP,
    isFetchingEAP,
    isInitialRender,
  } = useYearData();

  const { chartProps, deferredArea, currentYear } = useHomeData();
  const { axisColor, textColor, gridColor } = useChartTheme();
  const { chartColor } = chartProps;

  const isTRIDivergente =
    (deferredArea === "MT" && currentYear === "2009") ||
    (deferredArea === "MT" && currentYear === "2019");

  const series = useMemo(() => {
    if (
      !EAPData?.theta ||
      !EAPData?.posterior ||
      !constantesData.k ||
      !constantesData.d ||
      isInitialRender
    )
      return [];

    const chartPoints = EAPData.theta.map((t: number, i: number) => [
      isTRIDivergente
        ? Number(t.toFixed(2))
        : Number((t * constantesData.k + constantesData.d).toFixed(1)),
      Number(EAPData.posterior[i].toFixed(4)),
    ]);

    return [{ name: "Log-Likelihood", data: chartPoints }];
  }, [EAPData, isInitialRender, constantesData, isTRIDivergente]);

  const valorEAP = Array.isArray(EAPData?.eap)
    ? EAPData.eap[0]
    : (EAPData?.eap ?? 0);

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "area",
      height: 350,
      zoom: { enabled: false },
      toolbar: { show: false },
      animations: { enabled: true, speed: 800 },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3, colors: [chartColor] },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100],
        colorStops: [
          { offset: 0, color: chartColor, opacity: 0.4 },
          { offset: 100, color: chartColor, opacity: 0.05 },
        ],
      },
    },
    xaxis: {
      type: "numeric",
      title: {
        text: isTRIDivergente
          ? `Proficiência (Theta) - ${deferredArea}`
          : `Notas na escala do ENEM - ${deferredArea}`,
        style: { color: axisColor, fontWeight: 600 },
      },
      min: isTRIDivergente
        ? -4
        : Math.round(-4 * constantesData.k + constantesData.d),
      max: isTRIDivergente
        ? 4
        : Math.round(4 * constantesData.k + constantesData.d),
      labels: {
        formatter: (val) =>
          isTRIDivergente
            ? Number(val).toFixed(1)
            : Math.round(Number(val)).toString(),
        style: { colors: axisColor },
      },
      tickAmount: 6,
    },
    yaxis: {
      show: true,
      title: {
        text: "Log-Likelihood",
        style: { color: axisColor, fontWeight: 600 },
      },
      labels: {
        formatter: (val) => Math.floor(val).toString(),
        style: { colors: axisColor },
      },
    },
    annotations: {
      xaxis: isTRIDivergente
        ? [
            {
              x: 0,
              borderColor: "transparent",
              label: {
                // borderColor: '#cbd5e0',
                style: {
                  color: textColor,
                  background: gridColor,
                  fontWeight: "bold",
                  padding: { left: 10, right: 10, top: 10, bottom: 10 },
                },
                text: [
                  "O método (não oficial) de transformação da escala",
                  `apresentou divergência na nota de ${deferredArea}.`,
                ],
                orientation: "horizontal",
                offsetY: 80,
              },
            },
          ]
        : [
            {
              x: valorEAP || 0,
              borderColor: "#f43f5e",
              strokeDashArray: 4,
              label: {
                borderColor: "#f43f5e",
                style: {
                  color: "#fff",
                  background: "#f43f5e",
                  fontWeight: "bold",
                },
                text: [`Nota mais provável`, `${EAPData?.eap || 0}`],
                orientation: "horizontal",
                offsetY: 50,
              },
            },
          ],
    },
    tooltip: {
      enabled: true,
      shared: true,
      custom: () => "",
      marker: { show: false },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: false } },
    },
    colors: [chartColor],
  };

  return (
    <div key={deferredArea} className={styles.eap_container}>
      <div className={styles.eap_button_container}>
        <div className={styles.tcc_cabecalho}>
          <div className={styles.tcc_title}>
            <h3 className={styles.tcc_title_h3}>
              Curva de probabilidade a posteriori
            </h3>
            <p className={styles.tcc_subtitle_p}>
              Função de probabilidade a posteriori da sequência de acertos e
              erros determinada.
            </p>
          </div>
        </div>
      </div>
      {series.length > 0 && EAPData ? (
        <>
          <Chart
            style={{
              opacity: needUpdateEAP ? 0.2 : 1,
              transitionProperty: "opacity",
              transitionDuration: "0.4s",
              transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
              transitionDelay: needUpdateEAP ? "0s" : "0.5s",
            }}
            options={options}
            series={series}
            type="area"
            height={350}
          />
          <div
            style={{ fontSize: "0.75rem", fontWeight: "300", color: "#888" }}
          >
            A nota mais provável é a média ponderada de todas as proficiências
            sob a curva, tendo como peso as probabilidades ajustadas à normal
            N(0,1).
          </div>
        </>
      ) : (
        <div className={styles.eap_initial}>
          <p style={{ fontSize: "16px", fontWeight: 500 }}>
            {isFetchingEAP && activeCodes.length === 0
              ? "Iniciando cálculos..."
              : "Marque as respostas e clique no botão para calcular."}
          </p>
        </div>
      )}
    </div>
  );
}
