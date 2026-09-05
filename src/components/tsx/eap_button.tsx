"use client";

import { useHomeData } from "../../context/home_context";
import { useSidebar } from "../../context/sidebar_context";
import { useYearData } from "../../context/year_context";
import styles from "./components.module.css";

function EAPButton() {
  const {
    isFetchingEAP,
    needUpdateEAP,
    intervalData,
    isInitialRender,
    selectedItems,
    setIsInitialRender,
    setNeedUpdateEAP,
    setIsFetchingEAP,
    setSampleEAP,
    setEAPData,
  } = useYearData();
  const { chartProps } = useHomeData();
  const { isMobile } = useSidebar();
  const { chartColor } = chartProps;

  const isEmpty = Object.keys(selectedItems).length === 0;
  const isDisabled = isFetchingEAP || isEmpty;

  const handleUpdateChart = () => {
    if (!needUpdateEAP || isEmpty) return;
    setIsFetchingEAP(true);
    setSampleEAP(intervalData);
    setIsInitialRender(false);
    setNeedUpdateEAP(false);
    setEAPData(null);
    const topo = document.getElementById("topo-pagina");
    if (topo && isMobile) {
      topo.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <button
      onClick={handleUpdateChart}
      disabled={isDisabled}
      style={{
        padding: "12px 28px",
        width: "100%",
        backgroundColor: isDisabled ? "#e2e8f0" : chartColor,
        color: isDisabled ? "#94a3b8" : "white",
        border: "none",
        borderRadius: "12px",
        cursor: isDisabled ? "not-allowed" : "pointer",
        fontWeight: "700",
        fontSize: "14px",
        boxShadow: isDisabled
          ? "none"
          : "0 10px 15px -3px rgba(79, 70, 229, 0.3)",
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {isFetchingEAP ? (
        <span className={styles.dots}>PROCESSANDO</span>
      ) : isEmpty ? (
        "🔒 SELECIONE OS ITENS"
      ) : !needUpdateEAP && !isInitialRender ? (
        "✨ (DES)MARQUE NOVOS ITENS"
      ) : needUpdateEAP && !isInitialRender ? (
        "🚀 RECALCULAR DESEMPENHO TRI"
      ) : (
        "🚀 CALCULAR DESEMPENHO TRI"
      )}{" "}
    </button>
  );
}

export default EAPButton;
