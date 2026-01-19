'use client'

import { useEffect, useMemo, useRef, useState } from 'react';
import Chart from 'react-apexcharts';
import { useChartTheme } from '../../../../../../hooks/use_chart_theme';
import { useHomeData } from '../../../../../../context/home_context';
import { useNineteenData } from '../../../../../../context/nineteen_context';

export default function AcertosChart() {

  const { chartLogic } = useHomeData();
  const { gridColor, axisColor, textColor } = useChartTheme();
  const { lastItemActivate, lastItemActivateNum, probData, probLabels, k, d, itemGraphData} = useNineteenData();
  
  // Refs e Estados para controle de renderização por tamanho
  const parentRef = useRef<HTMLDivElement>(null);
  const [dimensionsReady, setDimensionsReady] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 800 : false);
  
  // Estado para disparar a segunda renderização
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 800);
    window.addEventListener('resize', handleResize);
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0) {
          setDimensionsReady(true);
        }
      }
    });
    if (parentRef.current) {
      observer.observe(parentRef.current);
    }
    const timer = setTimeout(() => {
      setRefreshKey(prev => prev + 1);
    }, 500);

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  const { 
    chartColor,
    xMin, 
    xMax,
    currentInfo
  } = chartLogic;
  const transformTheta = (theta: number) => ((theta * k) + d);

  // --- CONFIGURAÇÃO DE DADOS ---
  const series = useMemo(() => {
    if (!itemGraphData || !Array.isArray(itemGraphData.x)) return [];
    return [
      {
        name: "Frequência de acertos",
        type: 'scatter',
        data: itemGraphData.x.map((valorX, index) => ({
          x: valorX,
          y: itemGraphData.y[index] // Pega o y correspondente pelo índice
        }))
      },
      {
        name: "Curva característica do item",
        type: 'line',
        data: probData[lastItemActivate]?.map((yValue, idx) => ({
        x: transformTheta(probLabels[idx]),
        y: Number(yValue),
        // tooltip: { enabled: false },
      })),
      },
    ];
  }, [itemGraphData, lastItemActivate, probData]);

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
      curve: 'straight', 
      width: [0, 1],     
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
      enabled: true,
      shared: true,      
      intersect: false,   
      theme: 'dark',
      fixed: {
        enabled: false,   
      },
      x: {
        show: true,
        formatter: (val) => `Proficiência: ${Number(val).toFixed(0)}`
      },
      y: {
        formatter: (val) => val !== undefined ? val.toFixed(2) : ""
      }
    },
    title: {
      text: `Frequência de acertos do item ${lastItemActivateNum}`,
      style: { color: textColor, fontSize: '16px', fontWeight: 'bold'},
    },
    subtitle: {
      text: [
        `Frequência relativa de acertos observados em cada`, 
        `faixa de proficiência (cod: ${lastItemActivate}; p: ${currentInfo?.corNome}).`
      ] as any,
      style: { color: textColor, fontSize: '13px' },
    },
    legend: { 
      position: 'bottom',
      labels: { colors: textColor},
    },
  }), [chartColor, currentInfo, gridColor, axisColor, xMin, xMax, lastItemActivate, lastItemActivateNum, isMobile, textColor]);

  return (
    <div ref={parentRef} style={{height: '350px', width: '100%'}}>
      {dimensionsReady && (
        <Chart 
          key={refreshKey}
          options={options} 
          series={series} 
          type="line"
          height='100%'
          width='100%'
        />
      )}
    </div>
  );
}