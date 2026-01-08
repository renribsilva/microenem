'use client'

import Chart from 'react-apexcharts';
import fx_etaria_data from "../../json/socials/faixa_etaria.json";
import presence_data from "../../json/overview/presenca.json";
import { useChartTheme } from "../../../../../../hooks/chart_theme";
import { useMemo } from 'react';

export default function FX_ETARIA() {

  const { textColor, gridColor } = useChartTheme();

  const barColor = "rgba(255, 208, 53, 1)";
  const n = (presence_data[0].subRows[0].total).toLocaleString('pt-BR');

  const series = useMemo(() => fx_etaria_data.datasets.map(dataset => ({
    name: 'Porcentagem',
    data: dataset.data
  })), []);

  const categories = fx_etaria_data.labels;
  const allValues = fx_etaria_data.datasets.flatMap(d => d.data);
  const maxValue = Math.max(...allValues);
  const chartMax = Math.ceil((maxValue + 10) / 10) * 10;

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
    },
    plotOptions: {
      bar: {
        horizontal: true,
        dataLabels: {
          position: 'top',
        },
      }
    },
    colors: [barColor],
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val}%`,
      offsetX: 20,
      style: {
        fontSize: '10px',
        fontWeight: '300',
        colors: [textColor]
      }
    },
    xaxis: {
      categories: categories,
      max: chartMax,
      labels: {
        style: { colors: textColor }
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: textColor }
      }
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
      theme: 'dark',
      intersect: false,
      followCursor: true,
      marker: {
          show: false,
      },
      y: {
        formatter: (val, { seriesIndex, dataPointIndex, w }) => {
          // Acessando valores absolutos como você fazia no Chart.js
          const absValue = fx_etaria_data.datasets[seriesIndex].abs_values[dataPointIndex];
          const absolutoFormatado = absValue.toLocaleString('pt-BR');
          return `Porcentagem: ${val}% <br/> Total: ${absolutoFormatado}`;
        },
        title: {
          formatter: () => '', // REMOVE O NOME DA SÉRIE/PORCENTAGEM QUE APARECE ANTES
        },
      }
    },
    title: {
      text: 'Faixa Etária',
      align: 'center',
      style: {
        color: textColor,
        fontSize: '16px',
        fontWeight: 'bold'
      }
    },
    subtitle: {
      text: `*n = ${n}`,
      align: 'center',
      style: {
        color: textColor,
        fontSize: '13px',
        fontWeight: 'normal',
      }
    },
    legend: {
      show: false
    }
  };

  return (
    <Chart
      options={options}
      series={series}
      type="bar"
      height="100%"
      width="100%"
    />
  );
}