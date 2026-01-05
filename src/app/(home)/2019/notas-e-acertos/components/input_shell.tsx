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
    xMin, // Valor mínimo do eixo X (ex: 0 ou 100)
    xMax  // Valor máximo do eixo X (ex: 1000)
  } = logic;

  const [inputValue, setInputValue] = useState(proficienciaAtual.toFixed(0));

  useEffect(() => {
    setInputValue(proficienciaAtual.toFixed(0));
  }, [proficienciaAtual]);

  const applyValue = () => {

    let numericVal = parseFloat(inputValue);
    
    if (!isNaN(numericVal)) {
      // 1. APLICA A TRAVA (CLAMPING)
      if (numericVal < xMin) numericVal = xMin;
      if (numericVal > xMax) numericVal = xMax;

      // 2. Atualiza o input visual para o valor travado
      setInputValue(numericVal.toString());

      // 3. Busca o índice mais próximo no dataset
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
    <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
            Proficiência
          </div>
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={applyValue}
            style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              width: '100px', 
              border: 'none', 
              background: 'transparent',
              outline: 'none',
              borderBottom: `2px solid ${chartColor}`,
              color: '#1e293b'
            }}
          />
          {/* Opcional: dica visual do intervalo */}
          {/* <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '4px' }}>
            Intervalo: {xMin} - {xMax}
          </div> */}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>
            Acertos Esperados
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: chartColor }}>
            {resultadoAtual.toFixed(0)}
          </div>
        </div>
      </div>
      
      <input 
        type="range" 
        min="0"
        max={activeDataset.data.length - 1} 
        value={pointIndex}
        onChange={(e) => setPointIndex(Number(e.target.value))}
        style={{ width: '100%', cursor: 'pointer', accentColor: chartColor }}
      />
    </div>
  );
}