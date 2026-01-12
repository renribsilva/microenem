'use client'

import { useEffect, useState } from "react";
import styles from "./components.module.css"
import { useHomeData } from "../../context/home_context";

export default function InputShell() {

  const { chartLogic } = useHomeData();

  const { 
    activeDataset, 
    proficienciaAtual,
    xMax,
    xMin,
    pointIndex,
    setPointIndex,
    chartColor,
    resultadoAtual
  } = chartLogic

  const [inputValue, setInputValue] = useState(proficienciaAtual.toFixed(1));

  useEffect(() => {
    setInputValue(proficienciaAtual.toFixed(1));
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
      setInputValue(proficienciaAtual.toFixed(1));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      applyValue();
      (e.target as HTMLInputElement).blur();
    }
  };
  
  const handleInputChange = (e) => {
    let value = e.target.value.replace(',', '.');
    if (value.length > 6) return;
    const regex = /^\d{0,4}(\.\d{0,1})?$/;
    if (regex.test(value)) {
      setInputValue(value);
    }
  };

  return (
    <div className={styles.shell_container}>
      {/* Bloco Superior */}
      <div  className={styles.shell_superior}>
        {/* Bloco Nota */}
        <div className={styles.label_group1} style={{ textAlign: 'center' }}>
          <div className={styles.label_title}>PROFICIÊNCIA</div>
        </div>
        {/* Bloco Acertos */}
        <input 
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={applyValue}
          className={styles.label_input}
          style={{ borderBottom: `2px solid ${chartColor}`}}
        />
        {/* <div className={styles.label_group2}>
          <div className={styles.label_title}>ACERTOS</div>
          <div style={{ 
            fontSize: '1.3rem', width: '100%', justifyContent: "right", display: 'flex',
            fontWeight: '600', color: chartColor, height: '100%',
            alignItems: "flex-end", paddingBottom: '5px'
          }}>
            {resultadoAtual.toFixed(0)}
          </div>
        </div> */}
      </div>
      {/* Bloco Inferior */}
      <div  className={styles.shell_inferior}>
        {/* Slider */}
        <div className={styles.slider_wrapper}>
          <input 
            type="range" 
            className={styles.custom_slider}
            style={{background: chartColor}}
            min="0"
            max={activeDataset.data_teorico.length - 1} 
            value={pointIndex}
            onChange={(e) => setPointIndex(Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}