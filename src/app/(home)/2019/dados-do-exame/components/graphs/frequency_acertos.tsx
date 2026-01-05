'use client'

import { useEffect, useMemo, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Legend,
  Tooltip,
  Filler,
  ChartOptions
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Bar } from 'react-chartjs-2';
import styles from "./graphs.module.css"
import { useDescribe } from '../../../../../../hooks/use_describe_data';
import { useFrequency } from '../../../../../../hooks/use_frequency_data';
import { useChartTheme } from '../../../../../../hooks/chart_theme';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  Title, Legend, Tooltip, Filler, annotationPlugin
);

export default function FrequencyAcertosChart({ area = "LC", highlightItem }: { area: string, highlightItem: any }) {
  
  const { describeData } = useDescribe(area);
  const { frequencyData } = useFrequency(area);
  const { colorExame, gridColor } = useChartTheme();
  const chartRef = useRef<any>(null);

  const xMin = 0;
  const xMax = 45;

  const currentJson = frequencyData;

  // Descrições dinâmicas baseadas no valor da estatística
  const getStatDescription = () => {
    if (!highlightItem) return "";
    const val = parseFloat(highlightItem.acerto.replace(/\./g, '').replace(',', '.'));
    
    if (highlightItem.id === 'skew') {
      if (val > 0) return `Poucos acertos mais frequentes.`;
      if (val < 0) return `Muitos acertos mais frequentes.`;
      return `Distribuição Simétrica: Equilíbrio entre pouco e muitos acertos.`;
    }
    
    if (highlightItem.id === 'kurtosis') {
      if (val > 0) return `Quantidade de acertos concentrada perto da média.`;
      if (val < 0) return `Quantidade de acertos mais dispersas.`;
      return `Curtose Neutra: Distribuição da quantidade de acertos próxima da normal.`;
    }
    return "";
  };

  const chartData = useMemo(() => {
  const rawData = currentJson?.datasets?.[1]?.data || [];
  
  // Definimos a lógica de cores para cada barra
  const backgroundColors = rawData.map((p: any) => {
    // Se o item selecionado for o Desvio Padrão (SD)
    if (highlightItem?.id === 'sd' && describeData?.acertos) {
      const { mean, sd } = describeData.acertos;
      const lower = Math.round(mean) - Math.round(sd);
      const upper = Math.round(mean) + Math.round(sd);

      // Se o valor de acertos (p.x) estiver dentro do intervalo, destaca
      if (p.x >= lower && p.x <= upper) {
        return colorExame["fill"]; // Cor de destaque (ex: Azul forte)
      }
      // Se estiver fora, fica bem clarinho (esmaecido)
      return 'rgba(94, 149, 238, 0.4)'; 
    }

    // Cor padrão quando nada está selecionado ou outra métrica está ativa
    return 'rgba(94, 149, 238, 0.4)';
  });

  return {
    datasets: [{
      id: 'main-bar',
      label: `Frequência ${area}`,
      data: rawData,
      backgroundColor: backgroundColors, // Aplicamos o array de cores aqui
      borderColor: '#3b82f6',
      borderWidth: 0.5,
      barPercentage: 1.0,
      categoryPercentage: 1.0,
    }]
  };
}, [currentJson, area, highlightItem, describeData, colorExame]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    // Limpa datasets temporários
    chart.data.datasets = chart.data.datasets.filter((ds: any) => 
      !['highlight-line', 'sd-area', 'normal-ref'].includes(ds.id)
    );

    if (!highlightItem) {
      chart.update();
      return;
    }

    const { mean } = describeData.acertos;
    const isShapeMetric = ['skew', 'kurtosis'].includes(highlightItem.id);
    const yMax = chart.scales.y.max || 0.1;

    const valX = (isShapeMetric || highlightItem.id === 'sd' || highlightItem.id === 'mean')
      ? Math.round(mean) 
      : Math.round(parseFloat(highlightItem.acerto?.replace(/\./g, '').replace(',', '.') || "0"));

    chart.data.datasets.push({
      id: 'highlight-line',
      type: 'line' as const,
      data: [{ x: valX, y: 0 }, { x: valX, y: yMax }], 
      borderColor: colorExame["line"],
      borderWidth: 3,
      pointRadius: 0,
      fill: false,
      order: -2,
      xAxisID: 'x', 
    });

    chart.update(); 
  }, [highlightItem, describeData, frequencyData, colorExame]);

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true, 
    maintainAspectRatio: false,
    animation: { duration: 400 }, 
    scales: {
      x: { 
        type: 'linear', 
        min: xMin, // Pequeno recuo para a primeira barra não ficar cortada
        max: xMax, // Pequeno avanço para a última barra ter espaço
        offset: true,
        grid: {
          color: gridColor,
        },
        title: {
          display: true,
          text: 'Acertos', // Nome do eixo X
          color: '#666',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      y: { 
        beginAtZero: true,
        grid: {
          color: gridColor,
        },
        title: {
          display: true,
          text: 'Frequência relativa (%)', // Nome do eixo Y
          color: '#666',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
      },
    },
    interaction: {
      intersect: false,  
      axis: 'x'          
    },
    plugins: { 
      legend: { display: false },
      tooltip: { 
        enabled: true,
        displayColors: false,
        callbacks: {
          // Título: Acertos
          title: (context) => {
            return `Acertos: ${Math.round(context[0].parsed.x)}`;
          },
          // Conteúdo: Relativa e Absoluta
          label: (context) => {
            const xValue = Math.round(context.parsed.x);
            const freqRelativa = context.parsed.y;
            const pontoAbsoluto = frequencyData?.datasets?.[0]?.data?.find(
              (p: any) => Math.round(p.x) === xValue
            );
            const freqAbsoluta = pontoAbsoluto ? pontoAbsoluto.y : 0; 
            return [
              `Frequência: ${freqRelativa.toLocaleString('pt-BR', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
              })}%`,
              `Qtd. Alunos: ${freqAbsoluta.toLocaleString('pt-BR')}`
            ];
          }
        }
      }, 
      datalabels: { display: false },              
      annotation: { 
        annotations: {
          // Rótulo informativo que aparece ao lado da área sombreada do SD
          sdLabel: {
            type: 'label' as const,
            display: highlightItem?.id === 'sd', 
            xValue: describeData.acertos.mean + 10,
            yValue: chartRef.current?.scales.y.max * 0.8 || 0, // 80% da altura do gráfico
            content: [
              `Média: ${Math.round(describeData.acertos.mean).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, 
              `Desvio-padrão: \u00B1 ${Math.round(describeData.acertos.sd).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`
            ],
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: colorExame["curve"],
            borderWidth: 1,
            borderRadius: 4,
            padding: 10,
            font: { size: 10, weight: 'bold' },
            textAlign: 'center' as const,
            yAdjust: (function() {
              const numNota = parseFloat(highlightItem?.acerto?.replace(/\./g, '').replace(',', '.') || '0');
              return numNota < 10 ? 40 : 50; 
            })(),
            xAdjust: (function() {
              const numNota = parseFloat(highlightItem?.acerto?.replace(/\./g, '').replace(',', '.') || '0');
              return numNota > 30 ? -60 : 50;
            })()
          },
          // Rótulo que fica "pendurado" na linha vertical de destaque
          lineLabel: {
            type: 'label' as const,
            display: !!highlightItem && highlightItem.id !== 'sd',
            xValue: (function() {
              if (['skew', 'kurtosis', 'mean'].includes(highlightItem?.id)) return describeData.acertos.mean;
              const val = highlightItem?.acerto || highlightItem?.acerto;
              return typeof val === 'string' 
                ? parseFloat(val.replace(/\./g, '').replace(',', '.')) 
                : val;
            })(),
            yValue: chartRef.current?.scales.y.max * 0.5 || 0, // Topo do gráfico
            content: ['skew', 'kurtosis'].includes(highlightItem?.id)
                      ? [`${highlightItem?.metric}: ${highlightItem?.acerto} `,
                        getStatDescription()]
                      :`${highlightItem?.metric}: ${highlightItem?.acerto}`, // Mostra o nome da métrica (Ex: "Mínimo", "Máximo")
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: colorExame["curve"],
            borderWidth: 1,
            borderRadius: 4,
            padding: 10,
            font: { size: 10, weight: 'bold' },
            textAlign: 'center' as const,
            // Lógica de Ajuste Corrigida
            yAdjust: (function() {
              const numNota = parseFloat(highlightItem?.acerto?.replace(/\./g, '').replace(',', '.') || '0');
              return numNota < 10 ? 40 : 50; 
            })(),
            xAdjust: (function() {
              const numNota = parseFloat(highlightItem?.acerto?.replace(/\./g, '').replace(',', '.') || '0');
              return numNota > 30 ? -60 : 50;
            })()
          }
        }
      }
    }
  }

  return (
    <div className={styles.frequency_container}>
      <div className={styles.frequency_wrapper}>
        <Bar 
          ref={chartRef}
          data={chartData}
          options={chartOptions} 
        />
      </div>
    </div>
  );
}