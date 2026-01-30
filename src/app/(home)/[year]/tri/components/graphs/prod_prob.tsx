'use client'

import { useMemo, useState, useEffect } from 'react';
import { useNineteenData } from '../../../../../../context/nineteen_context';
import { useHomeData } from '../../../../../../context/home_context';
import Chart from 'react-apexcharts';
import { useChartTheme } from '../../../../../../hooks/use_chart_theme';
import styles from "./graphs.module.css"
import { defaultConfig } from 'next/dist/server/config-shared';

export default function ProdProbChart() {

  const { 
    selectedItems, 
    setSampleEAP, 
    EAPData, 
    k, 
    d, 
    setUpdateTrigger, 
    activeCodes, 
    intervalData,
    currentYear
  } = useNineteenData();
  const { deferredArea, chartLogic} = useHomeData();
  const { selectedLabel } = chartLogic;
  const [isUpdating, setIsUpdating] = useState(false);
  const [showRenderWarning, setShowRenderWarning] = useState(false);
  const { axisColor, textColor, gridColor } = useChartTheme();
  const [EAPDesatualizado, setEAPDesatualizado] = useState<boolean>(false);

  const isMath = (deferredArea === "MT" && currentYear === "2019");

  useEffect(() => {
    setIsUpdating(false);
    setShowRenderWarning(false);
    setEAPDesatualizado(false)
  }, [EAPData]);

  useEffect(() => {
    if (Object.keys(selectedItems || {}).length > 0) {
      setEAPDesatualizado(true);
    }
  }, [selectedItems, deferredArea || '', selectedLabel]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isUpdating) {
      timer = setTimeout(() => {
        setShowRenderWarning(true);
      }, 3000);
    } else {
      setShowRenderWarning(false);
    }
    return () => clearTimeout(timer);
  }, [isUpdating]);

  const handleUpdateChart = () => {
    if (Object.entries(selectedItems).length === 0) return;
    setIsUpdating(true);    
    setSampleEAP(intervalData);
    setUpdateTrigger((prev: any) => !prev);
  };

  const series = useMemo(() => {
    if (!EAPData?.theta || !EAPData?.posterior || !k || !d) return [];    
    
    const chartPoints = EAPData.theta.map((t: number, i: number) => [
      isMath ? Number(t.toFixed(2)) : Number((t * k + d).toFixed(1)),           
      Number(EAPData.posterior[i].toFixed(4))   
    ]);
    
    return [{ name: 'Log-Likelihood', data: chartPoints }];
  }, [EAPData, k, d, isMath]);

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'area',
      height: 350,
      zoom: { enabled: false },
      toolbar: { show: false },
      animations: { enabled: true, speed: 800 },
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
          { offset: 0, color: '#6366f1', opacity: 0.4 },
          { offset: 100, color: '#6366f1', opacity: 0.05 }
        ]
      }
    },
    xaxis: {
      type: 'numeric',
      title: { 
        text: isMath ? `Proficiência (Theta) - ${deferredArea}` : `Notas na escala do ENEM - ${deferredArea}`, 
        style: { color: axisColor, fontWeight: 600 } 
      },
      min: isMath ? -4 : Math.round(-4 * k + d),
      max: isMath ? 4 : Math.round(4 * k + d),
      labels: { 
        formatter: (val) => isMath ? Number(val).toFixed(1) : Math.round(Number(val)).toString(), 
        style: { colors: axisColor} 
      },
      tickAmount: 6,
    },
    yaxis: {
      show: true,
      title: { text: 'Log-Likelihood', style: { color: axisColor, fontWeight: 600 } },
      labels: { formatter: (val) => Math.floor(val).toString(), style: { colors: axisColor } }
    },
    annotations: {
      xaxis: isMath 
        ? [
            {
              x: 0,
              borderColor: 'transparent',
              label: {
                // borderColor: '#cbd5e0',
                style: {
                  color: textColor,
                  background: gridColor,
                  fontWeight: 'bold',
                  padding: { left: 10, right: 10, top: 10, bottom: 10 }
                },
                text: ['O método (não oficial) de transformação da escala', 
                  'apresentou divergência na nota de MT.'] as any,
                orientation: 'horizontal',
                offsetY: 80
              }
            }
          ]
        : [
            {
              x: EAPData?.eap || 0,
              borderColor: '#f43f5e',
              strokeDashArray: 4,
              label: {
                borderColor: '#f43f5e',
                style: { color: '#fff', background: '#f43f5e', fontWeight: 'bold' },
                text: [`Nota mais provável`, `${EAPData?.eap || 0}`] as any,
                orientation: 'horizontal',
                offsetY: 50
              }
            }
          ]
    },
    // title: {
    //   text: `Curva de probabilidade a posteriori`,
    //   align: 'left',
    //   style: { fontSize: '18px', color: textColor, fontWeight: 700 }
    // },
    // subtitle: {
    //   text: ['Função de probabilidade a posteriori da', 'sequência de acertos e erros determinada.'] as any,
    //   style: { color: textColor, fontSize: '13px' },
    // },
    tooltip: { enabled: true, shared: true, custom: () => '', marker: { show: false } },
    grid: { xaxis: { lines: { show: false } }, yaxis: { lines: { show: false } } },
    colors: ['#6366f1']
  };

  return (
    <div className={styles.eap_container}>      
      <div className={styles.eap_button_container}>
        <button 
          onClick={handleUpdateChart}
          disabled={isUpdating}
          style={{
            padding: '12px 28px',
            backgroundColor: isUpdating ? '#e2e8f0' : '#4f46e5',
            color: isUpdating ? '#94a3b8' : 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: isUpdating ? 'not-allowed' : 'pointer',
            fontWeight: '700',
            fontSize: '14px',
            boxShadow: isUpdating ? 'none' : '0 10px 15px -3px rgba(79, 70, 229, 0.3)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {isUpdating ? '⏳ PROCESSANDO...' : (EAPDesatualizado ? '🔄 RECALCULAR DESEMPENHO TRI' : '🚀 CALCULAR DESEMPENHO TRI')}
        </button>       
        {showRenderWarning && (
          <p style={{ color: '#f43f5e', fontSize: '12px', fontWeight: '600', animation: 'pulse 2s infinite' }}>
            ⚠️ O servidor está acordando no Render, aguarde cerca de 30s...
          </p>
        )}
      </div>
      {series.length > 0 && EAPData ? (
        <>
          <div className={styles.tcc_cabecalho}>      
            <div className={styles.tcc_title}>
              <h3 className={styles.tcc_title_h3}>Curva de probabilidade a posteriori</h3>
              <p className={styles.tcc_subtitle_p}>
                Função de probabilidade a posteriori da sequência de acertos e erros determinada.
              </p>
            </div>
          </div>
          <Chart options={options} series={series} type="area" height={350} />
          <div style={{ fontSize: '0.75rem', fontWeight: '300', color: '#888'}}>
            A nota mais provável é a média ponderada de todas as proficiências sob a curva, tendo como peso as probabilidades ajustadas à normal N(0,1).
          </div>
        </>
      ) : (
        <div className={styles.eap_initial} >
          <p style={{ fontSize: '16px', fontWeight: 500 }}>
            {isUpdating && activeCodes.lenght === 0 ? 'Iniciando cálculos...' : 'Marque as respostas e clique no botão para calcular.'}
          </p>
        </div>
      )}
    </div>
  );
}