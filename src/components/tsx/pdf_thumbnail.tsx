"use client";

import { ComponentProps, useState } from "react";
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

export default function PdfThumbnail({
  fileUrl,
  pageNumber,
  scale,
  crops,
  direction = "row",
}: PdfThumbnailProps) {
  const [larguraBase, setLarguraBase] = useState(300);
  const [documentLoaded, setDocumentLoaded] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [error, setError] = useState(false);

  function handlePageLoad(page: PageLoadSuccessParams) {
    setLarguraBase(page.width);
    setPageLoaded(true);
  }

  const loading = !documentLoaded || !pageLoaded;

  if (error) {
    return (
      <div
        style={{
          color: "#ef4444",
          padding: 12,
          fontSize: 14,
        }}
      >
        ❌ Falha ao carregar o PDF.
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: direction,
        gap: 5,
        width: "100%",
        overflow: "auto",
      }}
    >
      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.92)",
            borderRadius: 8,
            minHeight: 250,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                border: "4px solid #e5e7eb",
                borderTop: "4px solid #2563eb",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />

            <div
              style={{
                color: "#374151",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Carregando questão...
            </div>

            <div
              style={{
                color: "#6b7280",
                fontSize: 12,
              }}
            >
              Isso pode levar alguns segundos no celular.
            </div>
          </div>
        </div>
      )}

      <Document
        file={fileUrl}
        onLoadSuccess={() => setDocumentLoaded(true)}
        onLoadError={() => setError(true)}
        loading={null}
        error={null}
      >
        {crops.map((crop, index) => {
          const { offsetX, offsetY } = crop;
          const larguraIndividual = pageLoaded
            ? larguraBase - crop.offsetX - crop.cropWidth
            : larguraBase;

          return (
            <div
              key={index}
              style={{
                position: "relative",
                width: larguraIndividual,
                height: crop.cropHeight,
                overflow: "hidden",
                flexShrink: 0,
                borderRadius: 8,
                background: "#f3f4f6",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  transform: `translate(-${offsetX}px, -${offsetY}px)`,
                  visibility: pageLoaded ? "visible" : "hidden",
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

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
