'use client'

import { useMemo, useState, useEffect } from 'react';
import { useNineteenData } from '../../../../../../context/nineteen_context';
import { useHomeData } from '../../../../../../context/home_context';
import Chart from 'react-apexcharts';

export default function ProdProbChart() {
  const { selectedItems, setSampleEAP, EAPData, k, d } = useNineteenData();
  const { deferredArea } = useHomeData();
  
  // Estado para controlar o loading do botão e da API
  const [isUpdating, setIsUpdating] = useState(false);

  // Destrava o botão quando novos dados chegam da API
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
    const updatedInterval = Array(end - start + 1).fill('0');

    Object.values(selectedItems).forEach((item: any) => {
      const pos = item.posicao;
      if (pos >= start && pos <= end && item.status === "acerto") {
        updatedInterval[pos - start] = '1';
      }
    });

    return { start, end, updatedInterval };
  }, [deferredArea, selectedItems]);

  // --- 2. FUNÇÃO DISPARADA PELO BOTÃO ---
  const handleUpdateChart = () => {
    if (!intervalData) return;
    setIsUpdating(true); // Trava o botão e sinaliza processamento
    
    const { start, end, updatedInterval } = intervalData;
    
    setSampleEAP(prev => {
      const arr = prev.split('');
      for (let i = start - 1; i < end; i++) {
        arr[i] = updatedInterval[i - (start - 1)];
      }
      return arr.join('');
    });
  };

  // --- 3. TRANSFORMAÇÃO DE DADOS (EIXO X: Theta -> Escala ENEM) ---
  const series = useMemo(() => {
    if (!EAPData?.theta || !EAPData?.posterior || !k || !d) return [];
    
    const chartPoints = EAPData.theta.map((t: number, i: number) => [
      Number((t * k + d).toFixed(1)),           // X transformado para 0-1000
      Number(EAPData.posterior[i].toFixed(4))    // Y (Log-Likelihood)
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
      animations: { enabled: true, speed: 800 }
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3, colors: ['#2E93fA'] },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0.1,
        stops: [0, 90, 100]
      }
    },
    xaxis: {
      type: 'numeric',
      title: { text: `Nota Estimada - ${deferredArea}` },
      // Define os limites do gráfico baseados na escala ENEM da área
      min: Math.round(-4 * k + d),
      max: Math.round(4 * k + d),
      labels: { formatter: (val) => Math.round(Number(val)).toString() },
      tickAmount: 6
    },
    yaxis: {
      show: true,
      title: { text: 'Log-Likelihood' },
      labels: { formatter: (val) => Math.floor(val).toString() }
    },
    annotations: {
      xaxis: [{
        x: EAPData?.eap || 0, // Nota final já transformada vinda do R
        borderColor: '#FF4560',
        strokeDashArray: 4,
        label: {
          borderColor: '#FF4560',
          style: { color: '#fff', background: '#FF4560', fontWeight: 'bold' },
          text: `Nota Final: ${EAPData?.eap || 0}`,
        }
      }]
    },
    title: {
      text: `Curva de Verossimilhança (TRI)`,
      align: 'center',
      style: { fontSize: '16px', color: '#4A5568' }
    },
    tooltip: {
      x: { show: true, formatter: (val) => `Proficiência: ${Math.round(Number(val))}` },
      y: { title: { formatter: () => 'Log-L:' } }
    },
    grid: { borderColor: '#EDF2F7' }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      
      {/* Botão para evitar sobrecarga no Render Free */}
      <button 
        onClick={handleUpdateChart}
        disabled={isUpdating}
        style={{
          alignSelf: 'center',
          padding: '12px 24px',
          backgroundColor: isUpdating ? '#CBD5E0' : '#3182CE',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          cursor: isUpdating ? 'not-allowed' : 'pointer',
          fontWeight: '700',
          fontSize: '14px',
          boxShadow: '0 4px 14px 0 rgba(49, 130, 206, 0.39)',
          transition: 'all 0.2s ease'
        }}
      >
        {isUpdating ? '⏳ CALCULANDO...' : '🚀 ATUALIZAR NOTA TRI'}
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
            color: '#A0AEC0',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '16px' }}>
              Selecione as questões e clique no botão acima <br/> para gerar a estimativa de nota.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}