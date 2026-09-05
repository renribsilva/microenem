import { useState } from "react";
import styles from "./components.module.css";
import { useHomeData } from "../../context/home_context";
import { useChartTheme } from "../../hooks/use_chart_theme";

function InputShell() {
  const { chartProps, activeTCC, pointIndexStuff } = useHomeData();
  const { proficienciaAtual, xMax, xMin, chartColor } = chartProps;
  const { gridColor } = useChartTheme();

  // --- Sincronização de Estado ---
  const [inputValue, setInputValue] = useState<string>(
    proficienciaAtual?.toFixed(0) || "0",
  );

  const [prevProficiencia, setPrevProficiencia] = useState(proficienciaAtual);

  // Se a proficiência mudou externamente (clique no gráfico), atualiza o input
  if (proficienciaAtual !== prevProficiencia) {
    setPrevProficiencia(proficienciaAtual);
    setInputValue(proficienciaAtual?.toFixed(0) || "0");
  }

  const maxRange = activeTCC?.data_teorico?.length
    ? activeTCC.data_teorico.length - 1
    : 0;

  const applyValue = () => {
    let numericVal = parseFloat(inputValue);

    if (!isNaN(numericVal) && activeTCC?.labels_x) {
      // Clamping de valores dentro do range permitido
      if (numericVal < xMin) numericVal = xMin;
      if (numericVal > xMax) numericVal = xMax;

      setInputValue(numericVal.toFixed(0));

      const closestIndex = activeTCC.labels_x.reduce(
        (prev: number, curr: number, idx: number) => {
          return Math.abs(curr - numericVal) <
            Math.abs(activeTCC.labels_x[prev] - numericVal)
            ? idx
            : prev;
        },
        0,
      );
      pointIndexStuff.setPointIndex(closestIndex);
    } else {
      setInputValue(proficienciaAtual.toFixed(1));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      applyValue();
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(",", ".");
    if (value.length > 6) return;

    const regex = /^\d{0,4}(\.\d{0,1})?$/;
    if (regex.test(value)) {
      setInputValue(value);
    }
  };

  const progressPercent =
    maxRange > 0 ? (pointIndexStuff.pointIndex / maxRange) * 100 : 0;

  return (
    <div className={styles.shell_container}>
      <div className={styles.shell_superior}>
        <div className={styles.label_group1} style={{ textAlign: "center" }}>
          <div className={styles.label_title}>PROFICIÊNCIA</div>
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={applyValue}
          className={styles.label_input}
          style={{ borderBottom: `2px solid ${chartColor}` }}
        />
      </div>

      <div className={styles.shell_inferior}>
        <div className={styles.slider_wrapper}>
          <input
            type="range"
            className={styles.custom_slider}
            style={{
              background: `linear-gradient(
                to right, ${chartColor} ${progressPercent}%, 
                ${gridColor} ${progressPercent}%)`,
            }}
            min="0"
            max={maxRange}
            value={pointIndexStuff.pointIndex || 0}
            onChange={(e) =>
              pointIndexStuff.setPointIndex(Number(e.target.value))
            }
          />
        </div>
      </div>
    </div>
  );
}

export default InputShell;
