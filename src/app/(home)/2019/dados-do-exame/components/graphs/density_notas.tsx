'use client'

import { useEffect, useMemo, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,  
  Title,
  Legend,
  Filler,
  ChartOptions
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation'; // Reativado para o box de texto
import { Line } from 'react-chartjs-2';
import styles from "./graphs.module.css"
import { useDescribe } from '../../../../../../hooks/use_describe_data';
import { useDensity } from '../../../../../../hooks/use_density_data';
import { useChartTheme } from '../../../../../../hooks/chart_theme';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Legend, Filler, annotationPlugin
);

export default function DensityNotasChart({ area = "LC", highlightItem }: { area: string, highlightItem: any }) {
  
  const { describeData } = useDescribe(area);
  const { densityData } = useDensity(area);
  const { colorExame, gridColor, textColor } = useChartTheme();
  const chartRef = useRef<any>(null);

  const { xMin, xMax } = useMemo(() => {
    if (!describeData?.notas) return { xMin: 0, xMax: 1000 };
    return {
      xMin: Math.floor(describeData.notas.min / 100) * 100,
      xMax: Math.ceil(describeData.notas.max / 100) * 100
    };
  }, [describeData]);

  // Descrições dinâmicas baseadas no valor da estatística
  const getStatDescription = () => {
    if (!highlightItem) return "";
    const val = parseFloat(highlightItem.nota.replace(/\./g, '').replace(',', '.'));
    
    if (highlightItem.id === 'skew') {
      if (val > 0) return `Notas baixas mais frequentes.`;
      if (val < 0) return `Notas altas mais frequentes.`;
      return `Distribuição Simétrica: Equilíbrio entre notas altas e baixas.`;
    }
    
    if (highlightItem.id === 'kurtosis') {
      if (val > 0) return `Notas concentradas perto da média.`;
      if (val < 0) return `Notas mais dispersas.`;
      return `Curtose Neutra: Distribuição de notas próxima da normal.`;
    }
    return "";
  };

  // 2. Prepara os Datasets
  const chartData = useMemo(() => {
    const mainDs = densityData?.datasets?.find((ds: any) => ds.id === 'main-density');
    const rawData = mainDs?.data || [];
    const sortedData = [...rawData].sort((a, b) => a.x - b.x).map((p: any) => ({ x: p.x, y: p.y * 100 }));

    const datasets: any[] = [
      {
        id: 'main-density',
        label: `Densidade ${area}`,
        data: sortedData,
        borderColor: colorExame["curve"],
        borderWidth: 2,
        fill: true, // Preenchimento base da curva toda
        backgroundColor: colorExame["curve_fill"], // Use uma cor bem clara aqui
        tension: 0.5,
        pointRadius: 0,
        order: 1
      }
    ];

    // Lógica condicional: Só adiciona o dataset de preenchimento se for 'sd'
    if (highlightItem?.id === 'sd' && describeData?.notas) {
      const xStart = describeData.notas.mean - describeData.notas.sd; 
      const xEnd = describeData.notas.mean + describeData.notas.sd; 
      const highlightRegion = sortedData.filter(p => p.x >= xStart && p.x <= xEnd);

      datasets.push({
        id: 'clipped-fill',
        label: `Área SD`,
        data: highlightRegion,
        backgroundColor: colorExame["fill"], // Cor de destaque mais forte
        fill: 'origin',
        borderColor: 'transparent',
        tension: 0.5,
        pointRadius: 0,
        order: 0 // Ordem 0 para ficar na frente do preenchimento base se necessário
      });
    }

    return { datasets };
  }, [densityData, colorExame, highlightItem, describeData]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !describeData?.notas || !highlightItem) return;

    // Limpeza de camadas dinâmicas
    chart.data.datasets = chart.data.datasets.filter((ds: any) => 
      !['highlight-ds', 'sd-area', 'normal-ref'].includes(ds.id)
    );

    const { mean, sd } = describeData.notas;
    const isShapeMetric = ['sd', 'mean', 'skew', 'kurtosis'].includes(highlightItem.id);
    const valX = isShapeMetric ? mean : parseFloat(highlightItem.nota.replace(/\./g, '').replace(',', '.'));    
    const yMax = chart.scales.y.max;

    // B. Curva Normal de Referência (Vinda do JSON)
    if (['kurtosis', 'skew'].includes(highlightItem.id)) {
      const normalDs = densityData?.datasets?.find((ds: any) => ds.id === 'normal-reference');
      if (normalDs) {
        chart.data.datasets.push({
          id: 'normal-ref',
          type: 'line' as const,
          label: 'Normal (Ref)',
          data: normalDs.data.map((p: any) => ({ x: p.x, y: p.y * 100 })),
          borderColor: textColor,
          borderWidth: 1.5,
          borderDash: [4, 4],
          pointRadius: 0,
          fill: false,
          tension: 0.4,
          order: -1
        });
      }
    }

    // C. Linha de Destaque (Média ou item selecionado)
    chart.data.datasets.push({
      id: 'highlight-ds',
      label: highlightItem.metric,
      data: [{ x: valX, y: 0 }, { x: valX, y: yMax }], 
      borderColor: colorExame["line"],
      borderWidth: 3,
      pointRadius: 0,
      order: 0
    });
    chart.update();
  }, [highlightItem, describeData, densityData, colorExame, textColor]);

  // 3. Renderização condicional para evitar que o Chart.js inicialize com valores nulos
  if (!describeData?.notas || !densityData) {
    return <div className={styles.loading}>Carregando gráfico...</div>;
  }

  const chartOptions: ChartOptions<'line'> = {
    responsive: true, 
    maintainAspectRatio: false,
    animation: { duration: 400 }, 
    scales: {
      x: { 
        type: 'linear', 
        min: xMin, 
        max: xMax ,
        grid: {
          color: gridColor,
        },
        title: {
          display: true,
          text: 'Nota Final', // Nome do eixo X
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
          text: 'Densidade (x100)', // Nome do eixo Y
          color: '#666',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
      },
    },
    plugins: { 
      legend: { display: false },
      tooltip: { enabled: false }, 
      datalabels: { display: false },              
      annotation: { 
        annotations: {
          // Rótulo informativo que aparece ao lado da área sombreada do SD
          sdLabel: {
            type: 'label' as const,
            display: highlightItem?.id === 'sd', 
            xValue: describeData.notas.mean + describeData.notas.sd + 100,
            yValue: '0%',
            content: [
              `Média: ${describeData.notas.mean.toFixed(1).toLocaleString('pt-BR', { minimumFractionDigits: 1 })}`, 
              `Desvio-padrão: \u00B1 ${describeData.notas.sd.toFixed(1).toLocaleString('pt-BR', { minimumFractionDigits: 1 })}`
            ],
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: colorExame["curve"],
            borderWidth: 1,
            borderRadius: 4,
            padding: 10,
            font: { size: 10, weight: 'bold' },
            textAlign: 'center' as const,
            yAdjust: (function() {
              const numNota = parseFloat(highlightItem?.nota?.replace(/\./g, '').replace(',', '.') || '0');
              return numNota < 500 ? 40 : 50; 
            })(),
            xAdjust: (function() {
              const numNota = parseFloat(highlightItem?.nota?.replace(/\./g, '').replace(',', '.') || '0');
              return numNota >= 500 ? -60 : 50;
            })()
          },
          // Rótulo que fica "pendurado" na linha vertical de destaque
          lineLabel: {
            type: 'label' as const,
            display: !!highlightItem && highlightItem.id !== 'sd',
            xValue: ['skew', 'kurtosis'].includes(highlightItem?.id) 
                    ? describeData.notas.mean 
                    : parseFloat(highlightItem?.nota?.replace(/\./g, '').replace(',', '.') || '0'),
            yValue: '0%', 
            content: ['skew', 'kurtosis'].includes(highlightItem?.id)
                     ? [`${highlightItem?.metric}: ${highlightItem?.nota} `,
                        getStatDescription()]
                     :`${highlightItem?.metric}: ${highlightItem?.nota}`, // Mostra o nome da métrica (Ex: "Mínimo", "Máximo")
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: colorExame["curve"],
            borderWidth: 1,
            borderRadius: 4,
            padding: 10,
            font: { size: 10, weight: 'bold' },
            textAlign: 'center' as const,
            // Lógica de Ajuste Corrigida
            yAdjust: (function() {
              const numNota = parseFloat(highlightItem?.nota?.replace(/\./g, '').replace(',', '.') || '0');
              return numNota < 500 ? 40 : 50; 
            })(),
            xAdjust: (function() {
              const numNota = parseFloat(highlightItem?.nota?.replace(/\./g, '').replace(',', '.') || '0');
              return numNota >= 500 ? -60 : 50;
            })()
          }
        }
      }
    }
  }

  return (
    <div className={styles.density_container}> 
      <div className={styles.density_wrapper}>
        <Line 
          ref={chartRef}
          data={chartData}
          options={chartOptions}
        />
      </div>
    </div>
  );
}