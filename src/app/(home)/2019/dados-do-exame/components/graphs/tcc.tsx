'use client'

import { useState, useMemo, useEffect, useRef } from 'react';
import Chart from 'react-apexcharts';
import { useChartTheme } from '../../../../../../hooks/chart_theme';

export default function TCCChart({ logic }: { logic: any }) {
  const { gridColor, axisColor, colorMap, textColor } = useChartTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

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

  // --- CONFIGURAÇÃO DE DADOS ---
  const series = useMemo(() => [{
    name: "Acertos esperados",
    data: activeDataset?.data.map((val: number, i: number) => ({
      x: activeDataset.labels_x[i],
      y: Math.round(val * 10) / 10
    })) || []
  }], [activeDataset, currentInfo.fullText]);

  // --- CONFIGURAÇÕES DO APEXCHARTS ---
  const options: ApexCharts.ApexOptions = useMemo(() => ({
    chart: {
      id: 'tcc-chart',
      type: 'line',
      toolbar: { 
        show: true,
        offsetX: -5, // Move um pouco para a esquerda se estiver cortando na borda
        offsetY: 0,  // Empurra a toolbar um pouco para baixo
      },
      zoom: {
        enabled: false
      }
    },
    stroke: {
      curve: 'smooth',
      width: 3,
      colors: [chartColor]
    },
    grid: { 
      borderColor: gridColor,
    },
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
        // Adicione o formatter abaixo:
        formatter: (val) => val.toFixed(0) 
      },
      title: { text: 'Acertos esperados', style: { color: axisColor, fontWeight: 'bold' } }
    },
    // REMOVE A CAIXA DE DADOS (Tooltip das séries)
    tooltip: {
      theme: 'dark',
      followCursor: true,
      enabled: true,
      marker: {
        show: false
      },
      x: {
        show: true, // Garante que a parte de cima apareça
        formatter: function(val) {
          // Adiciona 3 espaços antes do texto para simular o padding-left
          return "\u00A0\u00A0Proficiência: " + val;
        }
      },
      y: {
        title: {
          formatter: () => "Acertos esperados: " // ISSO AQUI mata o nome da série e força o seu texto
        },
        formatter: (val) => val.toFixed(0)
      }
    },
    annotations: {
      xaxis: [
        {
          x: bMedio,
          borderColor: chartColor,
          strokeDashArray: 4,
          // label: {
          //   text: `Dificuldade Média: ${bMedio.toFixed(0)}`,
          //   style: { color: '#fff', background: chartColor }
          // }
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
            radius: 2
          },
          label: {
            borderColor: chartColor,
            offsetY: proficienciaAtual > bMedio ? -5 : 40,
            style: {
              color: '#fff',
              background: chartColor,
              padding: { left: 10, right: 10, top: 5, bottom: 5 }
            },
            text: [ `Dificuldade média:`, 
              `proficiência de ${proficienciaAtual.toFixed(0)}`,
              `${resultadoAtual.toFixed(0)} acertos esperados`
            ] 
          }
        }
      ]
    }
  }), [chartColor, gridColor, axisColor, xMin, xMax, bMedio, proficienciaAtual, resultadoAtual]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>    
    
    {/* CABEÇALHO: Título à esquerda, Dropdown à direita */}
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'flex-start',
      padding: '0 10px',
    }}>
      
      {/* Título e Subtítulo em HTML (mais controle) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: '16px', 
          fontWeight: 'bold', 
          color: textColor ,
        }}>
          Curva característica do teste
        </h3>
        <p style={{ 
          margin: '2px 0 0 0', 
          fontSize: '13px', 
          color: textColor, 
          lineHeight: '1.2' 
        }}>
          Modelo que descreve o número de acertos<br/>
          esperados para cada proficiência. Destaque<br/>
          para o ponto de inflexão: a dificuldade média dos itens.
        </p>
      </div>

      {/* Dropdown de Seleção de Prova (Lado Direito) */}
      <div style={{ position: 'relative', zIndex: 20, width: '220px' }} ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0',
            backgroundColor: '#fff', cursor: 'pointer', display: 'flex',
            alignItems: 'center', gap: '8px', fontSize: '0.85rem',
            fontWeight: '600', width: '100%', justifyContent: 'space-between'
          }}
        >
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Prova: <span style={{ color: chartColor }}>{currentInfo.fullText}</span>
          </span>
          <span style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>▼</span>
        </button>

        {isOpen && (
          <div style={{
            position: 'absolute', top: '110%', right: 0, width: '250px',
            backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', maxHeight: '250px', overflowY: 'auto'
          }}>
            {availableDatasets.map((ds: any) => {
              const info = getInfoCaderno(ds.metadata.codigo, ds.metadata.lingua);
              const isSelected = selectedLabel === ds.label;
              return (
                <div
                  key={ds.label}
                  onClick={() => { setSelectedLabel(ds.label); setIsOpen(false); }}
                  style={{
                    padding: '10px 14px', cursor: 'pointer', fontSize: '0.8rem',
                    backgroundColor: isSelected ? '#f1f5f9' : 'transparent',
                    color: isSelected ? (colorMap[info.corNome] || '#475569') : '#475569',
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

    {/* Container do Gráfico */}
    <div style={{ flex: 1, minHeight: '250px', background: '#fff', borderRadius: '8px' }}>
      <Chart 
        options={options} 
        series={series} 
        type="line" 
        height="100%" 
      />
    </div>
  </div>
)}