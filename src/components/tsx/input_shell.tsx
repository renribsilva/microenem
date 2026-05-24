'use client'

import { useEffect, useState } from "react";
import styles from "./components.module.css"
import { useHomeData } from "../../context/home_context";
import { useChartTheme } from "../../hooks/use_chart_theme";

export default function InputShell() {
  const { chartLogic } = useHomeData();

  const { 
    activeTCC, 
    proficienciaAtual,
    xMax,
    xMin,
    pointIndex,
    setPointIndex,
    chartColor,
  } = chartLogic;

  const { gridColor } = useChartTheme();

  // 1. Fallback para o tamanho dos dados: se não houver dataset, o range é 0 a 0
  const maxRange = activeTCC?.data_teorico?.length 
    ? activeTCC.data_teorico.length - 1 
    : 0;

  const [inputValue, setInputValue] = useState(proficienciaAtual?.toFixed(1) || "0.0");

  useEffect(() => {
    // Garantia de que proficienciaAtual existe antes de formatar
    setInputValue(proficienciaAtual !== undefined ? proficienciaAtual : 0);
  }, [proficienciaAtual]);

  const applyValue = () => {
    let numericVal = parseFloat(inputValue as string);
    if (!isNaN(numericVal) && activeTCC?.labels_x) {
      if (numericVal < xMin) numericVal = xMin;
      if (numericVal > xMax) numericVal = xMax;
      
      setInputValue(numericVal.toString());
      
      const closestIndex = activeTCC.labels_x.reduce((prev: number, curr: number, idx: number) => {
        return Math.abs(curr - numericVal) < Math.abs(activeTCC.labels_x[prev] - numericVal) ? idx : prev;
      }, 0);
      setPointIndex(closestIndex);
    } else {
      setInputValue(proficienciaAtual);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      applyValue();
      (e.target as HTMLInputElement).blur();
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(',', '.');
    if (value.length > 6) return;
    const regex = /^\d{0,4}(\.\d{0,1})?$/;
    if (regex.test(value)) {
      setInputValue(value);
    }
  };

  // 2. Proteção para o cálculo do progresso (evita divisão por zero ou NaN)
  const progressPercent = maxRange > 0 ? (pointIndex / maxRange) * 100 : 0;

  return (
    <div className={styles.shell_container}>
      <div className={styles.shell_superior}>
        <div className={styles.label_group1} style={{ textAlign: 'center' }}>
          <div className={styles.label_title}>PROFICIÊNCIA</div>
        </div>
        <input 
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={applyValue}
          className={styles.label_input}
          style={{ borderBottom: `2px solid ${chartColor}`}}
        />
      </div>

      <div className={styles.shell_inferior}>
        <div className={styles.slider_wrapper}>
          <input 
            type="range" 
            className={styles.custom_slider}
            style={{
              background: `linear-gradient(to right, ${chartColor} ${progressPercent}%, ${gridColor} ${progressPercent}%)`
            }}
            min="0"
            // 3. AQUI ESTAVA O ERRO: Agora usamos a variável blindada
            max={maxRange} 
            value={pointIndex || 0}
            onChange={(e) => setPointIndex(Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}
