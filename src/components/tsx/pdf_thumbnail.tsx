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
  scale: number;
  crops: CropArea[];
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
  direction,
  isLoaded,
  setIsLoaded,
}: PdfThumbnailProps) {
  const [larguraBase, setLarguraBase] = useState<number>(300);

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
        display: "flex",
        alignItems: "right",
        flexDirection: direction,
        gap: "10px",
        width: `100%`,
        overflow: "auto",
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
            backgroundColor: "#fdfdfd",
            color: "#8c8c8c",
            fontSize: "14px",
            zIndex: 10,
          }}
        >
          Carregando...
        </div>
      )}
      <Document file={fileUrl} loading={null}>
        {crops.map((crop, index) => {
          const { offsetX, offsetY, cropWidth, cropHeight, pagina } = crop;
          const larguraIndividual = isLoaded
            ? larguraBase - offsetX - cropWidth
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
                height: `${cropHeight}px`,
                // border: "1px solid #e5e7eb",
                borderRadius: "8px",
                backgroundColor: "#fdfdfd",
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
      </Document>
    </div>
  );
}
