"use client";

import { useEffect, useRef, useState } from "react";
import PdfThumbnail from "./pdf_thumbnail";
import { CropArea } from "../../types/questoes_types";
import { useYearData } from "../../context/year_context";
import { useChartTheme } from "../../hooks/use_chart_theme";
import ChevronLeft from "../svg/chevron_left";
import ChevronRight from "../svg/chevron_right";
import Close from "../svg/close";
import styles from "./components.module.css";
import { ItemDetails } from "../../types/year_types";

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

const areaMap: Record<string, string> = {
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
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailContentRef = useRef<HTMLDivElement>(null);
  const [modalWidth, setModalWidth] = useState<number | null>(null);

  const {
    habilidades,
    competencias,
    showGabarito,
    getItemDetails,
    setShowGabarito,
    setQuestaoPopUp,
    listCode,
  } = useYearData();

  const { colorMap } = useChartTheme();
  const [itemDetails, setItemDetails] = useState<ItemDetails | null>(null);
  const habInfo = itemDetails ? habilidades[itemDetails.CO_HABILIDADE] : null;
  const compInfo = habInfo ? competencias[habInfo.comp] : null;

  useEffect(() => {
    let cancelled = false;
    getItemDetails(code).then((details) => {
      if (!cancelled) {
        setItemDetails(details);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [code, getItemDetails]);

  const currentIndex = listCode ? listCode.indexOf(code) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext =
    listCode && currentIndex >= 0 && currentIndex < listCode.length - 1;

  const handlePrev = () => {
    if (!hasPrev) return;
    setIsLoaded(false);
    setQuestaoPopUp(listCode[currentIndex - 1]);
    setShowGabarito(false);
  };

  const handleNext = () => {
    if (!hasNext) return;
    setIsLoaded(false);
    setQuestaoPopUp(listCode[currentIndex + 1]);
    setShowGabarito(false);
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
      document.body.style.overflow = "hidden";
    } else {
      if (dialog.open) {
        dialog.close();
      }
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" && hasPrev) {
        event.preventDefault();
        setQuestaoPopUp(listCode[currentIndex - 1]);
        setShowGabarito(false);
      }
      if (event.key === "ArrowRight" && hasNext) {
        event.preventDefault();
        setIsLoaded(false);
        setQuestaoPopUp(listCode[currentIndex + 1]);
        setShowGabarito(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    isOpen,
    hasPrev,
    hasNext,
    currentIndex,
    listCode,
    setIsLoaded,
    setQuestaoPopUp,
    setShowGabarito,
  ]);

  useEffect(() => {
    const content = thumbnailContentRef.current;
    if (!content || !isOpen) return;
    const updateWidth = () => {
      const width = content.scrollWidth;
      if (width > 0) {
        setModalWidth(width);
      }
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(content);
    return () => {
      observer.disconnect();
    };
  }, [isOpen, fileUrl, code, scale, direction, crops]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      style={{
        padding: 0,
        margin: "auto",
        borderRadius: "16px",
        border: "1px solid #ffffff",
        backgroundColor: "#ffffff",
        width: `${modalWidth + 5}px`,
        maxWidth: "calc(100vw - 30px)",
        height: "90vh",
        maxHeight: "90vh",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          minWidth: 0,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            flex: "0 0 auto",
            width: "100%",
            padding: "14px",
            paddingBottom: "0",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              minWidth: 0,
            }}
          >
            <h3
              style={{
                margin: 0,
                fontWeight: "bold",
                color: "#1f2937",
                fontSize: "18px",
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {tituloQuestao || `Questão ${itemDetails?.CO_POSICAO ?? ""}`}
            </h3>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexShrink: 0,
                marginLeft: "12px",
              }}
            >
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
            </div>
          </div>
          <div
            style={{
              paddingTop: "10px",
              paddingBottom: "16px",
            }}
          >
            {itemDetails && (
              <div
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                }}
              >
                Área: {areaMap[itemDetails.SG_AREA] || itemDetails.SG_AREA} |
                Prova:{" "}
                <span
                  style={{
                    color: itemDetails.TX_COR
                      ? colorMap?.[itemDetails.TX_COR]
                      : undefined,
                  }}
                >
                  {itemDetails.TX_COR?.toLocaleLowerCase()}
                </span>
              </div>
            )}
          </div>

          <div
            style={{
              borderBottom: "1px solid #e5e7eb",
              paddingBottom: itemDetails?.IN_ITEM_ABAN === 1 ? "16px" : "0px",
            }}
          >
            {itemDetails?.IN_ITEM_ABAN === 1 ? "(anulada)" : ""}
          </div>
        </div>
        <div
          ref={thumbnailContainerRef}
          style={{
            flex: "1 1 auto",
            width: "100%",
            minWidth: 0,
            minHeight: 0,
            overflow: "auto",
          }}
        >
          <div
            ref={thumbnailContentRef}
            style={{
              justifyContent: "center",
              width: "max-content",
              minWidth: "max-content",
              padding: "14px",
              boxSizing: "border-box",
            }}
          >
            <PdfThumbnail
              fileUrl={fileUrl}
              crops={crops}
              direction={direction}
              scale={scale}
              isLoaded={isLoaded}
              setIsLoaded={setIsLoaded}
            />
          </div>
        </div>
        {isLoaded && itemDetails && (
          <div
            style={{
              flex: "0 0 auto",
              width: "100%",
              borderTop: "1px solid #e5e7eb",
              padding: "0 14px 14px",
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                color: "#6b7280",
              }}
            >
              <div style={{ marginTop: "8px" }}>
                <strong>Gabarito: </strong>
                <button
                  onClick={() => setShowGabarito(!showGabarito)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "36px",
                    padding: "0 12px",
                    marginTop: "5px",
                    marginBottom: "10px",
                    borderRadius: "6px",
                    border: showGabarito
                      ? "1px solid #6ee7b7"
                      : "1px solid #cdcccb",
                    backgroundColor: showGabarito ? "#d1fae5" : "#ffffff",
                    color: showGabarito ? "#065f46" : "#374151",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: "pointer",
                    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                    transition: "all 0.15s ease-in-out",
                  }}
                >
                  {showGabarito ? itemDetails.TX_GABARITO : "Ver"}
                </button>
              </div>

              {compInfo && (
                <div
                  style={{
                    marginBottom: "10px",
                  }}
                >
                  <strong>Competência: </strong>
                  {compInfo[0]}
                </div>
              )}

              {habInfo && (
                <div>
                  <strong>Habilidade: </strong>
                  {habInfo.plain[0]}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
}
