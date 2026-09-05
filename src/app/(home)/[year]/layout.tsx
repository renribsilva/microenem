"use client";

import { useYearData, YearProvider } from "../../../context/year_context";
import dynamic from "next/dynamic";
import { useHomeData } from "../../../context/home_context";
import { CropArea, QuestaoCoordenadas } from "../../../types/questoes_types";
import { useEffect, useMemo, useState } from "react";
import RenderKeepAlive from "../../../components/tsx/keep_alive";
import Navbar from "../../../components/tsx/navbar";
import TableFooter from "../../../components/tsx/table_footer";

const PdfModal = dynamic(() => import("../../../components/tsx/pdf_modal"), {});

const CROP_DEFAULT: CropArea[] = [
  {
    pagina: 1,
    cropHeight: 0,
    cropWidth: 0,
    offsetX: 0,
    offsetY: 0,
  },
];

function YearLayoutContent({ children }: { children: React.ReactNode }) {
  const { pathName, currentYear, deferredArea } = useHomeData();

  const {
    showPopUp,
    questaoPopUp,
    setShowPopUp,
    isLoaded,
    setIsLoaded,
    setShowGabarito,
  } = useYearData();

  const [questoesMap, setQuestoesMap] = useState<
    Map<number, QuestaoCoordenadas>
  >(new Map());

  const ehPrimeiroDia = deferredArea === "LC" || deferredArea === "CH";
  const sufixoDia = ehPrimeiroDia ? "1DIA" : "2DIA";

  const fileUrlDinamico =
    currentYear && deferredArea ? `/${currentYear}_${sufixoDia}.pdf` : null;

  const isValidPath =
    pathName.endsWith("probabilidade-e-info") ||
    pathName.endsWith("resposta-ao-item") ||
    pathName.endsWith("tri");

  useEffect(() => {
    let cancelled = false;
    async function carregarQuestoes() {
      try {
        const response = await fetch(
          `/questoes/${currentYear}/${deferredArea}.json`,
          {
            cache: "force-cache",
          },
        );
        if (!response.ok) {
          throw new Error(`Erro ao carregar questões: ${response.status}`);
        }
        const lista = (await response.json()) as QuestaoCoordenadas[];
        if (cancelled) return;
        const map = new Map<number, QuestaoCoordenadas>();
        for (const questao of lista) {
          map.set(questao.codigo, questao);
        }
        setQuestoesMap(map);
      } catch (error) {
        if (!cancelled) {
          console.error("Erro ao carregar questões:", error);
          setQuestoesMap(new Map());
        }
      }
    }
    if (isValidPath) {
      carregarQuestoes();
    }
    return () => {
      cancelled = true;
    };
  }, [currentYear, deferredArea, isValidPath]);

  const dadosQuestao = useMemo(() => {
    if (!questaoPopUp) return null;
    return questoesMap.get(questaoPopUp) ?? null;
  }, [questoesMap, questaoPopUp]);

  useEffect(() => {
    if (!fileUrlDinamico || !isValidPath) return;
    const preload = async () => {
      try {
        const { preloadPdf } =
          await import("../../../components/tsx/pdf_thumbnail");
        preloadPdf(fileUrlDinamico);
      } catch (error) {
        console.error("Erro ao fazer preload do PDF:", error);
      }
    };
    preload();
  }, [fileUrlDinamico, isValidPath]);

  useEffect(() => {
    const carregarModal = () => {
      import("../../../components/tsx/pdf_modal").catch(() => {});
    };
    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(carregarModal);
      return () => {
        window.cancelIdleCallback(idleId);
      };
    }
    const timer = setTimeout(carregarModal, 1000);
    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  function handleOnClose() {
    setShowPopUp(false);
    setShowGabarito(false);
  }

  return (
    <>
      {showPopUp && (
        <PdfModal
          fileUrl={fileUrlDinamico ?? ""}
          isOpen={showPopUp}
          onClose={handleOnClose}
          code={dadosQuestao?.codigo ?? 0}
          scale={dadosQuestao?.scale ?? 1.2}
          crops={dadosQuestao?.crops ?? CROP_DEFAULT}
          direction={dadosQuestao?.direction ?? "row"}
          isLoaded={isLoaded}
          setIsLoaded={setIsLoaded}
        />
      )}
      <Navbar />
      <main>{children}</main>
      <TableFooter />
    </>
  );
}

function YearLayout({ children }: { children: React.ReactNode }) {
  return (
    <YearProvider>
      <RenderKeepAlive />
      <YearLayoutContent>{children}</YearLayoutContent>
    </YearProvider>
  );
}

export default YearLayout;
