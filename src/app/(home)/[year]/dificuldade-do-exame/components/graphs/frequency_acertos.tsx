"use client";

import { useMemo } from "react";
import Chart from "react-apexcharts";
import { useChartTheme } from "../../../../../../hooks/use_chart_theme";
import { useHomeData } from "../../../../../../context/home_context";
import { useYearData } from "../../../../../../context/year_context";
import styles from "./graphs.module.css";

export default function FrequencyAcertosChart() {
  const { deferredArea } = useHomeData();
  const { dificuldadeDoExame, dificuldadeDoExameAux } = useYearData();

  const activeSelectedRow = dificuldadeDoExameAux.activeSelectedRow;
  const describeDifData = dificuldadeDoExame.describeDifData;
  const frequencyDifData = dificuldadeDoExame.frequencyDifData;

  const { acertosColor, gridColor, axisColor } = useChartTheme();

  const selectedRow = activeSelectedRow;

  const xMin = 0;
  const xMax = 45;

  const getStatDescription = (id: string, valStr: string) => {
    if (!valStr) return "";
    const val = parseFloat(valStr.replace(/\./g, "").replace(",", "."));
    if (id === "skew") {
      if (val > 0) return `Poucos acertos mais frequentes.`;
      if (val < 0) return `Muitos acertos mais frequentes.`;
      return `Distribuição Simétrica.`;
    }
    if (id === "kurtosis") {
      if (val > 0) return `Acertos concentrados perto da média.`;
      if (val < 0) return `Acertos mais dispersos.`;
      return `Curtose Neutra.`;
    }
    return "";
  };

  const series = useMemo(() => {
    if (!frequencyDifData) return [];
    const rawDataArray = frequencyDifData.datasets?.[1]?.data;
    const rawData = Array.isArray(rawDataArray) ? rawDataArray : [];

    const fillIds = ["sd", "q1", "q3", "p99"];

    const dataWithColors = rawData.map((p) => {
      let pointColor = acertosColor["bar"];
      if (
        selectedRow &&
        fillIds.includes(selectedRow.id) &&
        describeDifData?.acertos
      ) {
        const n = describeDifData.acertos;
        let start = 0,
          end = 0;

        // Lógica de destaque baseada nos acertos da área atual
        if (selectedRow.id === "sd") {
          start = Math.round(n.mean) - Math.round(n.sd);
          end = Math.round(n.mean) + Math.round(n.sd);
        } else if (selectedRow.id === "q1") {
          start = Math.round(n.q1);
          end = Math.round(n.max);
        } else if (selectedRow.id === "q3") {
          start = Math.round(n.q3);
          end = Math.round(n.max);
        } else if (selectedRow.id === "p99") {
          start = Math.round(n.p99);
          end = Math.round(n.max);
        }

        if (p.x >= start && p.x <= end) {
          pointColor = acertosColor["fill"];
        }
      }

      return {
        x: p.x,
        y: p.y,
        fillColor: pointColor,
        strokeColor: pointColor,
      };
    });
    return [
      {
        name: `Frequência ${deferredArea}`,
        data: dataWithColors,
      },
    ];
  }, [
    frequencyDifData,
    deferredArea,
    selectedRow,
    describeDifData,
    acertosColor,
  ]);

  const options: ApexCharts.ApexOptions = useMemo(() => {
    const isShape = selectedRow
      ? ["skew", "kurtosis"].includes(selectedRow.id)
      : false;
    const mean = describeDifData?.acertos?.mean || 0;

    // Posição da linha vertical recalculada para a área atual
    const valX =
      isShape || selectedRow?.id === "sd" || selectedRow?.id === "mean"
        ? Math.round(mean)
        : Math.round(
            parseFloat(
              selectedRow?.acerto?.replace(/\./g, "").replace(",", ".") || "0",
            ),
          );

    const rawDataYArray = frequencyDifData?.datasets?.[1]?.data || [];
    const rawDataY = Array.isArray(rawDataYArray) ? rawDataYArray : [];

    const yMax =
      rawDataY.length > 0 ? Math.max(...rawDataY.map((p) => p.y)) : 0;

    return {
      chart: {
        id: `freq-${deferredArea}`,
        type: "bar",
        toolbar: { show: true, offsetX: 0, offsetY: 0 },
        zoom: { enabled: false },
        animations: { enabled: false },
      },
      // title: {
      //   text: 'Frequência relativa dos acertos',
      //   style: { color: textColor, fontSize: '16px', fontWeight: 'bold' }
      // },
      // subtitle: {
      //   text: ['Distribuição da frequência de acertos.'] as any,
      //   style: { color: textColor, fontSize: '13px' }
      // },
      plotOptions: {
        bar: {
          columnWidth: "95%",
          distributed: false,
        },
      },
      dataLabels: { enabled: false },
      xaxis: {
        type: "numeric",
        min: xMin,
        max: xMax,
        tickPlacement: "on",
        tickAmount: 9,
        labels: {
          style: { colors: axisColor },
          formatter: (v) => Number(v).toFixed(0),
        },
        title: {
          text: "Acertos",
          style: { color: axisColor, fontWeight: "bold" },
        },
      },
      yaxis: {
        labels: {
          style: { colors: axisColor },
          formatter: (v) => Number(v).toFixed(0) + "%",
        },
        title: {
          text: "Frequência relativa",
          style: { color: axisColor, fontWeight: "bold" },
        },
      },
      grid: { borderColor: gridColor },
      legend: { show: false },
      tooltip: {
        theme: "dark",
        intersect: false,
        followCursor: true,
        x: {
          formatter: function (value: number) {
            return "Acertos: " + value;
          },
        },
        y: {
          formatter: function (value: number) {
            return value.toFixed(2) + "%";
          },
          title: {
            formatter: function () {
              return "Porcentagem: ";
            },
          },
        },
        marker: {
          show: false,
        },
      },
      annotations: {
        xaxis:
          selectedRow && !isShape
            ? [
                {
                  x: valX,
                  borderColor: acertosColor["line"],
                  borderWidth: 2,
                  label: {
                    text: `${selectedRow.metric}: ${selectedRow.acerto}`,
                    style: {
                      color: "#000",
                      background: acertosColor["line"],
                      fontWeight: "bold",
                    },
                    orientation: "horizontal",
                    offsetX:
                      valX < Math.round(describeDifData?.acertos?.q1)
                        ? 35
                        : valX > Math.round(describeDifData?.acertos?.q3)
                          ? -35
                          : 0,
                  },
                },
              ]
            : [],
        points:
          selectedRow && isShape
            ? [
                {
                  x: 22.5,
                  y: yMax,
                  marker: { size: 0 },
                  label: {
                    text: [
                      `${selectedRow.metric}: ${selectedRow.acerto}`,
                      getStatDescription(selectedRow.id, selectedRow.acerto),
                    ],
                    style: { color: "#fff", background: acertosColor["line"] },
                  },
                },
              ]
            : [],
      },
    };
  }, [
    describeDifData,
    frequencyDifData,
    selectedRow,
    acertosColor,
    axisColor,
    gridColor,
    deferredArea,
  ]);

  // if (!describeDifData?.acertos || !frequencyDifData) {
  //   return <div className={styles.loading}>Carregando gráfico...</div>;
  // }

  return (
    <div style={{ flex: 1 }}>
      <div className={styles.tcc_cabecalho}>
        <div className={styles.tcc_title}>
          <h3 className={styles.tcc_title_h3}>
            Frequência relativa dos acertos
          </h3>
          <p className={styles.tcc_subtitle_p}>
            Distribuição da frequência de acertos.
          </p>
        </div>
      </div>
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
