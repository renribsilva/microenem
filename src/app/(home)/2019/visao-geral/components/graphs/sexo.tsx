'use client'

import { useMemo } from 'react';
import Chart from 'react-apexcharts';
import sexo_data from "../../json/socials/sexo.json";
import presence_data from "../../json/overview/presenca.json";
import { useChartTheme } from "../../../../../../hooks/chart_theme";
import customTooltip from '../../../../../../components/tsx/customTooltip';

export default function SEXO() {

  const { textColor, panelColor } = useChartTheme();

  const doughnutColors = ["rgba(60, 245, 188, 0.7)", "rgba(245, 99, 59, 0.7)"];
  const n = (presence_data[0].subRows[0].total).toLocaleString('pt-BR');

  const series = useMemo(() => sexo_data.datasets[0].data, []);
  const absValues = useMemo(() => sexo_data.datasets[0].abs_values, []);
  const labels = useMemo(() => sexo_data.labels, []);

  const options: ApexCharts.ApexOptions = useMemo(() => ({
    chart: {
      type: 'donut',
      toolbar: { show: true },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 500,
        dynamicAnimation: { enabled: false } 
      }
    },
    stroke: {
      show: true,
      width: 2, 
      colors: [panelColor]
    },
    grid: {
      padding: {
        top: -15, 
      },
    },
    colors: doughnutColors,
    labels: labels,
    plotOptions: {
      pie: {
        donut: {
          size: '45%',
        }
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '12px',
        fontWeight: '300',
        colors: [textColor]
      },
      dropShadow: { enabled: false }
    },
    legend: {
      position: 'top',
      labels: { colors: textColor },
      offsetY: -18  ,
    },
    tooltip: {
      theme: 'dark',
      custom: function({ series, seriesIndex, w }: any) {
        const value = series[seriesIndex]
        const label = w.globals.labels[seriesIndex]
        const absolute = absValues[seriesIndex]
        return customTooltip({ label, value, absolute });
      }
    },
    title: {
      text: 'Sexo',
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
    // }
  }), [textColor, panelColor, n, labels]);

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