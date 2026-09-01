"use client";

import { useYearData, YearProvider } from "../../../context/year_context";
import Navbar from "../../../components/tsx/navbar";
import dynamic from "next/dynamic";
import { useHomeData } from "../../../context/home_context";
import { QuestaoCoordenadas } from "../../../types/questoes_types";
import { useEffect, useState } from "react";
import TableFooter from "../../../components/tsx/table_footer";

const PdfModal = dynamic(() => import("../../../components/tsx/pdf_modal"), {
  ssr: false,
});

function YearLayoutContent({ children }: { children: React.ReactNode }) {
  const { currentYear, deferredArea } = useHomeData();
  const {
    showPopUp,
    questaoPopUp,
    setShowPopUp,
    isLoaded,
    setIsLoaded,
    setShowGabarito,
  } = useYearData();
  const [dadosQuestao, setDadosQuestao] = useState<QuestaoCoordenadas | null>(
    null,
  );
  const ehPrimeiroDia = deferredArea === "LC" || deferredArea === "CH";
  const sufixoDia = ehPrimeiroDia ? "1DIA" : "2DIA";
  const fileUrlDinamico = `/${currentYear}_${sufixoDia}.pdf`;

  if (process.env.NODE_ENV === "development") {
    if (questaoPopUp && currentYear && deferredArea) {
      import(`../../../questoes/${currentYear}/${deferredArea}.json`)
        .then((modulo) => {
          const listaQuestoes = modulo.default as QuestaoCoordenadas[];
          const questaoEncontrada = listaQuestoes.find(
            (q) => q.codigo === questaoPopUp,
          );
          setDadosQuestao(questaoEncontrada || null);
        })
        .catch((err) => {
          console.error(`Erro ao carregar questões:`, err);
          setDadosQuestao(null);
        });
    }
  }

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!showPopUp || !questaoPopUp || !currentYear || !deferredArea) return;
    import(`../../../questoes/${currentYear}/${deferredArea}.json`)
      .then((modulo) => {
        const listaQuestoes = modulo.default as QuestaoCoordenadas[];
        const questaoEncontrada = listaQuestoes.find(
          (q) => q.codigo === questaoPopUp,
        );
        setDadosQuestao(questaoEncontrada || null);
      })
      .catch((err) => {
        console.error(`Erro ao carregar questões:`, err);
        setDadosQuestao(null);
      });
  }, [showPopUp, questaoPopUp, currentYear, deferredArea]);

  const cropDefault = [
    {
      pagina: 1,
      cropHeight: 0,
      cropWidth: 0,
      offsetX: 0,
      offsetY: 0,
    },
  ];

  function handleOnClose() {
    setShowPopUp(false);
    setShowGabarito(false);
  }

  return (
    <>
      {showPopUp && (
        <PdfModal
          fileUrl={fileUrlDinamico}
          isOpen={showPopUp}
          onClose={handleOnClose}
          code={dadosQuestao ? dadosQuestao.codigo : 0}
          scale={dadosQuestao ? dadosQuestao.scale : 1.2}
          crops={dadosQuestao ? dadosQuestao.crops : cropDefault}
          direction={dadosQuestao ? dadosQuestao.direction : "row"}
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
      <YearLayoutContent>{children}</YearLayoutContent>
    </YearProvider>
  );
}

export default YearLayout;
