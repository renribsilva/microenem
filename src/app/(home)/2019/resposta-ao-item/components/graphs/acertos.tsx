'use client'

import { useEffect, useMemo, useRef, useState } from 'react';
import Chart from 'react-apexcharts';
import { useChartTheme } from '../../../../../../hooks/use_chart_theme';
import { useHomeData } from '../../../../../../context/home_context';
import { useNineteenData } from '../../../../../../context/nineteen_context';

export default function AcertosChart() {
  const { chartLogic } = useHomeData();
  const { gridColor, axisColor, textColor } = useChartTheme();
  const { lastItemActivate, lastItemActivateNum, probData, probLabels, k, d } = useNineteenData();
  const itemCache = useRef<{ code: string; dataset: any } | null>(null);
  const [itemData, setItemData] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 800 : false);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 800);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    if (!lastItemActivate) return;
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

  const { xMin, xMax, currentInfo } = chartLogic;
  const transformTheta = (theta: number) => ((theta * k) + d);

  const series = useMemo(() => {
    if (!itemData || !Array.isArray(itemData.x)) return [];
    return [
      {
        name: "Frequência de acertos",
        type: 'scatter',
        data: itemData.x.map((valorX, index) => ({
          x: Number(valorX),
          y: Number(itemData.y[index])
        }))
      },
      {
        name: "Curva característica do item",
        type: 'line',
        data: probData[lastItemActivate]?.map((yValue, idx) => ({
          x: transformTheta(probLabels[idx]),
          y: Number(yValue),
        })) || [],
      },
    ];
  }, [itemData, lastItemActivate, probData, k, d, probLabels]);

  const options: ApexCharts.ApexOptions = useMemo(() => ({
    chart: {
      id: 'tcc-chart',
      type: 'line', // Mantido line para suportar combos
      toolbar: { show: true, offsetX: -5 },
      zoom: { enabled: false },
      // REMOÇÃO TOTAL DE ANIMAÇÕES
      animations: {
        enabled: false,
        dynamicAnimation: { enabled: false },
        animateGradually: { enabled: false }
      } 
    },
    // Markers configurados por série: [Série 1 (scatter), Série 2 (line)]
    markers: {
      size: [5, 0], 
      strokeWidth: 0,
      hover: { sizeOffset: 2 }
    },
    stroke: {
      curve: 'straight', 
      width: [0, 2], // 0 para o scatter não ligar pontos, 2 para a linha da CCI
    },
    grid: { borderColor: gridColor },
    xaxis: {
      type: 'numeric',
      min: xMin,
      max: xMax,
      tickAmount: isMobile ? 5 : 10,
      labels: { 
        style: { colors: axisColor },
        formatter: (val) => val !== undefined ? Number(val).toFixed(0) : ""
      },
      title: { text: 'Notas na escala do ENEM', style: { color: axisColor, fontWeight: 'bold' } }
    },
    yaxis: [
      {
        min: 0,
        max: 1,
        tickAmount: 5,
        labels: { 
          style: { colors: axisColor },
          formatter: (val) => Number(val).toFixed(1)
        },
        title: { text: 'Frequência de acertos', style: { color: axisColor } }
      },
      {
        opposite: true,
        min: 0,
        max: 1,
        tickAmount: 5,
        labels: { 
          style: { colors: axisColor },
          formatter: (val) => Number(val).toFixed(1)
        },
        title: { text: 'Probabilidade de acerto', style: { color: axisColor } }
      }
    ],
    tooltip: {
      theme: 'dark',
      shared: true,
      x: { formatter: (val) => `Proficiência: ${Number(val).toFixed(0)}` },
    },
    title: {
      text: `Frequência de acertos do item ${lastItemActivateNum}`,
      style: { color: textColor, fontSize: '16px', fontWeight: 'bold'},
    },
    subtitle: {
      text: `Frequência relativa observada (cod: ${lastItemActivate}; p: ${currentInfo?.corNome}).`,
      style: { color: textColor, fontSize: '13px' },
    },
    legend: { 
      position: 'bottom',
      labels: { colors: textColor },
    },
  }), [gridColor, axisColor, xMin, xMax, isMobile, lastItemActivate, lastItemActivateNum, textColor, currentInfo]);

  return (
    <div style={{ minHeight: '350px', width: '100%' }}>
      <Chart 
        options={options} 
        series={series} 
        type="line"
        height={350}
      />
    </div>
  );
}