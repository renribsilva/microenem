'use client'

import Chart from 'react-apexcharts';
import { useChartTheme } from "../../../../../../hooks/use_chart_theme";
import { useMemo } from 'react';
import customTooltip from '../../../../../../components/tsx/customTooltip';
import { useYearData } from '../../../../../../context/year_context';

export default function FX_ETARIA() {

  const { textColor, gridColor } = useChartTheme();
  const { fxEtariaData } = useYearData();

  const barColor = "rgba(255, 208, 53, 1)";

  const series = useMemo(() => fxEtariaData.datasets.map(dataset => ({
    name: 'Porcentagem',
    data: dataset.data.map((val, i) => ({
      x: fxEtariaData.labels[i],
      y: val,
      abs: dataset.abs_values[i]
    }))
  })), []);

  const allValues = fxEtariaData.datasets.flatMap(d => d.data);
  const maxValue = Math.max(...allValues);
  const chartMax = Math.ceil((maxValue + 10) / 10) * 10;

  const options: ApexCharts.ApexOptions = useMemo(() => ({
    chart: {
      type: 'bar',
      animations: {
        enabled: false, 
        dynamicAnimation: {
          enabled: false 
        }
      } 
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
      type: 'numeric', 
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
  }), [textColor, gridColor, series]);

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
