'use client'

import Chart from 'react-apexcharts';
import notasData from "../../json/estatisticas_redacao_completa.json";
import { useMemo, useState } from 'react';
import { useChartTheme } from '../../../../../../hooks/use_chart_theme';
import customTooltip from '../../../../../../components/tsx/customTooltip';
import { useHomeData } from '../../../../../../context/home_context';

type NotaKey = "NU_NOTA_COMP1" | "NU_NOTA_COMP2" | "NU_NOTA_COMP3" | "NU_NOTA_COMP4" | "NU_NOTA_COMP5" | "NU_NOTA_REDACAO";

export default function NotasRedacaoChart() {
  const { textColor, gridColor } = useChartTheme();
  const { selectedRowId } = useHomeData(); 
  const [selectedNota, setSelectedNota] = useState<NotaKey>("NU_NOTA_REDACAO");
  
  const currentData = (notasData as any)[selectedNota];
  const nTotal = currentData?.estatisticas?.n || 0;
  const categories = useMemo(() => currentData?.frequencia?.labels || [], [currentData]);

  // Paleta Dark Mode
  const barColor = "#6366f1";     
  const accentColor = "#22d3ee";  
  const alertColor = "#fb7185";

  const series = useMemo(() => {
    if (!currentData) return [];
    return [{
      name: 'Participantes',
      data: currentData.frequencia.values.map((absVal: number, i: number) => {
        const percentage = nTotal > 0 ? Number(((absVal / nTotal) * 100).toFixed(2)) : 0;
        return {
          x: categories[i].toString(),
          y: absVal,
          rel: percentage
        };
      }).reverse() 
    }];
  }, [currentData, nTotal, categories]);

  const options: ApexCharts.ApexOptions = useMemo(() => {
    const metricId = selectedRowId || 'media';
    const rawValue = currentData?.estatisticas[metricId];
    const numericValue = Number(rawValue);
    const isSpecialMetric = ['skew', 'kurtosis'].includes(metricId);
    const shouldShowAnnotation = rawValue !== undefined && !isSpecialMetric && !['n', 'sd'].includes(metricId);

    let closestCategory = "";
    if (shouldShowAnnotation && categories.length > 0) {
      closestCategory = categories.reduce((prev: number, curr: number) => 
        Math.abs(curr - numericValue) < Math.abs(prev - numericValue) ? curr : prev
      ).toString();
    }

    return {
      chart: {
        type: 'bar',
        animations: { enabled: false },
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '80%',
          borderRadius: 0, // REMOVIDO ARREDONDAMENTO
          dataLabels: { position: 'top' },
        }
      },
      colors: [barColor],
      annotations: {
        yaxis: shouldShowAnnotation ? [{
          y: closestCategory, 
          borderColor: accentColor,
          label: {
            borderColor: accentColor,
            style: { color: '#000', background: accentColor, fontWeight: '700' },
            text: `${metricId.toUpperCase()}: ${numericValue.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`,
            position: 'left',
            offsetX: 80
          }
        }] : [],
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val.toLocaleString('pt-BR'),
        offsetX: 35,
        style: { fontSize: '10px', colors: [textColor] }
      },
      xaxis: {
        tickAmount: 5,
        labels: {
          style: { colors: textColor, fontSize: '10px' },
          formatter: (val: number) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val.toString(),
        },
      },
      yaxis: {
        labels: { style: { colors: textColor, fontSize: '9px' }},
      },
      grid: {
        borderColor: gridColor,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: false } },
      },
      tooltip: {
        theme: 'dark',
        custom: function({ seriesIndex, dataPointIndex, w }: any) {
          const dataConfig = w.config.series[seriesIndex].data[dataPointIndex];       
          return customTooltip({ 
            label: `Nota: ${dataConfig.x}`, 
            value: `${dataConfig.rel.toFixed(1)}`,
            absolute: dataConfig.y.toLocaleString('pt-BR')
          });
        }
      },
    };
  }, [textColor, gridColor, selectedNota, selectedRowId, currentData, categories]);

  const selectOptions: { key: NotaKey, label: string }[] = [
    { key: "NU_NOTA_REDACAO", label: "Nota Total" },
    { key: "NU_NOTA_COMP1", label: "C1" },
    { key: "NU_NOTA_COMP2", label: "C2" },
    { key: "NU_NOTA_COMP3", label: "C3" },
    { key: "NU_NOTA_COMP4", label: "C4" },
    { key: "NU_NOTA_COMP5", label: "C5" },
  ];

  const baseHeight = 1200;
  const isCompetencia = selectedNota.includes('COMP');
  const calculatedHeight = isCompetencia ? 400 : baseHeight;

  return (
    <div style={{ width: '100%' }}>
      {/* Navegador Estilizado */}
      <div style={{ 
        display: 'flex', 
        gap: '2px', 
        marginBottom: '20px', 
        borderBottom: `1px solid ${gridColor}`,
        paddingBottom: '2px' 
      }}>
        {selectOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSelectedNota(opt.key)}
            style={{
              padding: '8px 16px',
              borderRadius: '4px 4px 0 0', // Bordas levemente arredondadas apenas no topo
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: selectedNota === opt.key ? 'bold' : 'normal',
              backgroundColor: selectedNota === opt.key ? barColor : 'transparent',
              color: selectedNota === opt.key ? '#fff' : textColor,
              transition: '0.2s',
              opacity: selectedNota === opt.key ? 1 : 0.6
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div style={{ minHeight: `${calculatedHeight}px` }}>
        <Chart options={options} series={series} type="bar" height={calculatedHeight} width="100%" />
      </div>
    </div>
  );
}