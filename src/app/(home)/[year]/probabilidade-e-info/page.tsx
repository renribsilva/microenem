"use client";

import styles from "./dados-dos-itens.module.css";
import Card from "../../../../components/tsx/card";
import ItensButtons from "../../../../components/tsx/itens_buttons";
import dynamic from "next/dynamic";
import { useHomeData } from "../../../../context/home_context";

// Imports dinâmicos
const ICCChart = dynamic(() => import("./components/graphs/icc"), {
  ssr: false,
});
const InfoChart = dynamic(() => import("./components/graphs/info"), {
  ssr: false,
});
const ProbsInfoTable = dynamic(() => import("./components/tables/prob_info"), {
  ssr: false,
});

export default function DadosDoExame() {
  const { deferredArea } = useHomeData();

  return (
    <main className={styles.main}>
      <div className={styles.main_top}>
        <div className={styles.main_top_left}>
          <Card>
            <h3 className={styles.card_title}>Questões de {deferredArea}</h3>
            <ItensButtons />
          </Card>
        </div>
        <div className={styles.main_top_right}>
          <Card>
            <ProbsInfoTable />
          </Card>
        </div>
      </div>
      <div className={styles.main_bottom}>
        <Card>
          <ICCChart />
        </Card>
        <Card>
          <InfoChart />
        </Card>
      </div>
    </main>
  );
}
