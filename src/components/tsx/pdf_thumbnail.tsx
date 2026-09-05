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

            /*
             * Escala visual do PDF.
             */
            const viewport = page.getViewport({
              scale,
            });

            /*
             * Pixel ratio da tela.
             *
             * Em uma tela Retina, por exemplo:
             * devicePixelRatio = 2
             *
             * O canvas terá 2x mais pixels, mas continuará
             * ocupando o mesmo tamanho visual.
             */
            const pixelRatio = Math.min(window.devicePixelRatio || 1, 3);

            /*
             * Dimensão visual do crop.
             */
            const largura = Math.max(
              1,
              viewport.width - crop.offsetX - crop.cropWidth,
            );

            const altura = Math.max(1, crop.cropHeight);

            const canvas = document.createElement("canvas");

            /*
             * Resolução REAL do canvas.
             */
            canvas.width = Math.ceil(largura * pixelRatio);
            canvas.height = Math.ceil(altura * pixelRatio);

            /*
             * Tamanho VISUAL do canvas.
             */
            canvas.style.width = `${largura}px`;
            canvas.style.height = `${altura}px`;
            canvas.style.display = "block";

            const context = canvas.getContext("2d", {
              alpha: false,

              /*
               * Mantém o canvas com qualidade melhor para imagens/textos.
               */
              desynchronized: false,
            });

            if (!context) {
              throw new Error("Não foi possível criar o contexto 2D.");
            }

            /*
             * Como o canvas físico é maior que o tamanho visual,
             * precisamos escalar o contexto.
             */
            context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

            /*
             * O transform desloca o PDF para que somente o crop
             * desejado apareça no canvas.
             *
             * Não arredondamos offsetX/offsetY, pois isso pode
             * causar perda de definição em determinadas escalas.
             */
            const renderTask = page.render({
              canvas,
              canvasContext: context,
              viewport,
              transform: [1, 0, 0, 1, -crop.offsetX, -crop.offsetY],
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
