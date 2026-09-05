"use client";

import { useEffect, useRef } from "react";
import { pdfjs } from "react-pdf";
import { CropArea } from "../../types/questoes_types";
import LoadingFallback from "./loading_fallback";

interface PdfThumbnailProps {
  fileUrl: string;
  scale: number;
  crops: CropArea[];
  direction?: "row" | "column" | null;
  isLoaded: boolean;
  setIsLoaded: (x: boolean) => void;
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

export default function PdfThumbnail({
  fileUrl,
  scale,
  crops,
  direction,
  isLoaded,
  setIsLoaded,
}: PdfThumbnailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasesRef = useRef<HTMLCanvasElement[]>([]);

  useEffect(() => {
    if (!fileUrl || !crops.length) return;

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

        const novosCanvases = await Promise.all(
          pages.map(async (page, index) => {
            const crop = crops[index];

            const dpr = Math.min(window.devicePixelRatio || 1, 3);

            // PC comum (DPR 1) = 4x
            // Retina/mobile (DPR 2) = 6x
            // Alta densidade (DPR 3) = 9x
            const outputScale = Math.max(dpr * 3, 4);

            const visualViewport = page.getViewport({
              scale,
            });

            const renderViewport = page.getViewport({
              scale: scale * outputScale,
            });

            const largura = Math.max(
              1,
              visualViewport.width - crop.offsetX - crop.cropWidth,
            );

            const altura = Math.max(1, crop.cropHeight);

            const canvas = document.createElement("canvas");

            canvas.width = Math.ceil(largura * outputScale);

            canvas.height = Math.ceil(altura * outputScale);

            canvas.style.width = `${largura}px`;
            canvas.style.height = `${altura}px`;
            canvas.style.display = "block";

            const context = canvas.getContext("2d", {
              alpha: false,
            });

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
                -crop.offsetX * outputScale,
                -crop.offsetY * outputScale,
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

        console.error("Erro ao renderizar PDF:", error);

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
  }, [fileUrl, crops, scale, setIsLoaded]);

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
