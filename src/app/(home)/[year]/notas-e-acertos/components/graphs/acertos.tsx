'use client'

import { useEffect, useMemo, useState } from 'react';
import Chart from 'react-apexcharts';
import { useChartTheme } from '../../../../../../hooks/use_chart_theme';
import { useNineteenData } from '../../../../../../context/nineteen_context';
import styles from "./graphs.module.css"

export default function DensityNotasChart() {

  const { acertosData, acertosNum } = useNineteenData();
  const { gridColor, textColor, axisColor } = useChartTheme();
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 800 : false);
    
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 800);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chartData = useMemo(() => {
    if (!acertosData || acertosNum === null) return null;
    const current = acertosData[String(acertosNum)];
    if (!current?.density) return null;

    // Normaliza os dados: se for número, transforma em array de um elemento
  const xRaw = current.density.x;
  const yRaw = current.density.y; 
  
  const xArray = Array.isArray(xRaw) ? xRaw : [xRaw];
  const yArray = Array.isArray(yRaw) ? yRaw : [yRaw];

  return {
    densityPoints: xArray.map((xVal: number, i: number) => ({ 
      x: xVal, 
      y: yArray[i] 
    })),
    minX: xArray[0],
    maxX: xArray[xArray.length - 1],
    mean: current.mean
  };
}, [acertosData, acertosNum]);

  const series = useMemo(() => [{
    name: 'Densidade',
    data: chartData?.densityPoints || []
  }], [chartData]);

  const options: ApexCharts.ApexOptions = useMemo(() => {
    if (!chartData) return {};

    return {
      chart: {
        id: `density-x-dashed-${acertosNum}`,
        type: 'area',
        toolbar: { show: true },
        animations: { enabled: true, speed: 400 },
        zoom: {
          enabled: false
        }   
      },
      // Paleta: Azul Turquesa / Ciano
      colors: ['#00B5AD'], 
      fill: {
        type: 'solid',
        opacity: 0.2
      },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      xaxis: {
        type: 'numeric',
        tickAmount: isMobile ? 5 : 10,
        min: chartData.minX,
        max: chartData.maxX,
        labels: { style: { colors: axisColor }, formatter: (v) => Number(v).toFixed(1)},
        title: { text: "Notas na escala do ENEM", style: { color: axisColor } }
      },
      yaxis: {
        labels: { style: { colors: axisColor }, formatter: (v) => Number(v).toFixed(3) },
        title: { text: "Densidade f(x)", style: { color: axisColor } }
      },
      grid: { borderColor: gridColor, strokeDashArray: 4 },
      dataLabels: { enabled: false },
      tooltip: { enabled: false },
      annotations: {
        xaxis: [{
          x: chartData.mean,
          borderColor: '#F2711C', 
          strokeDashArray: 5,     
          borderWidth: 2,
          label: {
            text: `MÉDIA: ${Number(chartData.mean).toFixed(1)}`,
            position: 'left',
            orientation: 'horizontal',
            offsetY: 20, 
            style: {
              color: '#fff',
              background: '#1B1C1D', 
              fontSize: '11px',
              fontWeight: 'bold',
              padding: { left: 10, right: 10, top: 6, bottom: 6 }
            },
            borderWidth: 1.5,
            borderColor: '#F2711C',
          }
        }]
      },
      title: {
        text: `Distribuição das notas: ${acertosNum} acertos`,
        style: { color: textColor, fontSize: '16px', fontWeight: 'bold'},
      },
      subtitle: {
        text: [`Pontos da proficiência para os quais as notas`, `são mais frequentes.`] as any,
        style: { color: textColor, fontSize: '13px' },
      },
    };
  }, [chartData, acertosNum, gridColor, axisColor]);

  if (!chartData) return null;

  return (
    <div style={{ flex: 1, minHeight: '350px', width: '100%' }}>
      <Chart options={options} series={series} type="area" height="100%" width="100%" />
      <div className={styles.table_footer}>
        Observação: 0/x e x/x acertos são casos de sequências de respostas idênticas e, à primeira vista, deveriam apresentar valores iguais para max, min e média. No entando, alguns cadernos da mesma área podem conter um pool de itens distintos, como é o caso da área de Linguagens que tem tanto questões de Inglês quanto de Espanhol. Essa diferença reflete na nota final do exame, mesmo que a sequência de respostas seja idêntica.
      </div>
    </div>
  );
}