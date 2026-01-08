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
      if (val < 0) return `Acertos mais dispersos.`;
      return `Curtose Neutra.`;
    }
    return "";
  };

  const series = useMemo(() => {
    const rawData = frequencyData?.datasets?.[1]?.data || [];
    const colors = rawData.map((p: any) => {
      if (highlightItem?.id === 'sd' && describeData?.acertos) {
        const { mean, sd } = describeData.acertos;
        const lower = Math.round(mean) - Math.round(sd);
        const upper = Math.round(mean) + Math.round(sd);
        if (p.x >= lower && p.x <= upper) return colorExame["fill"];
      }
      return 'rgba(94, 149, 238, 0.4)'; // Cor padrão esmaecida
    });

    return [{
      name: `Frequência ${area}`,
      data: rawData.map((p: any) => ({ x: p.x, y: p.y })),
      // No ApexCharts, passamos as cores por ponto se quisermos barras coloridas
    }];
  }, [frequencyData, area, highlightItem, describeData, colorExame]);

  const options: ApexCharts.ApexOptions = useMemo(() => {
    const isShape = ['skew', 'kurtosis'].includes(highlightItem?.id);
    const mean = describeData?.acertos?.mean || 0;
    
    // Lógica de valor X para a linha de destaque
    const valX = (isShape || highlightItem?.id === 'sd' || highlightItem?.id === 'mean')
      ? Math.round(mean) 
      : Math.round(parseFloat(highlightItem?.acerto?.replace(/\./g, '').replace(',', '.') || "0"));

    const isNearStart = valX < xMin + 8;

    return {
      chart: {
        type: 'bar',
        toolbar: { show: false },
        animations: { enabled: true, speed: 400 }
      },
      // Cores das barras via callback funcional
      plotOptions: {
        bar: {
          distributed: true, // Permite cores diferentes para cada barra
          columnWidth: '100%',
        }
      },
      // Aqui aplicamos a lógica de cores que calculamos na série
      colors: [({ value, dataPointIndex, w }: any) => {
        const rawData = frequencyData?.datasets?.[1]?.data || [];
        const p = rawData[dataPointIndex];
        if (highlightItem?.id === 'sd' && describeData?.acertos) {
          const { mean, sd } = describeData.acertos;
          const lower = Math.round(mean) - Math.round(sd);
          const upper = Math.round(mean) + Math.round(sd);
          if (p?.x >= lower && p?.x <= upper) return colorExame["fill"];
        }
        return 'rgba(94, 149, 238, 0.4)';
      }],
      xaxis: {
        type: 'numeric',
        min: xMin,
        max: xMax,
        tickAmount: 9,
        labels: { 
            style: { colors: axisColor },
            formatter: (v) => v.toFixed(0)
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
        // Texto central para Assimetria/Curtose
        points: isShape ? [
          {
            x: 22.5, // Meio de 0-45
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
                borderWidth: 8,
                borderColor: colorExame["line"]
              }
            }
          }
        ] : []
      }
    };
  }, [describeData, frequencyData, highlightItem, colorExame, axisColor, gridColor]);

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