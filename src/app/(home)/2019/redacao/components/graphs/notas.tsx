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
  // selectedRowId vindo do contexto (inicialmente 'media')
  const { selectedRowId } = useHomeData(); 
  const [selectedNota, setSelectedNota] = useState<NotaKey>("NU_NOTA_REDACAO");

  const barColor = "rgba(255, 208, 53, 1)";
  const accentColor = "#00E396"; 
  
  const currentData = (notasData as any)[selectedNota];
  const nTotal = currentData?.estatisticas?.n || 0;

  const categories = useMemo(() => currentData?.frequencia?.labels || [], [currentData]);

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

  const getStatDescription = (id: string, val: number) => {
    if (isNaN(val)) return "";
    if (id === 'skew') {
      if (val > 0) return `Notas baixas mais frequentes.`;
      if (val < 0) return `Notas altas mais frequentes.`;
      return `Distribuição Simétrica.`;
    }
    if (id === 'kurtosis') {
      if (val > 0) return `Notas concentradas perto da média.`;
      if (val < 0) return `Notas mais dispersas.`;
      return `Mesocúrtica: Distribuição normal.`;
    }
    return "";
  };

  const options: ApexCharts.ApexOptions = useMemo(() => {
    // Se selectedRowId for undefined, usamos 'media' como fallback
    const metricId = selectedRowId || 'media';
    const rawValue = currentData?.estatisticas[metricId];
    const numericValue = Number(rawValue);

    const isSpecialMetric = ['skew', 'kurtosis'].includes(metricId);
    const shouldShowAnnotation = 
      rawValue !== undefined && 
      !isSpecialMetric && 
      !['n', 'sd'].includes(metricId);

    // 1. Cálculo da categoria mais próxima para a linha horizontal
    let closestCategory = "";
    if (shouldShowAnnotation && categories.length > 0) {
      closestCategory = categories.reduce((prev: number, curr: number) => 
        Math.abs(curr - numericValue) < Math.abs(prev - numericValue) ? curr : prev
      ).toString();
    }

    // 2. Cálculo de centro para Skew/Kurtosis baseado nos limites (Max/Min)
    const xMax = Math.max(...(currentData?.frequencia?.values || [0]));
    const xMid = xMax / 2;
    const yMid = categories.length > 0 
      ? categories[Math.floor(categories.length / 2)].toString() 
      : "";

    return {
      chart: {
        type: 'bar',
        animations: { enabled: false },
        toolbar: { show: false }
      },
      annotations: {
        yaxis: shouldShowAnnotation ? [{
          y: closestCategory, 
          borderColor: accentColor,
          strokeDashArray: 0,
          label: {
            borderColor: accentColor,
            style: { color: '#fff', background: accentColor },
            text: `${metricId.toUpperCase()}: ${numericValue.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`,
            position: 'left',
            textAlign: 'left',
            offsetX: 80
          }
        }] : [],

        points: isSpecialMetric ? [{
          x: xMid,
          y: yMid,
          marker: { size: 0 },
          label: {
            text: [
              `${metricId === 'skew' ? 'ASSIMETRIA' : 'CURTOSE'}: ${numericValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
              getStatDescription(metricId, numericValue)
            ],
            style: { 
              color: '#fff', 
              background: 'rgba(84, 230, 48, 0.9)', 
              fontSize: '14px',
              // CORREÇÃO: padding deve ser um objeto
              padding: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10
              }
            },
          }
        }] : []
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
        tickAmount: 5,
        labels: {
          style: { colors: textColor, fontSize: '10px' },
          formatter: (val: string | number) => {
            const num = Number(val);
            if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
            return num.toString();
          }
        }
      },
      yaxis: {
        labels: { style: { colors: textColor, fontSize: '9px' } }
      },
      grid: {
        borderColor: gridColor,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: false } },
      },
      tooltip: {
        theme: 'dark',
        intersect: false,
        custom: function({ seriesIndex, dataPointIndex, w }: any) {
          const dataConfig = w.config.series[seriesIndex].data[dataPointIndex];       
          return customTooltip({ 
            label: `Nota: ${dataConfig.x}`, 
            value: `${dataConfig.rel.toFixed(1)}`,
            absolute: dataConfig.y.toLocaleString('pt-BR')
          });
        }
      },
      title: {
        text: `Distribuição: ${selectedNota
          .replace('NU_NOTA_', '')
          .replace('REDACAO', 'Nota total')
          .replace('COMP1', 'Competência 1')
          .replace('COMP2', 'Competência 2')
          .replace('COMP3', 'Competência 3')
          .replace('COMP4', 'Competência 4')
          .replace('COMP5', 'Competência 5')}`,
        align: 'left',
        style: { color: textColor, fontSize: '16px', fontWeight: 'bold' }
      }
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
  const calculatedHeight = isCompetencia ? Math.floor(baseHeight * 0.28) : baseHeight;

  return (
    <div style={{ width: '100%' }}>
      {/* Container dos botões */}
      <div style={{ display: 'flex', gap: '5px', marginBottom: '15px', flexWrap: 'wrap' }}>
        {selectOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSelectedNota(opt.key)}
            style={{
              padding: '6px 12px',
              borderRadius: '15px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '11px',
              backgroundColor: selectedNota === opt.key ? barColor : '#333',
              color: selectedNota === opt.key ? '#000' : '#fff',
              transition: '0.2s'
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Container do Gráfico com altura dinâmica */}
      <div style={{ minHeight: `${calculatedHeight}px`, transition: 'min-height 0.3s ease' }}>
        <Chart 
          options={options} 
          series={series} 
          type="bar" 
          height={calculatedHeight} 
          width="100%" 
        />
      </div>
    </div>
  );
}