"use client";

import { ComponentProps, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface CropArea {
  cropHeight: number;
  cropWidth: number;
  offsetX: number;
  offsetY: number;
}

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
  const [larguraBase, setLarguraBase] = useState<number>(450);

  function handlePageLoad(page: PageLoadSuccessParams) {
    setLarguraBase(page.width);
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexDirection: direction,
        gap: "5px",
        width: `100%`,
        overflow: "auto",
      }}
    >
      {crops.map((crop, index) => {
        const larguraIndividual = larguraBase - crop.offsetX - crop.cropWidth;

        return (
          <div
            key={index}
            style={{
              position: "relative",
              width: `${larguraIndividual}px`,
              flexShrink: 0,
              overflowY: "hidden",
              overflowX: "hidden",
              height: `${crop.cropHeight}px`,
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              backgroundColor: "#f9fafb",
            }}
          >
            <div
              style={{
                position: "absolute",
                transform: `translate(${-crop.offsetX}px, ${-crop.offsetY}px)`,
              }}
            >
              <Document
                file={fileUrl}
                loading={
                  <p style={{ padding: "16px", color: "#6b7280" }}>
                    Carregando...
                  </p>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  onLoadSuccess={handlePageLoad}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
            </div>
          </div>
        );
      })}
    </div>
  );
}
