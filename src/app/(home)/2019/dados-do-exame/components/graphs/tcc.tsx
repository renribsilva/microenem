'use client'

import { useState, useMemo, useEffect, useRef } from 'react';
import Chart from 'react-apexcharts';
import { useChartTheme } from '../../../../../../hooks/use_chart_theme';
// import InputShell from '../../../../../../components/tsx/input_shell';
import styles from "./graphs.module.css"
import { useHomeData } from '../../../../../../context/home_context';

export default function TCCChart() {

  const { chartLogic } = useHomeData();
  const { gridColor, axisColor, colorMap, tickColor } = useChartTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { 
    chartColor, 
    availableDatasets, 
    currentInfo, 
    setSelectedLabel, 
    selectedLabel, 
    xMin, 
    xMax, 
    bMedio, 
    activeDataset, 
    proficienciaAtual,
    resultadoAtual,
    getInfoCaderno,
    setPointIndex
  } = chartLogic;

  // --- CONFIGURAÇÃO DE DADOS ---
  const series = useMemo(() => [
    {
      name: "Acertos esperados", // Série 0 (Prioridade)
      type: 'line',
      data: activeDataset?.data_teorico?.map((val, i) => ({
        x: activeDataset?.labels_x[i],
        y: val !== null ? Math.round(val * 10) / 10 : null
      })) || []
    },
    {
      name: "Média observada", // Série 1
      type: 'scatter',
      data: activeDataset?.data_empirico?.map((val, i) => ({
        x: activeDataset?.labels_x[i],
        y: val
      })) || []
    }
  ], [activeDataset]);

  const yBMedio = useMemo(() => {
    if (!activeDataset || !bMedio) return 22.5;
    const closestIndex = activeDataset.labels_x.reduce((prev: number, curr: number, idx: number) => {
      return Math.abs(curr - bMedio) < Math.abs(activeDataset.labels_x[prev] - bMedio) ? idx : prev;
    }, 0);
    return activeDataset.data_teorico[closestIndex];
  }, [activeDataset, bMedio]);

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
      size: [1, 1],
      strokeColors: '#fff',
      strokeWidth: 0,
      hover: {
        size: 6,
      }
    },
    colors: [chartColor, '#94a3b8'],
    stroke: {
      curve: 'smooth',
      width: [1, 1],
      colors: [chartColor],
      connectNulls: true  
    },
    grid: { borderColor: gridColor },
    xaxis: {
      type: 'numeric',
      min: xMin,
      max: xMax,
      tickAmount: 10,
      labels: { 
        style: { colors: axisColor },
        formatter: (val) => Number(val).toFixed(0)
      },
      tooltip: { enabled: false },
      title: { text: 'Notas na escala do ENEM', style: { color: axisColor, fontWeight: 'bold' } }
    },
    yaxis: {
      min: 0,
      max: 45,
      tickAmount: 9,
      labels: { 
        style: { colors: axisColor },
        formatter: (val) => val.toFixed(0) 
      },
      title: { text: 'Acertos', style: { color: axisColor, fontWeight: 'bold' } }
    },
    tooltip: {
      theme: 'dark',
      followCursor: true,
      enabled: true,
      marker: { show: true },
      x: {
        show: true,
        formatter: (val) => "\u00A0\u00A0Proficiência: " + val
      },
      y: {
        formatter: function(val, { series, seriesIndex, dataPointIndex, w }) {
          // Se o valor atual já existe, retorna ele
          if (val !== null && val !== undefined) {
            return val.toFixed(0);
          }

          // Se o valor for null, buscamos no array da série o valor mais próximo
          const currentSeries = series[seriesIndex];
          
          // Busca para trás (valor anterior mais próximo)
          let closestVal = null;
          for (let i = dataPointIndex; i >= 0; i--) {
            if (currentSeries[i] !== null && currentSeries[i] !== undefined) {
              closestVal = currentSeries[i];
              break;
            }
          }

          // Se não achou para trás, busca para frente
          if (closestVal === null) {
            for (let i = dataPointIndex; i < currentSeries.length; i++) {
              if (currentSeries[i] !== null && currentSeries[i] !== undefined) {
                closestVal = currentSeries[i];
                break;
              }
            }
          }

          return closestVal !== null ? `${closestVal.toFixed(0)}` : "N/A";
        },
        title: {
          formatter: (seriesName) => seriesName + ": "
        }
      }
    },
    annotations: {
      yaxis: [
        {
          y: yBMedio,
          borderColor: chartColor,
          borderWidth: 2,
          strokeDashArray: 4,
          label: {
            text: `Dificuldade Média: ${bMedio.toFixed(1)}`,
            style: { color: '#000000ff', background: chartColor, fontWeight: 'bold' },
            offsetY: 25,
            offsetX: -10,
            borderColor: chartColor,
            borderWidth: 6,
          }
        }
      ],
      points: [
        {
          x: proficienciaAtual,
          y: resultadoAtual,
          marker: {
            size: 6,
            fillColor: chartColor,
            strokeColor: '#fff',
            strokeWidth: 0,
            radius: 2
          },
          // label: {
          //   borderColor: chartColor,
          //   offsetY: proficienciaAtual > bMedio ? 35 : -20,
          //   offsetX: proficienciaAtual <= bMedio ? 80 : -80,
          //   style: {
          //     color: '#fff',
          //     background: chartColor,
          //     padding: { left: 10, right: 10, top: 5, bottom: 5 }
          //   },
          //   text: [
          //     `proficiência de ${proficienciaAtual.toFixed(0)}`,
          //     `${resultadoAtual.toFixed(0)} acertos esperados`
          //   ] 
          // }
        }
      ]
    }
  }), [chartColor, gridColor, axisColor, xMin, xMax, bMedio, proficienciaAtual, resultadoAtual, setPointIndex]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.tcc_container}>    
      <div className={styles.tcc_cabecalho}>      
        <div className={styles.tcc_title}>
          <h3 className={styles.tcc_title_h3}>Curva característica do teste</h3>
          <p className={styles.tcc_subtitle_p}>
            Comportamento esperado (teórico) e observado (empírico) da relação nota/acerto. Destaque para o ponto de inflexão que representa a dificuldade média da prova.
          </p>
        </div>

        <div className={styles.dropdown_container} ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={styles.dropdown_button}
          >
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Prova: <span style={{ color: chartColor }}>{currentInfo.fullText}</span>
            </span>
            <span style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>▼</span>
          </button> 

          {isOpen && (
            <div className={styles.dropdown_list} >
              {availableDatasets?.map((ds: any) => {
                const info = getInfoCaderno(ds.metadata.codigo, ds.metadata.lingua);
                const isSelected = selectedLabel === ds.label;
                return (
                  <div
                    key={ds.label}
                    onClick={() => { setSelectedLabel(ds.label); setIsOpen(false); }}
                    style={{
                      padding: '10px 14px', cursor: 'pointer', fontSize: '0.8rem',
                      backgroundColor: isSelected ? gridColor : 'transparent',
                      color: isSelected ? (colorMap[info.corNome] || '#475569') : tickColor,
                      borderLeft: `4px solid ${isSelected ? (colorMap[info.corNome] || '#475569') : 'transparent'}`,
                    }}
                  >
                    {info.fullText}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className={styles.tcc_graph_container}>
        {/* <InputShell logic={logic}/> */}
        <div className={styles.tcc_graph_wrapper}>
          <Chart 
            options={options} 
            series={series} 
            type="line"
            height='100%'
            width='100%'
          />
        </div>
      </div>
    </div>
  );
}