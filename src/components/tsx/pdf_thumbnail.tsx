"use client";

import { ComponentProps, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { CropArea } from "../../types/questões_types";

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
  direction,
}: PdfThumbnailProps) {
  const [larguraBase, setLarguraBase] = useState<number>(300);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  function handlePageLoad(page: PageLoadSuccessParams) {
    setLarguraBase(page.width);
    setIsLoaded(true);
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
      {crops.map((crop, index) => {
        const larguraIndividual = isLoaded
          ? larguraBase - crop.offsetX - crop.cropWidth
          : larguraBase;

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
            {!isLoaded && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f9fafb",
                  color: "#6b7280",
                  fontSize: "14px",
                  zIndex: 10,
                }}
              >
                Carregando...
              </div>
            )}
            <div
              style={{
                position: "absolute",
                transform: `translate(${-crop.offsetX}px, ${-crop.offsetY}px)`,
                visibility: isLoaded ? "visible" : "hidden",
              }}
            >
              <Document file={fileUrl} loading={null}>
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
