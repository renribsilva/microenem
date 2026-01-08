'use client'

import { useMemo } from 'react';
import Chart from 'react-apexcharts';
import styles from "./graphs.module.css";
import { useDescribe } from '../../../../../../hooks/use_describe_data';
import { useFrequency } from '../../../../../../hooks/use_frequency_data';
import { useChartTheme } from '../../../../../../hooks/chart_theme';

export default function FrequencyAcertosChart({ area = "LC", highlightItem }: { area: string, highlightItem: any }) {
  
  const { describeData } = useDescribe(area);
  const { frequencyData } = useFrequency(area);
  const { colorExame, gridColor, axisColor } = useChartTheme();

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
      if (val < 0) return `Acertos mais dispersas.`;
      return `Curtose Neutra.`;
    }
    return "";
  };

  const series = useMemo(() => {
    if (!frequencyData) return [];
    const rawData = frequencyData.datasets?.[1]?.data || [];
    
    const dataWithColors = rawData.map((p: any) => {
      // Cor padrão (azul esmaecido)
      let pointColor = 'rgba(94, 149, 238, 0.4)'; 

      if (highlightItem?.id === 'sd' && describeData?.acertos) {
        const { mean, sd } = describeData.acertos;
        const lower = Math.round(mean - sd);
        const upper = Math.round(mean + sd);
        
        if (p.x >= lower && p.x <= upper) {
          pointColor = colorExame["fill"]; // Cor sólida do seu tema para o destaque
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
  }, [frequencyData, area, highlightItem, describeData, colorExame]);

  const options: ApexCharts.ApexOptions = useMemo(() => {
    const isShape = ['skew', 'kurtosis'].includes(highlightItem?.id);
    const mean = describeData?.acertos?.mean || 0;
    
    // Posição da linha vertical
    const valX = (isShape || highlightItem?.id === 'sd' || highlightItem?.id === 'mean')
      ? Math.round(mean) 
      : Math.round(parseFloat(highlightItem?.acerto?.replace(/\./g, '').replace(',', '.') || "0"));

    const isNearStart = valX < xMin + 8;

    return {
      chart: {
        id: `freq-${area}`,
        type: 'bar',
        toolbar: { show: false },
        animations: { enabled: true, speed: 400 }
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
            formatter: (v) => v.toFixed(1) + '%'
        },
        title: { text: 'Frequência relativa', style: { color: axisColor, fontWeight: 'bold' } }
      },
      grid: { borderColor: gridColor },
      legend: { show: false },
      tooltip: {
        shared: false,
        intersect: true,
        y: {
          formatter: (val, { dataPointIndex }) => {
            const rawAbs = frequencyData?.datasets?.[0]?.data?.[dataPointIndex]?.y || 0;
            return `${val.toFixed(2)}% (${rawAbs} alunos)`;
          }
        }
      },
      annotations: {
        xaxis: highlightItem && !isShape ? [
          {
            x: valX,
            borderColor: colorExame["line"],
            borderWidth: 2,
            label: {
              text: `${highlightItem?.metric}: ${highlightItem?.acerto}`,
              borderWidth: 6,
              borderColor: colorExame["line"],
              style: { color: '#fff', background: colorExame["line"], fontWeight: 'bold' },
              position: 'top',
              textAnchor: isNearStart ? 'start' : 'end',
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
              offsetY: 80,
              style: {
                color: '#fff',
                background: colorExame["line"],
                fontSize: '13px',
                borderWidth: 10,
                borderColor: colorExame["line"]
              }
            }
          }
        ] : []
      }
    };
  }, [describeData, frequencyData, highlightItem, colorExame, axisColor, gridColor, area]);

  if (!describeData?.acertos || !frequencyData) {
    return <div className={styles.loading}>Carregando...</div>;
  }

  return (
    <div className={styles.frequency_container}>
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