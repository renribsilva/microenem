'use client'

import { useEffect, useState } from "react";

export default function InputShell({ logic }: { logic: any }) {
  if (!logic) return null;

  const { 
    proficienciaAtual, 
    resultadoAtual, 
    activeDataset, 
    pointIndex, 
    setPointIndex, 
    chartColor,
    xMin,
    xMax
  } = logic;

  const [inputValue, setInputValue] = useState(proficienciaAtual.toFixed(0));

  useEffect(() => {
    setInputValue(proficienciaAtual.toFixed(0));
  }, [proficienciaAtual]);

  const applyValue = () => {
    let numericVal = parseFloat(inputValue);
    if (!isNaN(numericVal)) {
      if (numericVal < xMin) numericVal = xMin;
      if (numericVal > xMax) numericVal = xMax;
      setInputValue(numericVal.toString());
      const closestIndex = activeDataset.labels_x.reduce((prev: number, curr: number, idx: number) => {
        return Math.abs(curr - numericVal) < Math.abs(activeDataset.labels_x[prev] - numericVal) ? idx : prev;
      }, 0);
      setPointIndex(closestIndex);
    } else {
      setInputValue(proficienciaAtual.toFixed(0));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      applyValue();
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div style={{ 
      padding: '12px 4px', 
      background: '#f8fafc', 
      borderRadius: '10px', 
      border: '1px solid #e2e8f0',
      width: '75px', 
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
      alignItems: 'center',
      userSelect: 'none',
      position: 'relative', // Garante contexto para o z-index
      zIndex: 50           // Fica à frente das áreas de interação do gráfico
    }}>
      <style>{`
        .slider-wrapper {
          height: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;      /* Área de clique aumentada para o mouse */
          position: relative;
          touch-action: none; /* Previne scroll acidental em mobile */
        }
        
        .vertical-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 140px; 
          height: 6px;
          background: #e2e8f0;
          border-radius: 5px;
          outline: none;
          /* O rotate(-90deg) faz a direita(max) subir e esquerda(min) descer */
          transform: rotate(-90deg); 
          cursor: pointer;
          position: absolute;
          z-index: 60;
        }

        /* Customização da Bolinha (Chrome/Safari/Edge) */
        .vertical-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px; 
          height: 20px;
          background: ${chartColor};
          border: 3px solid #fff;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          cursor: pointer;
          transition: transform 0.1s ease;
        }

        .vertical-slider:active::-webkit-slider-thumb {
          transform: scale(1.2);
        }

        /* Firefox */
        .vertical-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: ${chartColor};
          border: 3px solid #fff;
          border-radius: 50%;
          cursor: pointer;
        }

        @media (max-width: 800px) {
          .slider-wrapper {
            height: 140px;
            width: 50px; /* Ainda mais largo para facilitar o touch/mouse em telas menores */
          }
          .vertical-slider {
            width: 120px;
          }
        }
      `}</style>

      {/* Nota */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 70 }}>
        <div style={{ fontSize: '0.55rem', color: '#64748b', fontWeight: 'bold', marginBottom: '2px' }}>NOTA</div>
        <input 
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={applyValue}
          style={{ 
            fontSize: '1rem', fontWeight: '800', width: '55px', 
            border: 'none', background: 'transparent', outline: 'none',
            borderBottom: `2px solid ${chartColor}`, color: '#1e293b', textAlign: 'center'
          }}
        />
      </div>

      {/* Slider */}
      <div className="slider-wrapper">
        <input 
          type="range" 
          className="vertical-slider"
          min="0"
          max={activeDataset.data.length - 1} 
          value={pointIndex}
          onChange={(e) => setPointIndex(Number(e.target.value))}
        />
      </div>

      {/* Acertos */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 70 }}>
        <div style={{ fontSize: '0.55rem', color: '#64748b', fontWeight: 'bold', marginBottom: '2px' }}>ACERTOS</div>
        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: chartColor }}>
          {resultadoAtual.toFixed(0)}
        </div>
      </div>
    </div>
  );
}