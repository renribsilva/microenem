'use client'

import Chart from 'react-apexcharts';
import notasData from "../../json/notas_redacao.json";
import { useMemo } from 'react';
import { useChartTheme } from '../../../../../../hooks/use_chart_theme';
import customTooltip from '../../../../../../components/tsx/customTooltip';

export default function NotasRedacaoChart() {

  const { textColor, gridColor } = useChartTheme();

  const barColor = "rgba(255, 208, 53, 1)";
  const nTotal = notasData?.datasets[0]?.n_total || 0;
  const nFormatted = nTotal.toLocaleString('pt-BR');

  const series = useMemo(() => {
    return notasData?.datasets.map(dataset => ({
      name: 'Participantes',
      // Adicionado .reverse() no final para inverter a ordem das notas no eixo Y
      data: dataset.data.map((absVal, i) => {
        const percentage = Number(((absVal / nTotal) * 100).toFixed(2));
        return {
          x: notasData.labels[i],
          y: absVal,
          rel: percentage
        };
      }).reverse() 
    }));
  }, [nTotal]);

  const options: ApexCharts.ApexOptions = useMemo(() => ({
    chart: {
      type: 'bar',
      animations: { enabled: false },
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '80%',
        dataLabels: { position: 'top' },
      }
    },
    colors: [barColor],
    dataLabels: {
      enabled: true,
      formatter: (val: number) => val.toLocaleString('pt-BR'),
      offsetX: 45,
      style: { fontSize: '10px', colors: [textColor] }
    },
    xaxis: {
      type: 'category', // Melhor para barras horizontais com valores grandes
      tickAmount: 5,     // Força o gráfico a mostrar menos divisões no eixo X
      labels: {
        style: { 
          colors: textColor,
          fontSize: '10px' 
        },
        formatter: (val) => {
          if (!val) return "0";
          const num = Number(val);
          // Se o número for maior que 1000, usa "k" para economizar espaço
          return num >= 1000 ? `${(num / 1000).toFixed(0)}k` : num.toString();
        }
      },
      axisBorder: { show: false },
    },
    yaxis: {
      labels: { style: { colors: textColor } }
    },
    grid: {
      borderColor: gridColor,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
    tooltip: {
      theme: 'dark',
      intersect: false,
      followCursor: true,
      custom: function({ seriesIndex, dataPointIndex, w }: any) {
        const dataConfig = w.config.series[seriesIndex].data[dataPointIndex];       
        return customTooltip({ 
          label: `Nota: ${dataConfig.x}`, 
          value: `${dataConfig.rel}`,
          absolute: dataConfig.y.toLocaleString('pt-BR')
        });
      }
    },
    title: {
      text: 'Notas de Redação',
      align: 'left',
      style: { color: textColor, fontSize: '16px', fontWeight: 'bold' }
    },
    subtitle: {
      text: [`Frequência absoluta das notas de redação`] as any,
      align: 'left',
      style: { color: textColor, fontSize: '12px' }
    },
    legend: { show: false }
  }), [textColor, gridColor, nFormatted]);

  return (
    <div style={{ minHeight: '1200px', width: '100%' }}>
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