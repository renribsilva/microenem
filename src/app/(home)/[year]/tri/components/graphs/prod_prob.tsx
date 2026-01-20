'use client'

import { useMemo, useState, useEffect, useRef } from 'react';
import { useNineteenData } from '../../../../../../context/nineteen_context';
import { useHomeData } from '../../../../../../context/home_context';
import Chart from 'react-apexcharts';
import { useChartTheme } from '../../../../../../hooks/use_chart_theme';

export default function ProdProbChart() {

  const { selectedItems, setSampleEAP, EAPData, k, d, setUpdateTrigger } = useNineteenData();
  const { deferredArea } = useHomeData();
  const [isUpdating, setIsUpdating] = useState(false);
  const { axisColor, textColor } = useChartTheme();

  useEffect(() => {
    setIsUpdating(false);
  }, [EAPData]);

  // --- 1. LÓGICA DO INTERVALO (Calcula apenas o que mudou na área atual) ---
  const intervalData = useMemo(() => {
    const ranges = {
      "LC": { start: 1, end: 45 }, 
      "CH": { start: 46, end: 90 },
      "CN": { start: 91, end: 135 }, 
      "MT": { start: 136, end: 180 },
    };    
    const { start, end } = ranges[deferredArea as keyof typeof ranges] || { start: 1, end: 45 };
    const updatedInterval = Array(45).fill('0'); 
    Object.values(selectedItems).forEach((item: any) => {
      const pos = item.posicao;
      if (pos >= start && pos <= end && item.status === "acerto") {
        const index = pos - start;
        if (index >= 0 && index < 45) {
          updatedInterval[index] = '1';
        }
      }
    });
    return updatedInterval.join('');
  }, [deferredArea, selectedItems]);

  const handleUpdateChart = () => {
    if (Object.entries(selectedItems).length === 0) return;
    setIsUpdating(true);    
    setSampleEAP(intervalData);
    setUpdateTrigger(prev => !prev);
};

  // --- 3. TRANSFORMAÇÃO DE DADOS (EIXO X: Theta -> Escala ENEM) ---
  const series = useMemo(() => {
    if (!EAPData?.theta || !EAPData?.posterior || !k || !d) return [];    
    const chartPoints = EAPData.theta.map((t: number, i: number) => [
      Number((t * k + d).toFixed(1)),           
      Number(EAPData.posterior[i].toFixed(4))   
    ]);
    return [{
      name: 'Log-Likelihood',
      data: chartPoints
    }];
  }, [EAPData, k, d]);

  // --- 4. CONFIGURAÇÃO VISUAL DO APEXCHARTS ---
  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'area',
      height: 350,
      zoom: { enabled: false },
      toolbar: { show: false },
      animations: { enabled: true, speed: 800 },
      // foreColor: '#64748b'
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3, colors: ['#6366f1'] }, 
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100],
        colorStops: [
          {
            offset: 0,
            color: '#6366f1',
            opacity: 0.4
          },
          {
            offset: 100,
            color: '#6366f1',
            opacity: 0.05
          }
        ]
      }
    },
    xaxis: {
      type: 'numeric',
      title: { 
        text: `Notas na escala do ENEM - ${deferredArea}`,
        style: { color: axisColor, fontWeight: 600 } 
      },
      min: Math.round(-4 * k + d),
      max: Math.round(4 * k + d),
      labels: { 
        formatter: (val) => Math.round(Number(val)).toString(),
        style: { colors: axisColor}
      },
      tickAmount: 6,
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      show: true,
      title: { 
        text: 'Log-Likelihood',
        style: { color: axisColor, fontWeight: 600 } 
      },
      labels: { 
        formatter: (val) => Math.floor(val).toString(),
        style: { colors: axisColor }
      }
    },
    annotations: {
      xaxis: [{
        x: EAPData?.eap || 0,
        borderColor: '#f43f5e', // Rose 500
        strokeDashArray: 4,
        label: {
          borderColor: '#f43f5e',
          style: { color: '#fff', background: '#f43f5e', fontWeight: 'bold', padding: { left: 8, right: 8, top: 4, bottom: 4 } },
          text: [`Nota mais provável`,
            `${EAPData?.eap || 0}`] as any,
          orientation: 'horizontal',
          offsetY: 50
        }
      }]
    },
    title: {
      text: `Curva de Verossimilhança (TRI)`,
      align: 'left',
      style: { fontSize: '18px', color: textColor, fontWeight: 700 }
    },
    subtitle: {
      text: ['Função de probabilidade a posteriori da', 
        'sequência de acertos e erros determinada.'] as any,
      style: { color: textColor, fontSize: '13px' },
    },
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
    grid: { 
      // borderColor: '#f1f5f9',
      // strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: false } }
    },
    colors: ['#6366f1']
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      
      <button 
        onClick={handleUpdateChart}
        disabled={isUpdating}
        style={{
          alignSelf: 'center',
          padding: '12px 28px',
          backgroundColor: isUpdating ? '#e2e8f0' : '#4f46e5', // Indigo 600
          color: isUpdating ? '#94a3b8' : 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: isUpdating ? 'not-allowed' : 'pointer',
          fontWeight: '700',
          fontSize: '14px',
          boxShadow: isUpdating ? 'none' : '0 10px 15px -3px rgba(79, 70, 229, 0.3)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          letterSpacing: '0.025em'
        }}
      >
        {isUpdating ? '⏳ PROCESSANDO...' : '🚀 CALCULAR DESEMPENHO TRI'}
      </button>

      <div style={{ height: '350px' }}>
        {series.length > 0 && EAPData ? (
          <Chart 
            options={options} 
            series={series} 
            type="area" 
            height={350} 
          />
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '350px', 
            color: '#94a3b8',
            textAlign: 'center',
            background: '#f8fafc',
            borderRadius: '16px',
            border: '2px dashed #e2e8f0'
          }}>
            <p style={{ fontSize: '16px', fontWeight: 500 }}>
              Marque as respostas e clique no botão <br/> para visualizar a curva de proficiência.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}