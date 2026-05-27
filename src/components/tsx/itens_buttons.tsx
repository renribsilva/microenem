"use client";

import { useRef, useState } from "react";
import styles from "./components.module.css";
import { useChartTheme } from "../../hooks/use_chart_theme";
import { useHomeData } from "../../context/home_context";
import { useYearData } from "../../context/year_context";
import Dropdown from "./dropdown";

type onButtonClickType = (
  num: number,
  e: React.MouseEvent<HTMLButtonElement>,
) => void;

interface BackdropAlertType {
  num: number;
  x: number;
  y: number;
  limitLeft: number;
  limitRight: number;
}

const ranges: Record<string, { start: number; end: number }> = {
  LC: { start: 1, end: 45 },
  CH: { start: 46, end: 90 },
  CN: { start: 91, end: 135 },
  MT: { start: 136, end: 180 },
};

export default function ItensButtons() {
  const { chartProps, deferredArea, selectedLabel } = useHomeData();
  const { abandonadosCodes, selectedItems, handleToggle, getCodeByLabel } =
    useYearData();
  const { panelColor, textColor, gridColor, isDark } = useChartTheme();
  const { chartColor } = chartProps;
  const [backdropAlert, setBackdropAlert] = useState<BackdropAlertType | null>(
    null,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const { start, end } = ranges[deferredArea] || { start: 1, end: 45 };
  const questions = Array.from(
    { length: end - start + 1 },
    (_, i) => start + i,
  );

  const bd1 = backdropAlert.limitLeft;
  const bd2 = backdropAlert.x;
  const bd3 = backdropAlert.limitRight;

  const onButtonClick: onButtonClickType = (num, e) => {
    const codeItem = getCodeByLabel(num, selectedLabel);
    if (!codeItem) return;
    const isAbandoned = abandonadosCodes.has(codeItem);
    if (isAbandoned) {
      const rect = e.currentTarget.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      setBackdropAlert({
        num,
        x: rect.left + rect.width / 2,
        y: rect.top,
        limitLeft: (containerRect?.left || 0) + 95,
        limitRight: (containerRect?.right || window.innerWidth) - 95,
      });
    } else {
      setBackdropAlert(null);
    }
    handleToggle(num, isAbandoned);
  };

  return (
    <section>
      <Dropdown />
      <div ref={containerRef} className={styles.itens_container}>
        {questions.map((num) => {
          const thisCodeItem = getCodeByLabel(num, selectedLabel);
          const status = thisCodeItem
            ? selectedItems[thisCodeItem]?.status
            : null;
          const isAbandoned = thisCodeItem
            ? abandonadosCodes.has(thisCodeItem)
            : false;

          const getStyles = () => {
            // Se for abandonado e estiver selecionado: Cor Neutra (Cinza)
            if (isAbandoned && status) {
              return {
                bg: isDark ? "#4a4a4a" : "#94a3b8",
                text: "#fff",
                border: "transparent",
              };
            }
            // Cores normais
            if (status === "acerto")
              return { bg: "#22c55e", text: "#fff", border: "transparent" };
            if (status === "erro")
              return { bg: "#ef4444", text: "#fff", border: "transparent" };

            // Estado Inativo
            return {
              bg: panelColor,
              text: textColor,
              border: chartColor + "85",
            };
          };

          const s = getStyles();

          return (
            <button
              key={num}
              onClick={(e) => onButtonClick(num, e)}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = "brightness(1.2)";
                if (!status) {
                  e.currentTarget.style.backgroundColor = isDark
                    ? gridColor
                    : gridColor;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = "none";
                e.currentTarget.style.backgroundColor = s.bg;
              }}
              className={styles.itens_buttons}
              style={{
                border: `2px solid ${s.border}`,
                backgroundColor: s.bg,
                color: s.text,
                opacity: isAbandoned && !status ? 0.6 : 1,
              }}
            >
              {num}
              {isAbandoned && (
                <span className={styles.itens_buttons_aban}>⚠️</span>
              )}
            </button>
          );
        })}
      </div>
      <div className={styles.itens_rodape}>
        <strong>Dica:</strong>
        <br></br>
        <span>1º clique (verde): indica acerto</span>
        <br></br>
        <span>2º clique (vermelho): indica erro</span>
        <br></br>
        <span>3º clique (sem cor): indica item em branco</span>
      </div>
      {backdropAlert && (
        <>
          <div
            className={`${styles.backdrop} ${styles.backdrop_active}`}
            onClick={() => setBackdropAlert(null)}
          />
          <div
            className={styles.backdrop_msg}
            style={{
              left: `clamp(${bd1}px, ${bd2}px, ${bd3}px)`,
              top: backdropAlert.y - 10,
              transform: "translate(-50%, -100%)",
            }}
          >
            <strong>Item {backdropAlert.num} abandonado.</strong>
            <p style={{ margin: 0, fontSize: "0.7rem", opacity: 0.9 }}>
              Não teve participação no <br /> cálculo da nota final.
            </p>
            {/* SETINHA */}
            <div className={styles.backdrop_msg_arrow} />
          </div>
        </>
      )}
    </section>
  );
}
