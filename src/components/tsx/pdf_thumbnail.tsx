"use client";

import { ComponentProps, useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { CropArea } from "../../types/questoes_types";
import { ItemDetails } from "../../types/year_types";
import { useSidebar } from "../../context/sidebar_context";
import dynamic from "next/dynamic";

const LoadingFallback = dynamic(() => import("./loading_fallback"), {
  ssr: false,
});

interface PdfThumbnailProps {
  fileUrl: string;
  scale: number;
  crops: CropArea[];
  direction?: "row" | "column" | null;
  isLoaded: boolean;
  setIsLoaded: (x: boolean) => void;
  itemDetails: ItemDetails;
}

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const pdfCache = new Map<string, Promise<pdfjs.PDFDocumentProxy>>();

function getCachedPdf(url: string): Promise<pdfjs.PDFDocumentProxy> {
  let promise = pdfCache.get(url);

  if (!promise) {
    const loadingTask = pdfjs.getDocument({
      url,
      useWorkerFetch: true,
      isEvalSupported: true,
    });

    promise = loadingTask.promise;
    pdfCache.set(url, promise);

    promise.catch(() => {
      pdfCache.delete(url);
    });
  }

  return promise;
}

export function preloadPdf(url: string) {
  if (!url) return;
  getCachedPdf(url).catch(() => {});
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
  itemDetails,
}: PdfThumbnailProps) {
  const { isMobile } = useSidebar();

  // ---------------------------------------------------------------------------
  // ESTRATÉGIA MOBILE (Canvas Imperativo)
  // ---------------------------------------------------------------------------
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasesRef = useRef<HTMLCanvasElement[]>([]);

  useEffect(() => {
    if (!isMobile || !fileUrl || !crops.length) return;

    let cancelled = false;

    async function renderizarCrops() {
      setIsLoaded(false);

      try {
        const pdf = await getCachedPdf(fileUrl);
        if (cancelled) return;

        const pages = await Promise.all(
          crops.map((crop) => pdf.getPage(crop.pagina)),
        );
        if (cancelled) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 3);
        const quality = 2;

        const novosCanvases = await Promise.all(
          pages.map(async (page, index) => {
            const crop = crops[index];

            const visualViewport = page.getViewport({ scale });
            const renderViewport = page.getViewport({
              scale: scale * dpr * quality,
            });

            const largura = Math.max(
              1,
              visualViewport.width - crop.offsetX - crop.cropWidth,
            );
            const altura = Math.max(1, crop.cropHeight);

            const canvas = document.createElement("canvas");

            canvas.width = Math.ceil(largura * dpr * quality);
            canvas.height = Math.ceil(altura * dpr * quality);

            canvas.style.width = `${largura}px`;
            canvas.style.height = `${altura}px`;
            canvas.style.display = "block";

            const context = canvas.getContext("2d", { alpha: false });
            if (!context) {
              throw new Error("Não foi possível criar o contexto 2D.");
            }

            const renderTask = page.render({
              canvas,
              canvasContext: context,
              viewport: renderViewport,
              transform: [
                1,
                0,
                0,
                1,
                -crop.offsetX * dpr * quality,
                -crop.offsetY * dpr * quality,
              ],
            });

            await renderTask.promise;
            return canvas;
          }),
        );

        if (cancelled) return;

        const container = containerRef.current;
        if (!container) return;

        container.replaceChildren(...novosCanvases);
        canvasesRef.current = novosCanvases;
        setIsLoaded(true);
      } catch (error) {
        if (cancelled) return;
        console.error("Erro ao renderizar PDF no mobile:", error);
        setIsLoaded(true);
      }
    }

    renderizarCrops();

    return () => {
      cancelled = true;
      canvasesRef.current.forEach((canvas) => {
        canvas.width = 0;
        canvas.height = 0;
      });
      canvasesRef.current = [];
    };
  }, [isMobile, fileUrl, crops, scale, setIsLoaded]);

  // ---------------------------------------------------------------------------
  // ESTRATÉGIA DESKTOP (React-PDF Document/Page)
  // ---------------------------------------------------------------------------
  const pdfOptions = useMemo(
    () => ({ wasmUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/wasm/` }),
    [],
  );
  const [larguraBase, setLarguraBase] = useState<number>(300);

  function handlePageLoad(page: PageLoadSuccessParams) {
    setLarguraBase(page.width);
  }

  function handlePageRendered() {
    setIsLoaded(true);
  }

  // ---------------------------------------------------------------------------
  // RENDERIZAÇÃO CONDICIONAL (Mobile vs Desktop)
  // ---------------------------------------------------------------------------
  if (isMobile) {
    return (
      <div
        style={{
          position: "relative",
          width: "max-content",
          minWidth: "max-content",
          minHeight: !isLoaded ? "400px" : "auto",
          boxSizing: "border-box",
        }}
      >
        {!isLoaded && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "20px",
              minHeight: "400px",
              alignItems: "center",
            }}
          >
            <LoadingFallback />
          </div>
        )}

        <div
          ref={containerRef}
          style={{
            display: isLoaded
              ? direction === "column"
                ? "flex"
                : "block"
              : "none",
            flexDirection: direction === "column" ? "column" : undefined,
            alignItems: "flex-start",
            gap: "10px",
            width: "max-content",
            minWidth: "max-content",
            boxSizing: "border-box",
          }}
        />
      </div>
    );
  }

  // Renderização Desktop
  return (
    <div
      style={{
        position: "relative",
        alignItems: "center",
        gap: "10px",
        width: "100%",
        overflow: "auto",
        minHeight: !isLoaded ? "400px" : "auto",
      }}
    >
      {!isLoaded && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "20px",
            minHeight: "400px",
            alignItems: "center",
          }}
        >
          <LoadingFallback />
        </div>
      )}
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
      <div
        style={{
          display: isLoaded && itemDetails ? "block" : "none",
        }}
      >
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
        </Document>
      </div>
    </div>
  );
}
