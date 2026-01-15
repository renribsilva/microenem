'use client'

import { useEffect, useMemo, useState } from 'react';
import Chart from 'react-apexcharts';
import { useNineteenData } from '../../../../../../context/nineteen_context';
import { useChartTheme } from '../../../../../../hooks/use_chart_theme';
import { useHomeData } from '../../../../../../context/home_context';

export default function ViolinBinsChart() {

  const { scoreData, lastItemActivate, lastItemActivateNum } = useNineteenData();
  const { textColor, axisColor, gridColor } = useChartTheme();
  const { chartLogic } = useHomeData();
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 800 : false);
  const { currentInfo } = chartLogic
    
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 800);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const binsData = useMemo(() => {
    if (!scoreData || !lastItemActivate || !scoreData[lastItemActivate]) return null;
    const rawBins = scoreData[lastItemActivate].bins;
    if (!rawBins) return null;
    const v0 = rawBins["0"];
    const v1 = rawBins["1"];
    const labels = rawBins.labels;
    const filteredIndices = labels
      .map((_, i) => i)
      .filter(i => v0[i] > 0 || v1[i] > 0);
    return {
      "0": filteredIndices.map(i => v0[i]).reverse(),
      "1": filteredIndices.map(i => v1[i]).reverse(),
      labels: filteredIndices.map(i => labels[i]).reverse()
    };
  }, [scoreData, lastItemActivate]);

  const maxAbsValue = useMemo(() => {
    if (!binsData) return 100000;
    const rawMax = Math.max(...binsData["1"], ...binsData["0"]);
    return Math.ceil(rawMax / 100000) * 100000 || 100000;
  }, [binsData]);

  const series = useMemo(() => {
    if (!binsData) return [];
    return [
      {
        name: 'Acertos',
        data: binsData["1"] || []
      },
      {
        name: 'Erros',
        data: (binsData["0"] || []).map((v: number) => -v)
      }
    ];
  }, [binsData]);

  const options: ApexCharts.ApexOptions = useMemo(() => ({
    chart: {
      type: 'bar',
      stacked: true,
      toolbar: { show: true },
      animations: { enabled: false },
    },
    colors: ['#00E396', '#FF4560'],
    plotOptions: {
      bar: {
        horizontal: true, 
        barHeight: '90%', 
      }
    },
    stroke: {
      width: 1,
      colors: [gridColor]
    },
    dataLabels: { enabled: false },
    grid: { show: false },
      yaxis: {
        // Removido stepSize manual que pode conflitar com categorias
        labels: {
          style: { colors: axisColor },
        }
      },
    tooltip: {
      theme: "dark",  
      shared: true,
      intersect: false,
      followCursor: true,
      x: {
        formatter: (val) => `Proficiência: ${val}`
      },
      y: {
        formatter: (val) => String(Math.abs(Number(val)).toLocaleString("pt-BR"))
      }
    },
    xaxis: {
      // CORREÇÃO: Removido o aninhamento duplicado de xaxis
      categories: binsData?.labels || [],
      min: -maxAbsValue,
      max: maxAbsValue,
      tickAmount: isMobile? 2 : 4,
      title: {
        text: 'Quantidade de Alunos',
        style: { color: axisColor }
      },
      labels: {
        style: { colors: axisColor },
        formatter: function (val): string {
          return Math.abs(Math.round(Number(val))).toLocaleString();
        }
      }
    },
    legend: { 
      position: 'bottom',
      labels: { colors: textColor},
    },
    title: {
      text: [`Frequência de resposta ao item ${lastItemActivateNum}`] as any,
      style: { color: textColor, fontSize: '16px', fontWeight: 'bold'},
    },
    subtitle: {
      text: [
        `Frequência absoluta de acertos e erros por faixa`, 
        `de proficiência (cod: ${lastItemActivate}; p: ${currentInfo?.corNome}).`
      ] as any,
      style: { color: textColor, fontSize: '13px' },
    },
  }), [binsData, currentInfo, maxAbsValue, textColor, axisColor, lastItemActivateNum, gridColor]);

  return (
    <div style={{minHeight: '350px'}}>
      <Chart 
        options={options} 
        series={series} 
        type="bar" 
        height="100%" 
        width="100%"
      />
    </div>
  );
}