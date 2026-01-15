'use client'

import { useMemo } from 'react';
import Chart from 'react-apexcharts';
import styles from "./graphs.module.css";
import { useFrequency } from '../../../../../../hooks/use_frequency_data';
import { useChartTheme } from '../../../../../../hooks/use_chart_theme';
import customTooltip from '../../../../../../components/tsx/customTooltip';
import { useHomeData } from '../../../../../../context/home_context';
import { useNineteenData } from '../../../../../../context/nineteen_context';

export default function FrequencyAcertosChart() {
  
  const { deferredArea } = useHomeData();
  const { describeData, activeSelectedRow } = useNineteenData();
  const { frequencyData } = useFrequency(deferredArea);
  const { acertosColor, gridColor, axisColor, textColor } = useChartTheme();

  const selectedRow = activeSelectedRow;

  const xMin = 0;
  const xMax = 45;

  const getStatDescription = (id: string, valStr: string) => {
    if (!valStr) return "";
    const val = parseFloat(valStr.replace(/\./g, '').replace(',', '.'));
    if (id === 'skew') {
      if (val > 0) return `Poucos acertos mais frequentes.`;
      if (val < 0) return `Muitos acertos mais frequentes.`;
      return `Distribuição Simétrica.`;
    }
    if (id === 'kurtosis') {
      if (val > 0) return `Acertos concentrados perto da média.`;
      if (val < 0) return `Acertos mais dispersos.`;
      return `Curtose Neutra.`;
    }
    return "";
  };

  const series = useMemo(() => {
    if (!frequencyData) return [];
    const rawData = frequencyData.datasets?.[1]?.data || [];
    const fillIds = ['sd', 'q1', 'q3', 'p99']; 
    
    const dataWithColors = rawData.map((p: any) => {
      let pointColor = acertosColor["bar"]; 
      if (selectedRow && fillIds.includes(selectedRow.id) && describeData?.acertos) {
        const n = describeData.acertos;
        let start = 0, end = 0;
        
        // Lógica de destaque baseada nos acertos da área atual
        if (selectedRow.id === 'sd') { 
          start = Math.round(n.mean) - Math.round(n.sd); 
          end = Math.round(n.mean) + Math.round(n.sd); 
        }
        else if (selectedRow.id === 'q1') { start = Math.round(n.q1); end = Math.round(n.max); }
        else if (selectedRow.id === 'q3') { start = Math.round(n.q3); end = Math.round(n.max); }
        else if (selectedRow.id === 'p99') { start = Math.round(n.p99); end = Math.round(n.max); }       
        
        if (p.x >= start && p.x <= end) {
          pointColor = acertosColor["fill"]; 
        }
      }

      return {
        x: p.x,
        y: p.y,
        fillColor: pointColor,
        strokeColor: pointColor
      };
    });
    return [{
      name: `Frequência ${deferredArea}`,
      data: dataWithColors
    }];
  }, [frequencyData, deferredArea, selectedRow, describeData, acertosColor]);

  const options: ApexCharts.ApexOptions = useMemo(() => {
    const isShape = selectedRow ? ['skew', 'kurtosis'].includes(selectedRow.id) : false;
    const mean = describeData?.acertos?.mean || 0;
    
    // Posição da linha vertical recalculada para a área atual
    const valX = (isShape || selectedRow?.id === 'sd' || selectedRow?.id === 'mean')
      ? Math.round(mean) 
      : Math.round(parseFloat(selectedRow?.acerto?.replace(/\./g, '').replace(',', '.') || "0"));

    const rawDataY = frequencyData?.datasets?.[1]?.data || [];
    const yMax = rawDataY.length > 0 
      ? Math.max(...rawDataY.map((p: any) => p.y)) 
      : 0;

    return {
      chart: {
        id: `freq-${deferredArea}`,
        type: 'bar',
        toolbar: { show: true, offsetX: 0, offsetY: 0 },
        zoom: { enabled: false },
        animations: { enabled: false } 
      },
      title: {
        text: 'Frequência relativa dos acertos',
        style: { color: textColor, fontSize: '16px', fontWeight: 'bold' }
      },
      subtitle: {
        text: ['Distribuição da frequência de acertos.'] as any,
        style: { color: textColor, fontSize: '13px' }
      },
      plotOptions: {
        bar: {
          columnWidth: '95%',
          distributed: false,
        }
      },
      dataLabels: { enabled: false },
      xaxis: {
        type: 'numeric',
        min: xMin,
        max: xMax,
        tickPlacement: 'on', 
        tickAmount: 9,
        labels: { 
            style: { colors: axisColor },
            formatter: (v: any) => Number(v).toFixed(0)
        },
        title: { text: 'Acertos', style: { color: axisColor, fontWeight: 'bold' } }
      },
      yaxis: {
        labels: { 
            style: { colors: axisColor },
            formatter: (v) => v.toFixed(0) + '%'
        },
        title: { text: 'Frequência relativa', style: { color: axisColor, fontWeight: 'bold' } }
      },
      grid: { borderColor: gridColor },
      legend: { show: false },
      tooltip: {
        theme: 'dark',
        custom: function({ seriesIndex, dataPointIndex, w }: any) {
          const configPonto = w.config.series[seriesIndex].data[dataPointIndex];
          const acertosReal = configPonto.x;
          const porcentagem = configPonto.y;
          const valorAbsoluto = frequencyData?.datasets?.[0]?.data?.[dataPointIndex]?.y || 0;
          return customTooltip({ 
            label: `Acertos ${acertosReal}`, 
            value: porcentagem.toFixed(1), 
            absolute: valorAbsoluto 
          });
        }
      },
      annotations: {
        xaxis: (selectedRow && !isShape) ? [
          {
            x: valX,
            borderColor: acertosColor["line"],
            borderWidth: 2,
            label: {
              text: `${selectedRow.metric}: ${selectedRow.acerto}`,
              style: { color: '#000', background: acertosColor["line"], fontWeight: 'bold' },
              orientation: 'horizontal',
              offsetX: valX < Math.round(describeData?.acertos?.q1) 
                ? 35 
                : (valX > Math.round(describeData?.acertos?.q3) ? -35 : 0)
            },
          }
        ] : [],
        points: (selectedRow && isShape) ? [
          {
            x: 22.5,
            y: yMax,
            marker: { size: 0 },
            label: {
              text: [
                `${selectedRow.metric}: ${selectedRow.acerto}`,
                getStatDescription(selectedRow.id, selectedRow.acerto)
              ],
              style: { color: '#fff', background: acertosColor["line"] }
            }
          }
        ] : []
      }
    };
  }, [describeData, frequencyData, selectedRow, acertosColor, axisColor, gridColor, deferredArea, textColor]);

  // if (!describeData?.acertos || !frequencyData) {
  //   return <div className={styles.loading}>Carregando gráfico...</div>;
  // }

  return (
    <div style={{ flex: 1}}>
      <Chart options={options} series={series} type="bar" height="100%" width="100%" />
    </div>
  );
}