"use client";

import { useYearData, YearProvider } from "../../../context/year_context";
import styles from "./layout.module.css";
import Navbar from "../../../components/tsx/navbar";
import dynamic from "next/dynamic";
import { useHomeData } from "../../../context/home_context";
import { questoesEnem } from "../../../hooks/questoes_coordenadas";

const PdfModal = dynamic(() => import("../../../components/tsx/pdf_modal"), {
  ssr: false,
});

function YearLayoutContent({ children }: { children: React.ReactNode }) {
  const { currentYear, deferredArea } = useHomeData();
  const { showPopUp, questaoPopUp, setShowPopUp } = useYearData();

  const ehPrimeiroDia = deferredArea === "LC" || deferredArea === "CH";
  const sufixoDia = ehPrimeiroDia ? "1DIA" : "2DIA";
  const fileUrlDinamico = `/${currentYear}_${sufixoDia}.pdf`;

  const dadosQuestao = questoesEnem.find((q) => q.codigo === questaoPopUp);

  return (
    <>
      {showPopUp && (
        <PdfModal
          fileUrl={fileUrlDinamico}
          isOpen={showPopUp}
          onClose={() => setShowPopUp(false)}
          pageNumber={dadosQuestao ? dadosQuestao.pagina : 1}
          code={dadosQuestao ? dadosQuestao.codigo : 0}
          cropHeight={dadosQuestao ? dadosQuestao.cropHeight : 0}
          cropWidth={dadosQuestao ? dadosQuestao.cropWidth : 0}
          offsetX={dadosQuestao ? dadosQuestao.offsetX : 0}
          offsetY={dadosQuestao ? dadosQuestao.offsetY : 0}
          scale={dadosQuestao ? dadosQuestao.scale : 1.2}
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
