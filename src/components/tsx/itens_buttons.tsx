"use client";

import { useRef, useState } from "react";
import styles from "./components.module.css";
import { useChartTheme } from "../../hooks/use_chart_theme";
import { useHomeData } from "../../context/home_context";
import { useYearData } from "../../context/year_context";
import dynamic from "next/dynamic";

const EAPButton = dynamic(() => import("./eap_button"));
const DropdownBooks = dynamic(() => import("./dropdown_books"));

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

function ItensButtons() {
  const { pathName, chartProps } = useHomeData();
  const {
    abandonadosCodes,
    selectedItems,
    codesMap,
    handleToggle,
    setNeedUpdateEAP,
    setCurve,
  } = useYearData();
  const { panelColor, textColor, gridColor, isDark } = useChartTheme();
  const { chartColor } = chartProps;
  const [backdropAlert, setBackdropAlert] = useState<BackdropAlertType | null>(
    null,
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const questionKeys = Object.keys(codesMap).map(Number);
  const isLoaded = questionKeys.length > 0;
  const questions = isLoaded
    ? questionKeys.sort((a, b) => a - b)
    : Array.from({ length: 45 }, (_, i) => i + 1);

  const onButtonClick: onButtonClickType = (num, e) => {
    const codeItem = codesMap[num]?.code;
    if (!codeItem) return;

    const isAbandoned = abandonadosCodes.has(codeItem);
    const currentStatus = selectedItems[codeItem]?.status;

    // 1. Pinta a cor no DOM INSTANTANEAMENTE antes do React re-renderizar
    const btn = e.currentTarget;
    if (isAbandoned) {
      const nextBg = !currentStatus
        ? isDark
          ? "#4a4a4a"
          : "#94a3b8"
        : panelColor;
      const nextText = !currentStatus ? "#fff" : textColor;
      btn.style.backgroundColor = nextBg;
      btn.style.color = nextText; // <-- Garantido aqui
    } else {
      if (!currentStatus) {
        btn.style.backgroundColor = "#22c55e";
        btn.style.color = "#fff"; // <-- Garantido aqui
        btn.style.borderColor = "transparent";
      } else if (currentStatus === "acerto") {
        btn.style.backgroundColor = "#ef4444";
        btn.style.color = "#fff"; // <-- Garantido aqui
        btn.style.borderColor = "transparent";
      } else {
        btn.style.backgroundColor = panelColor;
        btn.style.color = textColor; // <-- Garantido aqui
        btn.style.borderColor = chartColor + "85";
      }
    }

    // 2. Alertas e atualizações pesadas de contexto ficam assíncronos
    if (isAbandoned) {
      const rect = btn.getBoundingClientRect();
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

    setTimeout(() => {
      setNeedUpdateEAP(true);
      handleToggle(num, isAbandoned);
    }, 0);
  };

  const areAllFilled = questions.every((num) => {
    const codeItem = codesMap[num]?.code;
    if (!codeItem) return true;
    const isAbandoned = abandonadosCodes.has(codeItem);
    if (isAbandoned) return true;
    return Boolean(selectedItems[codeItem]?.status);
  });

  const handleToggleAll = (e: React.MouseEvent<HTMLButtonElement>) => {
    const willFill = !areAllFilled;
    const fillBtn = e.currentTarget;
    const checkboxSpan = fillBtn.querySelector(`.${styles.fill_all_checkbox}`);
    const labelSpan = fillBtn.querySelector(`.${styles.fill_all_label}`);

    if (checkboxSpan) {
      if (willFill) {
        checkboxSpan.classList.add(styles.checked);
        checkboxSpan.textContent = "✓";
      } else {
        checkboxSpan.classList.remove(styles.checked);
        checkboxSpan.textContent = "";
      }
    }
    if (labelSpan) {
      labelSpan.textContent = willFill ? "Despreencher tudo" : "Preencher tudo";
    }

    if (containerRef.current) {
      const buttons = containerRef.current.querySelectorAll("button");
      const targetBg = willFill ? "#22c55e" : panelColor;
      const targetText = willFill ? "#fff" : textColor;
      const abandonedBg = isDark ? "#4a4a4a" : "#94a3b8";

      buttons.forEach((btn) => {
        const htmlBtn = btn as HTMLButtonElement;
        const isAbanBtn = htmlBtn.textContent?.includes("⚠️");

        htmlBtn.style.backgroundColor = willFill
          ? isAbanBtn
            ? abandonedBg
            : targetBg
          : panelColor;
        htmlBtn.style.color = targetText;
        htmlBtn.style.borderColor = willFill
          ? "transparent"
          : chartColor + "85";
      });
    }

    setTimeout(() => {
      setNeedUpdateEAP(true);
      setCurve(null);
      questions.forEach((num) => {
        const codeItem = codesMap[num]?.code;
        if (!codeItem) return;
        const currentStatus = selectedItems[codeItem]?.status;
        const isAbandoned = abandonadosCodes.has(codeItem);
        if (areAllFilled) {
          if (!currentStatus) return;
          if (isAbandoned) {
            handleToggle(num, true); // Despreenche o item abandonado
          } else if (currentStatus === "acerto") {
            handleToggle(num, false);
            handleToggle(num, false);
          } else if (currentStatus === "erro") {
            handleToggle(num, false);
          }
        } else {
          if (isAbandoned) {
            if (!currentStatus) handleToggle(num, true);
            return;
          }
          if (currentStatus === "erro") {
            handleToggle(num, false);
            handleToggle(num, false);
          } else if (!currentStatus) {
            handleToggle(num, false);
          }
        }
      });
    }, 0);
  };

  return (
    <section>
      <DropdownBooks />
      <div className={styles.EAPButton_container}>
        {pathName.endsWith("tri") && <EAPButton />}
      </div>
      <div ref={containerRef} className={styles.itens_container}>
        {questions.map((num) => {
          const thisCodeItem = codesMap[num]?.code;
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
              bg: panelColor ?? "transparent",
              text: textColor,
              border: chartColor ? chartColor + "85" : "transparent",
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
                  e.currentTarget.style.backgroundColor = gridColor;
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
              }}
            >
              {num}
              {isAbandoned && (
                <span className={styles.itens_buttons_aban}>⚠️</span>
              )}
            </button>
          );
        })}
      </div>{" "}
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
