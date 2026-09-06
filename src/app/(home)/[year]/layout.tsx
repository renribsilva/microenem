"use client";

import { useYearData, YearProvider } from "../../../context/year_context";
import dynamic from "next/dynamic";
import { useHomeData } from "../../../context/home_context";
import { CropArea, QuestaoCoordenadas } from "../../../types/questoes_types";
import { useEffect, useMemo, useRef, useState } from "react";
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

  const ehPrimeiroDia = deferredArea === "LC" || deferredArea === "CH";
  const sufixoDia = ehPrimeiroDia ? "1DIA" : "2DIA";

  const fileUrlDinamico =
    currentYear && deferredArea ? `/${currentYear}_${sufixoDia}.pdf` : null;

  const isValidPath =
    pathName.endsWith("probabilidade-e-info") ||
    pathName.endsWith("resposta-ao-item") ||
    pathName.endsWith("media-simples") ||
    pathName.endsWith("tri");

  const [questoesData, setQuestoesData] = useState<{
    key: string;
    map: Map<number, QuestaoCoordenadas>;
  } | null>(null);

  const questoesCache = useRef<Map<string, Map<number, QuestaoCoordenadas>>>(
    new Map(),
  );

  useEffect(() => {
    let cancelled = false;
    if (!currentYear || !deferredArea || !isValidPath) return;
    async function carregarQuestoes() {
      const key = `${currentYear}-${deferredArea}`;
      const cachedMap = questoesCache.current.get(key);
      if (cachedMap) {
        setQuestoesData({
          key,
          map: cachedMap,
        });
        return;
      }
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
        questoesCache.current.set(key, map);
        setQuestoesData({
          key,
          map,
        });
      } catch (error) {
        if (!cancelled) {
          console.error("Erro ao carregar questões:", error);
        }
      }
    }
    if (isValidPath && currentYear && deferredArea) {
      carregarQuestoes();
    }
    return () => {
      cancelled = true;
    };
  }, [currentYear, deferredArea, isValidPath]);

  const dadosQuestao = useMemo(() => {
    if (!questaoPopUp || !questoesData) return null;
    const key = `${currentYear}-${deferredArea}`;
    if (questoesData.key !== key) return null;
    return questoesData.map.get(questaoPopUp) ?? null;
  }, [questoesData, questaoPopUp, currentYear, deferredArea]);

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
  const [isIdleReady, setIsIdleReady] = useState(false);

  useEffect(() => {
    const handleIdle = () => {
      setIsIdleReady(true);
    };
    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(handleIdle, { timeout: 2000 });
      return () => {
        window.cancelIdleCallback(idleId);
      };
    } else {
      const timer = setTimeout(handleIdle, 1000);
      return () => {
        window.clearTimeout(timer);
      };
    }
  }, []);
  return (
    <YearProvider>
      {isIdleReady && <RenderKeepAlive />}
      <YearLayoutContent>{children}</YearLayoutContent>
    </YearProvider>
  );
}
export default YearLayout;
