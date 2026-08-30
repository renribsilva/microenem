"use client";

import { useRef, useState } from "react";
import styles from "./components.module.css";
import { useChartTheme } from "../../hooks/use_chart_theme";
import { useHomeData } from "../../context/home_context";
import { useYearData } from "../../context/year_context";
import EAPButton from "./eap_button";
import DropdownBooks from "./dropdown_books";

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

function ItensButtons() {
  const { pathName, chartProps, deferredArea, selectedLabel } = useHomeData();
  const {
    abandonadosCodes,
    selectedItems,
    handleToggle,
    getCodeByLabel,
    setNeedUpdateEAP,
  } = useYearData();
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
    setNeedUpdateEAP(true);
    handleToggle(num, isAbandoned);
  };

  // Verifica se TODAS as questões da área atual já estão marcadas
  const areAllFilled = questions.every((num) => {
    const codeItem = getCodeByLabel(num, selectedLabel);
    return codeItem ? Boolean(selectedItems[codeItem]?.status) : false;
  });

  // Alterna entre marcar tudo ou desmarcar tudo
  const handleToggleAll = () => {
    setNeedUpdateEAP(true);

    if (areAllFilled) {
      // DESMARCAR TUDO
      questions.forEach((num) => {
        const codeItem = getCodeByLabel(num, selectedLabel);
        if (!codeItem) return;

        const currentStatus = selectedItems[codeItem]?.status;
        const isAbandoned = abandonadosCodes.has(codeItem);

        if (currentStatus === "acerto") {
          handleToggle(num, isAbandoned);
          handleToggle(num, isAbandoned);
        } else if (currentStatus === "erro") {
          handleToggle(num, isAbandoned);
        }
      });
    } else {
      // PREENCHER TUDO
      questions.forEach((num) => {
        const codeItem = getCodeByLabel(num, selectedLabel);
        if (!codeItem) return;

        const currentStatus = selectedItems[codeItem]?.status;
        const isAbandoned = abandonadosCodes.has(codeItem);

        if (currentStatus === "erro") {
          handleToggle(num, isAbandoned);
          handleToggle(num, isAbandoned);
        } else if (!currentStatus) {
          handleToggle(num, isAbandoned);
        }
      });
    }
  };

  return (
    <section>
      <DropdownBooks />
      <div className={styles.EAPButton_container}>
        {pathName.endsWith("tri") && <EAPButton />}
      </div>
      {/* Grid de Botões das Questões */}
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
            if (isAbandoned && status) {
              return {
                bg: isDark ? "#4a4a4a" : "#94a3b8",
                text: "#fff",
                border: "transparent",
              };
            }
            if (status === "acerto")
              return { bg: "#22c55e", text: "#fff", border: "transparent" };
            if (status === "erro")
              return { bg: "#ef4444", text: "#fff", border: "transparent" };

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
                border: `1px solid ${s.border}`,
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

      <button
        type="button"
        className={styles.fill_all_btn}
        onClick={handleToggleAll}
      >
        <span
          className={`${styles.fill_all_checkbox} ${
            areAllFilled ? styles.checked : ""
          }`}
        >
          {areAllFilled && "✓"}
        </span>
        <span className={styles.fill_all_label}>
          {areAllFilled ? "Despreencher tudo" : "Preencher tudo"}
        </span>
      </button>

      <div className={styles.itens_rodape}>
        <strong>Dica:</strong>
        <br />
        <span>1º clique (verde): indica acerto</span>
        <br />
        <span>2º clique (vermelho): indica erro</span>
        <br />
        <span>3º clique (sem cor): indica item em branco</span>
      </div>
      {backdropAlert &&
        (() => {
          const bd1 = backdropAlert.limitLeft;
          const bd2 = backdropAlert.x;
          const bd3 = backdropAlert.limitRight;
          return (
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
                <div className={styles.backdrop_msg_arrow} />
              </div>
            </>
          );
        })()}
    </section>
  );
}

export default ItensButtons;
