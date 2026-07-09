"use client";

import { ComponentProps, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { CropArea } from "../../types/questoes_types";
import { useYearData } from "../../context/year_context";

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
  const { isLoaded, setIsLoaded } = useYearData();

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
      <Document file={fileUrl} loading={"Carregando..."}>
        {crops.map((crop, index) => {
          const { offsetX, offsetY } = crop;
          const larguraIndividual = isLoaded
            ? larguraBase - crop.offsetX - crop.cropWidth
            : 300;

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
                height: `${crop.cropHeight}px`,
                // border: "1px solid #e5e7eb",
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
                  transform: `translate(${-offsetX}px, ${-offsetY}px)`,
                  visibility: isLoaded ? "visible" : "hidden",
                }}
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  onRenderSuccess={handlePageLoad}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </div>
            </div>
          );
        })}
      </Document>
    </div>
  );
}
