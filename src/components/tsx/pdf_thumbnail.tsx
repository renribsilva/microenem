"use client";

import { ComponentProps, useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { CropArea } from "../../types/questoes_types";
import { useYearData } from "../../context/year_context";
import LoadingFallback from "./loading_fallback";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

console.log(pdfjs.GlobalWorkerOptions);

interface PdfThumbnailProps {
  fileUrl: string;
  scale: number;
  crops: CropArea[];
  code: number;
  direction?: "row" | "column";
  isLoaded: boolean;
  setIsLoaded: (x: boolean) => void;
}

type PageLoadSuccessParams = Parameters<
  Required<ComponentProps<typeof Page>>["onLoadSuccess"]
>[0];

export default function PdfThumbnail({
  fileUrl,
  scale,
  crops,
  code,
  direction,
  isLoaded,
  setIsLoaded,
}: PdfThumbnailProps) {
  const pdfOptions = useMemo(
    () => ({ wasmUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/wasm/` }),
    [],
  );
  const [larguraBase, setLarguraBase] = useState<number>(300);
  const {
    getItemDetails,
    habilidades,
    competencias,
    showGabarito,
    setShowGabarito,
  } = useYearData();
  const itemDetails = getItemDetails(code);
  const habInfo = itemDetails ? habilidades[itemDetails.CO_HABILIDADE] : null;
  const compInfo = habInfo ? competencias[habInfo.comp] : null;

  const larguras = crops.map((c) => larguraBase - c.offsetX - c.cropWidth);

  const larguraRodape =
    crops.length > 1 && direction === "column"
      ? larguras.reduce((acc, curr) => acc + curr, 0)
      : Math.max(...larguras, 300);

  function handlePageLoad(page: PageLoadSuccessParams) {
    setLarguraBase(page.width);
  }

  function handlePageRendered() {
    setIsLoaded(true);
  }

  return (
    <div
      style={{
        position: "relative",
        alignItems: "right",
        gap: "10px",
        width: `100%`,
        overflow: "auto",
        minHeight: !isLoaded ? "400px" : "auto",
      }}
    >
      {!isLoaded && <LoadingFallback />}
      {isLoaded && !itemDetails && (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "#6b7280",
            minHeight: "400px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Dados da questão não encontrados.
        </div>
      )}
      <div style={{ display: isLoaded && itemDetails ? "block" : "none" }}>
        <Document file={fileUrl} loading={null} options={pdfOptions}>
          <div style={{ display: direction === "column" ? "flex" : "block" }}>
            {crops.map((crop, index) => {
              const { offsetX, offsetY, cropWidth, cropHeight, pagina } = crop;
              const larguraIndividual = isLoaded
                ? larguraBase - offsetX - cropWidth
                : 300;
              const isDev = process.env.NODE_ENV === "development";
              return (
                <div
                  key={index}
                  style={{
                    position: "relative",
                    width: `${larguraIndividual}px`,
                    flexShrink: 0,
                    flex: "0 0 auto",
                    overflowY: "hidden",
                    overflowX: "hidden",
                    height: `${cropHeight}px`,
                    border: isDev ? "1px solid #e5e7eb" : "none",
                    borderRadius: "8px",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      transform: `translate(${-offsetX}px, ${-offsetY}px)`,
                    }}
                  >
                    <Page
                      key={String(isLoaded)}
                      pageNumber={pagina}
                      scale={scale}
                      onLoadSuccess={handlePageLoad}
                      onRenderSuccess={handlePageRendered}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div
            style={{
              borderTop: "1px solid #e5e7eb",
              marginTop: "12px",
              width: `${larguraRodape}px`,
            }}
          >
            {itemDetails && (
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
                  </button>{" "}
                </div>
                {compInfo && (
                  <div style={{ marginBottom: "10px" }}>
                    <strong>Competência: </strong>
                    {compInfo[0]}
                  </div>
                )}
                {habInfo && (
                  <div>
                    <strong>Habilidade: </strong>
                    {habInfo.plain[0]}
                  </div>
                )}{" "}
              </div>
            )}
          </div>
        </Document>
      </div>
    </div>
  );
}
