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
  const { isSemiMobile } = useSidebar();
  const { chartColor } = chartProps;

  const isEmpty = Object.keys(selectedItems ?? {}).length === 0;
  const isDisabled = Boolean(
    isFetchingEAP || isEmpty || (!needUpdateEAP && !isInitialRender),
  );

  const handleUpdateChart = () => {
    if (!needUpdateEAP || isEmpty) return;
    setIsFetchingEAP(true);
    setSampleEAP(intervalData);
    setIsInitialRender(false);
    setNeedUpdateEAP(false);
    setEAPData(null);
    const topo = document.getElementById("topo-pagina");
    if (topo && isSemiMobile) {
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
      className={styles.btn_chart}
      style={{
        backgroundColor: isDisabled ? undefined : chartColor,
      }}
    >
      {" "}
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
