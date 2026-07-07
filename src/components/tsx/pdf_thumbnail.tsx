"use client";

import { ComponentProps, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface PdfThumbnailProps {
  fileUrl: string;
  pageNumber: number;
  cropHeight: number;
  cropWidth: number;
  offsetX: number;
  offsetY: number;
  scale: number;
}

type PageLoadSuccessParams = Parameters<
  Required<ComponentProps<typeof Page>>["onLoadSuccess"]
>[0];

export default function PdfThumbnail({
  fileUrl,
  pageNumber,
  cropHeight,
  cropWidth,
  offsetX,
  offsetY,
  scale,
}: PdfThumbnailProps) {
  const [larguraReal, setLarguraReal] = useState<number>(450);

  function handlePageLoad(page: PageLoadSuccessParams) {
    const larguraComScale = page.width;
    setLarguraReal(larguraComScale - offsetX - cropWidth);
  }

  return (
    <div
      style={{
        display: "flex",
        width: `100%`,
        overflow: "auto",
      }}
    >
      <div
        style={{
          position: "relative",
          width: `${larguraReal}px`,
          flexShrink: 0,
          overflowY: "hidden",
          overflowX: "hidden",
          height: `${cropHeight}px`,
          border: "1px solid #e5e7eb",
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
          <Document
            file={fileUrl}
            loading={
              <p style={{ padding: "16px", color: "#6b7280" }}>Carregando...</p>
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
    </div>
  );
}
