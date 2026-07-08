"use client";

import { useState } from "react";
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

const PdfSkeleton = () => (
  <div
    style={{
      width: "100%",
      minWidth: "300px",
      minHeight: "400px",
      borderRadius: "12px",
      backgroundColor: "#f3f4f6",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#9ca3af",
      fontSize: "15px",
      fontWeight: 500,
      animation: "pulse 1.5s infinite ease-in-out",
    }}
  >
    Carregando PDF...
    <style>{`
      @keyframes pulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }
    `}</style>
  </div>
);

export default function PdfThumbnail({
  fileUrl,
  pageNumber,
  scale,
  crops,
  direction = "row",
}: PdfThumbnailProps) {
  const [pageSize, setPageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  return (
    <Document file={fileUrl} loading={<PdfSkeleton />}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          flexDirection: direction,
          // border: "1px solid #888888",
          gap: "5px",
          width: "100%",
          overflow: "auto",
        }}
      >
        {crops.map((crop, index) => {
          const { offsetX, offsetY } = crop;
          const larguraBase = pageSize ? pageSize.width : 300;
          const larguraIndividual = pageSize
            ? larguraBase - crop.offsetX - crop.cropWidth
            : 300;

          return (
            <div
              key={index}
              style={{
                position: "relative",
                width: `${larguraIndividual}px`,
                height: `${crop.cropHeight}px`,
                flexShrink: 0,
                overflow: "hidden",
                borderRadius: "8px",
                backgroundColor: "#f9fafb",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  transform: `translate(${-offsetX}px, ${-offsetY}px)`,
                }}
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  onLoadSuccess={(page) => {
                    if (!pageSize) {
                      setPageSize({ width: page.width, height: page.height });
                    }
                  }}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Document>
  );
}
