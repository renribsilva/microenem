'use client'

import { useEffect, useMemo, useRef, useState } from 'react';
import Chart from 'react-apexcharts';
import { useChartTheme } from '../../../../../../hooks/use_chart_theme';
// import InputShell from '../../../../../../components/tsx/input_shell';
import { useHomeData } from '../../../../../../context/home_context';
import { useNineteenData } from '../../../../../../context/nineteen_context';

export default function AcertosChart() {

  const { chartLogic } = useHomeData();
  const { gridColor, axisColor, textColor } = useChartTheme();
  const { lastItemActivate, lastItemActivateNum, probData, probLabels, k, d} = useNineteenData();
  const itemCache = useRef<{ code: string; dataset: any } | null>(null);
  
  const [itemData, setItemData] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 800 : false);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 800);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    if (! lastItemActivate) return;
    if (itemCache.current?.code === lastItemActivate) {
      setItemData(itemCache.current.dataset);
      return;
    }
    async function fetchItemData() {
      try {
        const res = await fetch(`/api/2019/score_graph?code=${String(lastItemActivate)}`);
        const json = await res.json();        
        itemCache.current = {
          code: lastItemActivate,
          dataset: json.dataset,
        };
        setItemData(json.dataset);
      } catch (err) {
        console.error("Erro ao carregar item_score:", err);
      } 
    }
    fetchItemData();
  }, [lastItemActivate]);

  const { 
    chartColor,
    xMin, 
    xMax,   
  } = chartLogic;
  const transformTheta = (theta: number) => ((theta * k) + d);

  // --- CONFIGURAÇÃO DE DADOS ---
  const series = useMemo(() => {
    if (!itemData || !Array.isArray(itemData.x)) return [];
    return [
      {
        name: "Frequência de acertos",
        type: 'scatter',
        data: itemData.x.map((valorX, index) => ({
          x: valorX,
          y: itemData.y[index] // Pega o y correspondente pelo índice
        }))
      },
      {
        name: "Curva característica do item",
        type: 'line',
        data: probData[lastItemActivate]?.map((yValue, idx) => ({
        x: transformTheta(probLabels[idx]),
        y: Number(yValue),
        tooltip: { enabled: false },
      })),
      },
    ];
  }, [itemData, lastItemActivate, probData]);

  // --- CONFIGURAÇÕES DO APEXCHARTS ---
  const options: ApexCharts.ApexOptions = useMemo(() => ({
    chart: {
      id: 'tcc-chart',
      type: 'line',
      toolbar: {
        offsetX: -5,
        offsetY: 0,
        show: true,
      },
      zoom: { enabled: false },
      animations: {
        enabled: false, 
        dynamicAnimation: {
          enabled: false 
        }
      } 
    },
    markers: {
      size: [1, 0],
      strokeWidth: 0,
      hover: {
        size: 6,
      }
    },
    stroke: {
      curve: 'straight', // Mude de smooth para straight
      width: [0, 1],     // 0 para o scatter (invisibiliza linhas órfãs) e 2 para a CCI
      // colors: [chartColor, chartColor] 
    },
    grid: { borderColor: gridColor },
    xaxis: {
      type: 'numeric',
      min: xMin,
      max: xMax,
      tickAmount: isMobile ? 5: 10,
      labels: { 
        style: { colors: axisColor },
        // Proteção aqui:
        formatter: (val) => val !== undefined && val !== null ? Number(val).toFixed(0) : ""
      },
      tooltip: { enabled: false },
      title: { text: 'Notas na escala do ENEM', style: { color: axisColor, fontWeight: 'bold' } }
    },
    yaxis: [
      {
        min: 0,
        max: 1,
        tickAmount: 10,
        labels: { 
          style: { colors: axisColor },
          // Proteção aqui:
          formatter: (val) => val !== undefined && val !== null ? Number(val).toFixed(1) : "0.0"
        },
        title: { 
          text: 'Frequência de acertos', 
          style: { color: axisColor, fontWeight: 'bold' } 
        }
      },
      {
        opposite: true,
        min: 0,
        max: 1,
        tickAmount: 10,
        labels: { 
          style: { colors: axisColor },
          // Proteção aqui:
          formatter: (val) => val !== undefined && val !== null ? Number(val).toFixed(1) : "0.0"
        },
        title: { 
          text: 'Probabilidade de acerto', 
          style: { color: axisColor, fontWeight: 'bold' } 
        }
      }
    ],
    tooltip: {
      theme: 'dark',
      x: {
        formatter: (val) => `Proficiência: ${Number(val).toFixed(0)}`
      },
    },
    title: {
      text: `Frequência de acertos do item ${lastItemActivateNum}`,
      style: { color: textColor, fontSize: '16px', fontWeight: 'bold'},
    },
    subtitle: {
      text: [`Frequência de acertos observados nos`, `microdados do ENEM (cod: ${lastItemActivate}).`] as any,
      style: { color: textColor, fontSize: '13px' },
    },
    legend: { 
      position: 'bottom',
      labels: { colors: textColor},
    },
  }), [chartColor, gridColor, axisColor, xMin, xMax, lastItemActivate, lastItemActivateNum]);

  return (
    <div style={{minHeight: '350px'}}>
      <Chart 
        options={options} 
        series={series} 
        type="line"
        height='100%'
        width='100%'
      />
    </div>
  );
}