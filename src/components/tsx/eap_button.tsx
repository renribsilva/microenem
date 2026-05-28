import { useHomeData } from "../../context/home_context";
import { useYearData } from "../../context/year_context";

function EAPButton() {
  const {
    isFetchingEAP,
    selectedItems,
    needUpdateEAP,
    intervalData,
    isInitialRender,
    setIsInitialRender,
    setNeedUpdateEAP,
    setIsFetchingEAP,
    setSampleEAP,
  } = useYearData();
  const { chartProps } = useHomeData();
  const { chartColor } = chartProps;

  const handleUpdateChart = () => {
    if (Object.entries(selectedItems).length === 0 || !needUpdateEAP) return;
    setIsFetchingEAP(true);
    setSampleEAP(intervalData);
    setIsInitialRender(false);
    setNeedUpdateEAP(false);
  };

  return (
    <button
      onClick={handleUpdateChart}
      disabled={isFetchingEAP}
      style={{
        padding: "12px 28px",
        backgroundColor: isFetchingEAP ? "#e2e8f0" : chartColor,
        color: isFetchingEAP ? "#94a3b8" : "white",
        border: "none",
        borderRadius: "12px",
        cursor: isFetchingEAP ? "not-allowed" : "pointer",
        fontWeight: "700",
        fontSize: "14px",
        boxShadow: isFetchingEAP
          ? "none"
          : "0 10px 15px -3px rgba(79, 70, 229, 0.3)",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {isFetchingEAP
        ? "⏳ PROCESSANDO..."
        : needUpdateEAP && !isInitialRender
          ? "🚀 RECALCULAR DESEMPENHO TRI"
          : "🚀 CALCULAR DESEMPENHO TRI"}
    </button>
  );
}

export default EAPButton;
