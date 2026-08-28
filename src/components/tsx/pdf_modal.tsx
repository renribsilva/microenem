"use client";

import { useEffect, useRef } from "react";
import PdfThumbnail from "./pdf_thumbnail";
import { CropArea } from "../../types/questoes_types";
import { useYearData } from "../../context/year_context";
import { useChartTheme } from "../../hooks/use_chart_theme";
import LoadingFallback from "./loading_fallback";

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
  onNext?: () => void;
  onPrev?: () => void;
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
  const { getItemDetails } = useYearData();
  const itemDetails = getItemDetails(code);
  const { colorMap } = useChartTheme();

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
            </h3>{" "}
            <button
              onClick={onClose}
              style={{
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "6px",
                marginBottom: "10px",
                marginTop: "5px",
                border: "1px solid #d1d5db",
                backgroundColor: "#f3f4f6",
                color: "#090d0e",
              }}
            >
              Fechar
            </button>
          </div>
          <div
            style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "16px" }}
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
