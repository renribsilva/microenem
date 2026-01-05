'use client'

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Legend,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Line } from 'react-chartjs-2';
import { useChartTheme } from '../../../../../../hooks/chart_theme';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Legend, annotationPlugin
);

export default function TCCChart({ logic }: { logic: any }) {
  
  if (!logic) return null;

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
    getInfoCaderno 
  } = logic;

  const { colorMap } = useChartTheme()

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative' }}>    
      <div style={{ position: 'relative', zIndex: 10 }} ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0',
            backgroundColor: '#fff', cursor: 'pointer', display: 'flex',
            alignItems: 'center', gap: '10px', fontSize: '0.9rem',
            fontWeight: '600', width: '100%', justifyContent: 'space-between'
          }}
        >
          <span>
            Prova Selecionada: <span style={{ color: chartColor }}>{currentInfo.fullText}</span>
          </span>
          <span style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>▼</span>
        </button>

        {isOpen && (
          <div style={{
            position: 'absolute', top: '110%', left: 0, right: 0,
            backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', maxHeight: '300px', overflowY: 'auto'
          }}>
            {availableDatasets.map((ds) => {
              const info = getInfoCaderno(ds.metadata.codigo, ds.metadata.lingua);
              return (
                <div
                  key={ds.label}
                  onClick={() => { setSelectedLabel(ds.label); setIsOpen(false); }}
                  style={{
                    padding: '12px 16px', cursor: 'pointer', fontSize: '0.85rem',
                    backgroundColor: selectedLabel === ds.label ? '#f1f5f9' : 'transparent',
                    color: selectedLabel === ds.label ? (colorMap[info.corNome] || '#475569') : '#475569',
                    borderLeft: `4px solid ${selectedLabel === ds.label ? (colorMap[info.corNome] || '#475569') : 'transparent'}`,
                  }}
                >
                  {info.fullText}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ height: '350px', width: '100%', background: '#fff', borderRadius: '8px' }}>
        <Line 
          // key={`${selectedLabel}-${proficienciaAtual}`}  
          options={{
            responsive: true, maintainAspectRatio: false,
            scales: {
              x: { 
                type: 'linear',
                min: xMin,    // Valor inicial
                max: xMax, // Valor final
                ticks: { stepSize: 100 } // De quanto em quanto aparece o número
              },
              y: { 
                min: -5, 
                max: 50, // Aumente aqui para dar o "respiro" no topo
                ticks: { stepSize: 5 }
              }
              // ...
            },
            plugins: { 
              legend: { display: false },
              annotation: {
                annotations: {
                  // line1: {
                  //   type: 'line', xMin: pointIndex, xMax: pointIndex,
                  //   borderColor: 'rgba(0, 0, 0, 0.1)', borderWidth: 1, borderDash: [5, 5],
                  // },
                  lineB: {
                    type: 'line' as const,
                    xMin: bMedio,
                    xMax: bMedio,
                    borderColor: chartColor,
                    borderWidth: 2,
                    label: {
                      display: true,
                      content: `Dificuldade Média: ${bMedio}`,
                      position: 'end',
                      backgroundColor: chartColor,
                      font: { size: 10 }
                    }
                  },
                  pointLabel: {
                    type: 'label' as const,
                    xValue: proficienciaAtual,
                    yValue: resultadoAtual,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderColor: chartColor,
                    borderWidth: 1,
                    borderRadius: 4,
                    content: [`${proficienciaAtual.toFixed(0)} pontos`, `${resultadoAtual.toFixed(0)} acertos esperados`],
                    font: { size: 11, weight: 'bold' },
                    padding: 6,
                    yAdjust: proficienciaAtual > bMedio ? 35 : -35,
                    xAdjust: proficienciaAtual > bMedio ? -50 : 50,
                    textAlign: 'center'
                  }
                }
              }
            }
          }} 
          data={{ 
            datasets: [{
            label: selectedLabel,
            borderColor: chartColor,
            data: activeDataset?.data.map((val, i) => ({
              x: activeDataset.labels_x[i],
              y: val
            })),
            // Ponto que segue o slider
            pointRadius: (ctx: any) => {
              const item = ctx.dataset.data[ctx.dataIndex];
              return item?.x === proficienciaAtual ? 6 : 0;
            },
            pointBackgroundColor: chartColor,
            tension: 0.3
          }]
          }}
        />
      </div>
    </div>
  );
}