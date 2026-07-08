"use client";

import { ComponentProps, useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { CropArea } from "../../types/questoes_types";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface PdfThumbnailProps {
  fileUrl: string;
  pageNumber: number;
  scale: number;
  crops: CropArea[];
  direction?: "row" | "column";
}

type PageLoadSuccessParams = Parameters<
  Required<ComponentProps<typeof Page>>["onLoadSuccess"]
>[0];

const pdfCache: Record<string, string> = {};

export default function PdfThumbnail({
  fileUrl,
  pageNumber,
  scale,
  crops,
  direction,
}: PdfThumbnailProps) {
  const [larguraBase, setLarguraBase] = useState<number>(300);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const [localBlobUrl, setLocalBlobUrl] = useState<string | null>(
    () => pdfCache[fileUrl] || null,
  );

  const [isDownloading, setIsDownloading] = useState<boolean>(
    () => !pdfCache[fileUrl],
  );

  const [downloadError, setDownloadError] = useState<boolean>(false);

  useEffect(() => {
    if (pdfCache[fileUrl]) {
      return;
    }

    let isMounted = true;

    async function downloadPdf() {
      try {
        setIsDownloading(true);
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error("Erro ao buscar o arquivo");
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        pdfCache[fileUrl] = blobUrl;
        if (isMounted) {
          setLocalBlobUrl(blobUrl);
          setIsDownloading(false);
        }
      } catch (err) {
        console.error("Erro no download do PDF:", err);
        if (isMounted) {
          setDownloadError(true);
          setIsDownloading(false);
        }
      }
    }

    downloadPdf();

    return () => {
      isMounted = false;
    };
  }, [fileUrl]);

  function handlePageLoad(page: PageLoadSuccessParams) {
    setLarguraBase(page.width);
    setIsLoaded(true);
  }

  if (downloadError) {
    return (
      <div style={{ color: "#ef4444", padding: "10px", fontSize: "14px" }}>
        ❌ Falha ao carregar o arquivo. Verifique sua conexão.
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "right",
        flexDirection: direction,
        gap: "5px",
        width: `100%`,
        overflow: "auto",
      }}
    >
      {isDownloading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f3f4f6",
            color: "#374151",
            fontWeight: "bold",
            fontSize: "14px",
            padding: "20px",
            width: "300px",
            height: "400px",
            borderRadius: "8px",
            border: "2px dashed #d1d5db",
          }}
        >
          ⏳ Baixando PDF (uma única vez)...
        </div>
      )}

      {localBlobUrl && (
        <Document
          file={localBlobUrl}
          loading={
            <div style={{ height: "400px", width: "300px", color: "#0000" }}>
              Processando documento...
            </div>
          }
        >
          {crops.map((crop, index) => {
            const { offsetX, offsetY } = crop;
            const larguraIndividual = isLoaded
              ? `${larguraBase - crop.offsetX - crop.cropWidth}px`
              : "max-content";

            return (
              <div
                key={index}
                style={{
                  position: "relative",
                  width: larguraIndividual,
                  flexShrink: 0,
                  overflowY: "hidden",
                  overflowX: "hidden",
                  height: `${crop.cropHeight}px`,
                  borderRadius: "8px",
                  backgroundColor: "#f9fafb",
                }}
              >
                {!isLoaded && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f9fafb",
                      color: "#6b7280",
                      fontSize: "13px",
                      zIndex: 10,
                      height: "100%",
                      padding: "0 20px",
                    }}
                  >
                    Recortando questão...
                  </div>
                )}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    transform: `translate(${-offsetX}px, ${-offsetY}px)`,
                    visibility: isLoaded ? "visible" : "hidden",
                  }}
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    onLoadSuccess={handlePageLoad}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </div>
              </div>
            );
          })}
        </Document>
      )}
    </div>
  );
}
