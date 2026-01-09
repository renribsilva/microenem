'use client'

import Chart from 'react-apexcharts';
import fx_etaria_data from "../../json/socials/faixa_etaria.json";
import presence_data from "../../json/overview/presenca.json";
import { useChartTheme } from "../../../../../../hooks/chart_theme";
import { useMemo } from 'react';
import customTooltip from '../../../../../../components/tsx/customTooltip';

export default function FX_ETARIA() {

  const { textColor, gridColor } = useChartTheme();

  const barColor = "rgba(255, 208, 53, 1)";
  const n = (presence_data[0].subRows[0].total).toLocaleString('pt-BR');

  // ALTERAÇÃO 1: Mapear para objeto pro tooltip ler 'x', 'y' e 'abs'
  const series = useMemo(() => fx_etaria_data.datasets.map(dataset => ({
    name: 'Porcentagem',
    data: dataset.data.map((val, i) => ({
      x: fx_etaria_data.labels[i],
      y: val,
      abs: dataset.abs_values[i]
    }))
  })), []);

  const allValues = fx_etaria_data.datasets.flatMap(d => d.data);
  const maxValue = Math.max(...allValues);
  const chartMax = Math.ceil((maxValue + 10) / 10) * 10;

  const options: ApexCharts.ApexOptions = useMemo(() => ({
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
      // ALTERAÇÃO 2: categories removido (já está no mapeamento da series)
      type: 'category', 
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
      hideDelay: 0,
      followCursor: true,
      custom: function({ seriesIndex, dataPointIndex, w }: any) {
        const dataConfig = w.config.series[seriesIndex].data[dataPointIndex];       
        return customTooltip({ 
          label: dataConfig.x, 
          value: dataConfig.y, 
          absolute: dataConfig.abs 
        });
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
    // subtitle: {
    //   text: `*n = ${n}`,
    //   align: 'center',
    //   style: {
    //     color: textColor,
    //     fontSize: '13px',
    //     fontWeight: 'normal',
    //   }
    // },
    legend: {
      show: false
    }
  }), [textColor, gridColor, n, series]);

  return (
    <div style={{ flex: 1}}>
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