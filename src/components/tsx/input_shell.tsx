'use client'

import { useEffect, useState } from "react";
import styles from "./components.module.css"

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
    <div className={styles.shell_container}>
      {/* Bloco Nota */}
      <div className={styles.label_group}>
        <div className={styles.label_title}>NOTA</div>
        <input 
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={applyValue}
          className={styles.label_input}
          style={{ borderBottom: `2px solid ${chartColor}`}}
        />
      </div>

      {/* Slider */}
      <div className={styles.slider_wrapper}>
        <input 
          type="range" 
          className={styles.custom_slider}
          style={{background: chartColor}}
          min="0"
          max={activeDataset.data.length - 1} 
          value={pointIndex}
          onChange={(e) => setPointIndex(Number(e.target.value))}
        />
      </div>

      {/* Bloco Acertos */}
      <div className={styles.label_group} style={{ textAlign: 'center' }}>
        <div className={styles.label_title}>ACERTOS</div>
        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: chartColor }}>
          {resultadoAtual.toFixed(0)}
        </div>
      </div>
    </div>
  );
}