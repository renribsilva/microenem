"use client";

import { useEffect, useRef } from "react";
import PdfThumbnail from "./pdf_thumbnail";
import { CropArea } from "../../types/questoes_types";
import { useYearData } from "../../context/year_context";
import { useChartTheme } from "../../hooks/use_chart_theme";
import LoadingFallback from "./loading_fallback";
import ChevronLeft from "../svg/chevron_left";
import ChevronRight from "../svg/chevron_right";
import Close from "../svg/close";
import styles from "./components.module.css";

interface PdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  code: number;
  crops: CropArea[];
  direction: "row" | "column" | null;
  scale: number;
  tituloQuestao?: string;
  isLoaded: boolean;
  setIsLoaded: (x: boolean) => void;
}

const areaMap = {
  LC: "Linguagens",
  CH: "Ciências Humanas",
  CN: "Ciências da Natureza",
  MT: "Matemática",
};

export default function PdfModal({
  isOpen,
  onClose,
  fileUrl,
  code,
  crops,
  direction,
  scale,
  tituloQuestao,
  isLoaded,
  setIsLoaded,
}: PdfModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { getItemDetails, setQuestaoPopUp, listCode } = useYearData();
  const itemDetails = getItemDetails(code);
  const { colorMap } = useChartTheme();

  const currentIndex = listCode ? listCode.indexOf(code) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext =
    listCode && currentIndex >= 0 && currentIndex < listCode.length - 1;

  const handlePrev = () => {
    if (hasPrev) {
      setIsLoaded(false);
      setQuestaoPopUp(listCode[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setIsLoaded(false);
      setQuestaoPopUp(listCode[currentIndex + 1]);
    }
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    } else {
      dialog.close();
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      style={{
        padding: "14px",
        borderRadius: "16px",
        backgroundColor: "#ffffff",
        border: "1px solid #ffffff",
        width: `calc(100% - 90px)`,
        maxWidth: `max-content`,
        height: `max-content`,
        minHeight: "400px",
        minWidth: "300px",
      }}
    >
      {!isLoaded && (
        <div
          style={{ display: "flex", justifyContent: "center", padding: "20px" }}
        >
          <LoadingFallback />
        </div>
      )}
      <div
        style={{
          display: isLoaded ? "flex" : "none",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontWeight: "bold",
                color: "#1f2937",
                fontSize: "18px",
              }}
            >
              {tituloQuestao ||
                `Questão ${itemDetails?.CO_POSICAO} ${
                  itemDetails?.IN_ITEM_ABAN === 1 ? "(anulada)" : ""
                }`}
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                onClick={handlePrev}
                disabled={!hasPrev}
                className={styles.button_pdf}
                aria-label="Anterior"
              >
                <ChevronLeft />
              </button>

              <button
                onClick={handleNext}
                disabled={!hasNext}
                className={styles.button_pdf}
                aria-label="Próximo"
              >
                <ChevronRight />
              </button>

              <button
                onClick={onClose}
                className={styles.button_pdf}
                aria-label="Fechar"
              >
                <Close />
              </button>
            </div>{" "}
          </div>
          <div
            style={{
              borderBottom: "1px solid #e5e7eb",
              paddingBottom: "16px",
              paddingTop: "10px",
            }}
          >
            {itemDetails && (
              <div style={{ fontSize: "12px", color: "#6b7280" }}>
                Área: {areaMap[itemDetails.SG_AREA]} | Prova:{" "}
                <span style={{ color: `${colorMap[itemDetails.TX_COR]}` }}>
                  {itemDetails.TX_COR.toLocaleLowerCase()}
                </span>
              </div>
            )}
          </div>
        </div>
        <div
          style={{
            width: "100%",
            justifyContent: "center",
          }}
        >
          <PdfThumbnail
            fileUrl={fileUrl}
            crops={crops}
            code={code}
            direction={direction}
            scale={scale}
            isLoaded={isLoaded}
            setIsLoaded={setIsLoaded}
          />
        </div>
      </div>
    </dialog>
  );
}
