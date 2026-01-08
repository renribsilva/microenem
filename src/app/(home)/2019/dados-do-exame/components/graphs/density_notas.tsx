'use client'

import { useMemo } from 'react';
import Chart from 'react-apexcharts';
import styles from "./graphs.module.css";
import { useDescribe } from '../../../../../../hooks/use_describe_data';
import { useDensity } from '../../../../../../hooks/use_density_data';
import { useChartTheme } from '../../../../../../hooks/chart_theme';

export default function DensityNotasChart({ area = "LC", highlightItem }: { area: string, highlightItem: any }) {
  
  const { describeData } = useDescribe(area);
  const { densityData } = useDensity(area);
  const { colorExame, gridColor, textColor, axisColor } = useChartTheme();

  const { xMin, xMax } = useMemo(() => {
    if (!describeData?.notas) return { xMin: 0, xMax: 1000 };
    return {
      xMin: Math.floor(describeData.notas.min / 100) * 100,
      xMax: Math.ceil(describeData.notas.max / 100) * 100
    };
  }, [describeData]);

  const getStatDescription = (id: string, valStr: string) => {
    const val = parseFloat(valStr.replace(/\./g, '').replace(',', '.'));
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

  const series = useMemo(() => {
    if (!densityData) return [];
    const mainDs = densityData.datasets?.find((ds: any) => ds.id === 'main-density');
    const sortedData = [...(mainDs?.data || [])].sort((a, b) => a.x - b.x).map((p: any) => [p.x, p.y * 100]);
    const datasets = [{ name: `Densidade ${area}`, data: sortedData }];

    // Lógica de preenchimento (SD, Q1, Q3, P99)
    const fillIds = ['sd', 'q1', 'q3', 'p99'];
    if (fillIds.includes(highlightItem?.id) && describeData?.notas) {
        const n = describeData.notas;
        let start = 0, end = 0;
        if (highlightItem.id === 'sd') { start = n.mean - n.sd; end = n.mean + n.sd; }
        else if (highlightItem.id === 'q1') { start = n.q1; end = n.max; }
        else if (highlightItem.id === 'q3') { start = n.q3; end = n.max; }
        else if (highlightItem.id === 'p99') { start = n.p99; end = n.max; }
        
        const filtered = sortedData.filter(p => p[0] >= start && p[0] <= end);
        datasets.push({ name: `Destaque`, data: filtered });
    }
    return datasets;
  }, [densityData, area, highlightItem, describeData]);

  // console.log(highlightItem)

  const options: ApexCharts.ApexOptions = useMemo(() => {
    
    const isShape = ['skew', 'kurtosis'].includes(highlightItem?.id);
    const isFill = ['sd', 'q1', 'q3', 'p99'].includes(highlightItem?.id);
    
    // Se for skew/kurtosis, fixa no meio do gráfico. Se não, usa a nota ou a média.
    const centerPoint = (xMax + xMin) / 2;
    const valX = isShape ? centerPoint : (
                 ['mean', 'sd'].includes(highlightItem?.id) 
                 ? (describeData?.notas?.mean || 0) 
                 : parseFloat(highlightItem?.nota?.replace(/\./g, '').replace(',', '.') || '0')
    );
    
    const chartColors = isFill ? [colorExame["curve"], colorExame["fill"]] : [colorExame["curve"]];
    const fillOpacity = isFill ? [0.2, 0.7] : [0.2];
    const strokeWidths = isFill ? [2, 0] : [2];

    return {
      chart: {
        id: `density-${area}`,
        type: 'area',
        toolbar: { show: true },
      },
      colors: chartColors,
      stroke: { 
        curve: 'smooth', 
        width: strokeWidths 
      },
      fill: {
        type: 'solid',
        opacity: fillOpacity
      },
      xaxis: {
        type: 'numeric',
        min: xMin,
        max: xMax,
        tickAmount: (xMax - xMin) / 200,
        axisBorder: { show: false },
        labels: { style: { colors: axisColor } },
        title: { text: 'Nota na escala do ENEM', style: { color: axisColor, fontWeight: 'bold' } }
      },
      yaxis: {
        labels: { 
          style: { colors: axisColor },
          formatter: (val: number) => val.toFixed(1) 
        },
        title: { text: 'Densidade (x100)', style: { color: axisColor, fontWeight: 'bold' } }
      },
      grid: { borderColor: gridColor },
      legend: { show: false },
      tooltip: { enabled: true },
      dataLabels: { enabled: false },
      annotations: {
        // Linhas verticais para notas (Média, Mediana, Q1, etc)
        xaxis: !isShape ? [
          {
            x: valX,
            borderColor: colorExame["line"],
            borderWidth: 2,
            label: {
              text: `${highlightItem?.metric}: ${highlightItem?.nota}`,
              borderWidth: 6,
              borderColor: colorExame["line"],
              style: { color: '#fff', background: colorExame["line"] },
              position: 'top',
            }
          }
        ] : [],

        // Bloco de texto centralizado para Assimetria e Curtose
        points: isShape ? [
          {
            x: (xMax + xMin) / 2,
            marker: { size: 0 },
            label: {
              text: [
                `${highlightItem.metric}: ${highlightItem.nota}`,
                getStatDescription(highlightItem.id, highlightItem.nota)
              ],
              offsetY: 70,
              style: {
                color:  '#fff',
                background: colorExame["line"],
                fontSize: '14px',
                fontWeight: '300',
              },
            }
          }
        ] : []
      }
    };
  }, [describeData, highlightItem, colorExame, textColor, gridColor, xMin, xMax, area]);

  if (!describeData?.notas || !densityData) {
    return <div className={styles.loading}>Carregando gráfico...</div>;
  }

  return (
    <Chart 
      options={options}
      series={series}
      type="area"
      height="100%"
      width="100%"
    />
  );
}