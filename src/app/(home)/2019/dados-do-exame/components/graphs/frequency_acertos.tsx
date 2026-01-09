'use client'

import { useMemo } from 'react';
import Chart from 'react-apexcharts';
import styles from "./graphs.module.css";
import { useDescribe } from '../../../../../../hooks/use_describe_data';
import { useFrequency } from '../../../../../../hooks/use_frequency_data';
import { useChartTheme } from '../../../../../../hooks/chart_theme';
import customTooltip from '../../../../../../components/tsx/customTooltip';

export default function FrequencyAcertosChart({ area = "LC", highlightItem }: { area: string, highlightItem: any }) {
  
  const { describeData } = useDescribe(area);
  const { frequencyData } = useFrequency(area);
  const { acertosColor, gridColor, axisColor, textColor } = useChartTheme();

  const xMin = 0;
  const xMax = 45;

  const getStatDescription = (id: string, valStr: string) => {
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
      if (fillIds.includes(highlightItem?.id) && describeData?.acertos) {
        const n = describeData.acertos;
        let start = 0, end = 0;
        if (highlightItem.id === 'sd') { 
          start = Math.round(n.mean) - Math.round(n.sd); 
          end = Math.round(n.mean) + Math.round(n.sd); 
        }
        else if (highlightItem.id === 'q1') { start = Math.round(n.q1); end = Math.round(n.max); }
        else if (highlightItem.id === 'q3') { start = Math.round(n.q3); end = Math.round(n.max); }
        else if (highlightItem.id === 'p99') { start = Math.round(n.p99); end = Math.round(n.max); }       
        if (p.x >= start && p.x <= end) {
          pointColor = acertosColor["fill"]; 
        }
      }

      return {
        x: p.x,
        y: p.y,
        fillColor: pointColor, // Define a cor da barra individualmente
        strokeColor: pointColor
      };
    });
    return [{
      name: `Frequência ${area}`,
      data: dataWithColors
    }];
  }, [frequencyData, area, highlightItem, describeData, acertosColor]);

  const options: ApexCharts.ApexOptions = useMemo(() => {
    const isShape = ['skew', 'kurtosis'].includes(highlightItem?.id);
    const mean = describeData?.acertos?.mean || 0;
    
    // Posição da linha vertical
    const valX = (isShape || highlightItem?.id === 'sd' || highlightItem?.id === 'mean')
      ? Math.round(mean) 
      : Math.round(parseFloat(highlightItem?.acerto?.replace(/\./g, '').replace(',', '.') || "0"));

    return {
      chart: {
        id: `freq-${area}`,
        type: 'bar',
        toolbar: { 
          show: true,
          offsetX: -5, // Move um pouco para a esquerda se estiver cortando na borda
          offsetY: 80,  // Empurra a toolbar um pouco para baixo
        },
         zoom: {
          enabled: false
        }
      },
      title: {
        text: 'Frequência relativa dos acertos',
        align: 'left',
        margin: 5,
        style: { 
          color: textColor, 
          fontSize: '16px', 
          fontWeight: 'bold' 
        }
      },
      subtitle: {
        text: [
          'Distribuição da frequência de acertos.',
        ] as any,
        align: 'left' as const,
        style: {
          color: textColor,
          fontSize: '13px',
          fontWeight: 'normal',
        }
      },
      plotOptions: {
        bar: {
          columnWidth: '95%',
          distributed: false, // Importante: manter false para o fillColor do data funcionar
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
      grid: { 
        borderColor: gridColor,
        padding: {
          top: 10,
          bottom: 0
        }
      },
      legend: { show: false },
      tooltip: {
        theme: 'dark',
        intersect: false,
        hideDelay: 0,
        followCursor: true,
        custom: function({ series, seriesIndex, dataPointIndex, w }: any) {
          const configPonto = w.config.series[seriesIndex].data[dataPointIndex];
          const acertosReal = configPonto.x;
          const porcentagem = configPonto.y;
          const valorAbsoluto = frequencyData?.datasets?.[0]?.data?.[dataPointIndex]?.y || 0;
          return customTooltip({ 
            label: `Acertos ${acertosReal}`, 
            value: porcentagem, 
            absolute: valorAbsoluto 
          });
        }
      },
      annotations: {
        xaxis: highlightItem && !isShape ? [
          {
            x: valX,
            borderColor: acertosColor["line"],
            borderWidth: 2,
            label: {
              text: `${highlightItem?.metric}: ${highlightItem?.acerto}`,
              borderWidth: 6,
              borderColor: acertosColor["line"],
              style: { color: '#fff', background: acertosColor["line"], fontWeight: 'bold' },
              position: 'top',
            }
          }
        ] : [],
        points: isShape ? [
          {
            x: 22.5,
            y: 0,
            marker: { size: 0 },
            label: {
              text: [
                `${highlightItem.metric}: ${highlightItem.acerto}`,
                getStatDescription(highlightItem.id, highlightItem.acerto)
              ],
              offsetY: -80,
              style: {
                color: '#fff',
                background: acertosColor["line"],
                fontSize: '13px',
                borderWidth: 10,
                borderColor: acertosColor["line"]
              }
            }
          }
        ] : []
      }
    };
  }, [describeData, frequencyData, highlightItem, acertosColor, axisColor, gridColor, area]);

  if (!describeData?.acertos || !frequencyData) {
    return <div className={styles.loading}>Carregando...</div>;
  }

  return (
    <div style={{minHeight: '250px', height: '100%'}}>
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