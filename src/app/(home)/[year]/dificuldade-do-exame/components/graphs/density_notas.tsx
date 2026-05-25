'use client'

import { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { useChartTheme } from '../../../../../../hooks/use_chart_theme';
import { useHomeData } from '../../../../../../context/home_context';
import { useYearData } from '../../../../../../context/year_context';
import styles from './graphs.module.css'

export default function DensityNotasChart() {
  
  const { deferredArea } = useHomeData();
  const { activeSelectedRow, describeDifData, densityDifData } = useYearData();
  const { densidadeColor, gridColor, textColor, axisColor } = useChartTheme();
  
  const selectedRow = activeSelectedRow;

  const { xMin, xMax } = useMemo(() => {
    if (!describeDifData?.notas) return { xMin: 0, xMax: 1000 };
    return {
      xMin: Math.floor(describeDifData.notas.min / 100) * 100,
      xMax: Math.ceil(describeDifData.notas.max / 100) * 100
    };
  }, [describeDifData]);

  const getStatDescription = (id: string, valStr: string) => {
    if (!valStr) return "";
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
    if (!densityDifData) return [];
    const mainDs = densityDifData.datasets?.find((ds: any) => ds.id === 'main-density');
    const sortedData = [...(mainDs?.data || [])].sort((a, b) => a.x - b.x).map((p: any) => [p.x, p.y * 100]);
    const datasets = [{ name: `Densidade ${deferredArea}`, data: sortedData }];

    const fillIds = ['sd', 'q1', 'q3', 'p99'];
    if (selectedRow && fillIds.includes(selectedRow.id) && describeDifData?.notas) {
        const n = describeDifData.notas;
        let start = 0, end = 0;
        if (selectedRow.id === 'sd') { start = n.mean - n.sd; end = n.mean + n.sd; }
        else if (selectedRow.id === 'q1') { start = n.q1; end = n.max; }
        else if (selectedRow.id === 'q3') { start = n.q3; end = n.max; }
        else if (selectedRow.id === 'p99') { start = n.p99; end = n.max; }
        
        const filtered = sortedData.filter(p => p[0] >= start && p[0] <= end);
        datasets.push({ name: `Destaque`, data: filtered });
    }
    return datasets;
  }, [densityDifData, deferredArea, selectedRow, describeDifData]);

  const options: ApexCharts.ApexOptions = useMemo(() => {
    const isShape = selectedRow ? ['skew', 'kurtosis'].includes(selectedRow.id) : false;
    const isFill = selectedRow ? ['sd', 'q1', 'q3', 'p99'].includes(selectedRow.id) : false;
    
    const centerPoint = (xMax + xMin) / 2;
    
    // Pegamos o valor numérico bruto do describeDifData para posicionar o eixo X
    const valX = isShape ? centerPoint : (
                 selectedRow?.id === 'mean' || selectedRow?.id === 'sd' 
                 ? (describeDifData?.notas?.mean || 0) 
                 : parseFloat(selectedRow?.nota?.replace(/\./g, '').replace(',', '.') || '0')
    );

    const mainDs = densityDifData?.datasets?.find((ds: any) => ds.id === 'main-density');
    const yMax = mainDs?.data 
      ? Math.max(...mainDs.data.map((p: any) => p.y * 100)) 
      : 0;
    
    const chartColors = isFill ? [densidadeColor["curve"], densidadeColor["fill"]] : [densidadeColor["curve"]];
    const fillOpacity = isFill ? [0.2, 0.7] : [0.2];
    const strokeWidths = isFill ? [2, 0] : [2];

    return {
      chart: {
        id: `density-${deferredArea}`,
        type: 'area' as const,
        toolbar: { show: true, offsetX: 0, offsetY: 0 },
        zoom: { enabled: false },
        animations: { enabled: false }, 
        // background: '#f34'
      },
      colors: chartColors,
      stroke: { curve: 'smooth', width: strokeWidths },
      fill: { type: 'solid', opacity: fillOpacity },
      // title: {
      //   text: 'Curva de densidade das notas',
      //   style: { color: textColor, fontSize: '16px', fontWeight: 'bold'},
      // },
      // subtitle: {
      //   text: ['Pontos da proficiência onde as', 'notas se concentram mais.'] as any,
      //   style: { color: textColor, fontSize: '13px' },
      // },
      xaxis: {
        type: 'numeric',
        min: xMin,
        max: xMax,
        tickAmount: (xMax - xMin) / 200,
        labels: { style: { colors: axisColor } },
        title: { text: "Notas na escala do ENEM", style: { color: axisColor } }
      },
      yaxis: {
        labels: { 
            style: { colors: axisColor },
            formatter: (val: number) => Number(val).toFixed(1) 
        },
        title: { text: 'Densidade (x100)', style: { color: axisColor, fontWeight: 'bold' } }
      },
      grid: { borderColor: gridColor },
      legend: { show: false },
      dataLabels: { enabled: false },
      tooltip: {
        enabled: true,       
        shared: true,        
        custom: function() { 
          return ''; 
        },
        marker: {
          show: false
        }
      },
      annotations: {
        xaxis: (selectedRow && !isShape) ? [
          {
            x: valX,
            borderColor: densidadeColor["line"],
            borderWidth: 2,
            label: {
              text: `${selectedRow.metric}: ${selectedRow.nota}`,
              style: { color: '#000', background: densidadeColor["line"], fontWeight: 'bold' },
              orientation: 'horizontal',
              offsetX: valX < describeDifData?.notas?.q1 ? 40 : (valX > describeDifData?.notas?.q3 ? -40 : 0)
            },
          }
        ] : [],
        points: (selectedRow && isShape) ? [
          {
            x: centerPoint,
            y: yMax,
            marker: { size: 0 },
            label: {
              text: [
                `${selectedRow.metric}: ${selectedRow.nota}`,
                getStatDescription(selectedRow.id, selectedRow.nota)
              ],
              style: { color: '#fff', background: densidadeColor["line"] },
            }
          }
        ] : []
      }
    };
  }, [describeDifData, selectedRow, densidadeColor, textColor, gridColor, xMin, xMax, deferredArea, densityDifData]);

  // if (!describeDifData?.notas || !densityDifData) {
  //   return <div className={styles.loading}>Carregando gráfico...</div>;
  // }

  return (
    <div style={{flex: 1}}>
      <div className={styles.tcc_cabecalho}>      
        <div className={styles.tcc_title}>
          <h3 className={styles.tcc_title_h3}>Curva de densidade das notas</h3>
          <p className={styles.tcc_subtitle_p}>
            Pontos da proficiência onde as notas se concentram mais.  
          </p>
        </div>
      </div>
      <Chart options={options} series={series} type="area" height="100%" width="100%" />
    </div>
  );
}
