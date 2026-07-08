"use client";

import { useYearData, YearProvider } from "../../../context/year_context";
import styles from "./layout.module.css";
import Navbar from "../../../components/tsx/navbar";
import dynamic from "next/dynamic";
import { useHomeData } from "../../../context/home_context";
import { QuestaoCoordenadas } from "../../../types/questoes_types";
import { useState } from "react";

const PdfModal = dynamic(() => import("../../../components/tsx/pdf_modal"), {
  ssr: false,
});

function YearLayoutContent({ children }: { children: React.ReactNode }) {
  const { currentYear, deferredArea } = useHomeData();
  const { showPopUp, questaoPopUp, setShowPopUp } = useYearData();
  const [dadosQuestao, setDadosQuestao] = useState<QuestaoCoordenadas | null>(
    null,
  );
  const ehPrimeiroDia = deferredArea === "LC" || deferredArea === "CH";
  const sufixoDia = ehPrimeiroDia ? "1DIA" : "2DIA";
  const fileUrlDinamico = `/${currentYear}_${sufixoDia}.pdf`;

  import(`../../../questoes/${currentYear}/${deferredArea}`)
    .then((modulo) => {
      const listaQuestoes: QuestaoCoordenadas[] =
        modulo.questoesEnem || modulo.default;
      const questaoEncontrada = listaQuestoes.find(
        (q) => q.codigo === questaoPopUp,
      );
      setDadosQuestao(questaoEncontrada || null);
    })
    .catch((err) => {
      console.error(
        `Erro ao carregar questões: ${deferredArea} do ano ${currentYear}:`,
        err,
      );
      setDadosQuestao(null);
    });

  const cropDefault = [
    {
      cropHeight: 0,
      cropWidth: 0,
      offsetX: 0,
      offsetY: 0,
    },
  ];

  return (
    <>
      {showPopUp && (
        <PdfModal
          fileUrl={fileUrlDinamico}
          isOpen={showPopUp}
          onClose={() => setShowPopUp(false)}
          pageNumber={dadosQuestao ? dadosQuestao.pagina : 1}
          code={dadosQuestao ? dadosQuestao.codigo : 0}
          scale={dadosQuestao ? dadosQuestao.scale : 1.2}
          crops={dadosQuestao ? dadosQuestao.crops : cropDefault}
          direction={dadosQuestao ? dadosQuestao.direction : "row"}
        />
      )}
      <Navbar />
      <main>{children}</main>
      <div className={styles.table_footer}>
        Aviso: a análise dos microdados do ENEM apresentada neste saite está
        circunscrita aos dados dos que participaram de ao menos um dia da
        aplicação regular do exame (incluindo treineiros) – não inclui
        reaplicações, versões digitais ou adaptadas do exame. O motivo dessa
        exclusão reside no fato de que alguns microdados apresentam essas
        informações e outros não, além de itens exclusivos que modificam a
        dificuldade média do exame; de modo que excluí-los estabelece uma
        normalização para possíveis comparações.
      </div>
    </>
  );
}

// 2. O componente principal apenas envelopa tudo com o Provider
function YearLayout({ children }: { children: React.ReactNode }) {
  return (
    <YearProvider>
      <YearLayoutContent>{children}</YearLayoutContent>
    </YearProvider>
  );
}

export default YearLayout;
