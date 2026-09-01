"use client";

import dynamic from "next/dynamic";
import PersonText from "../../../../components/svg/person_text";
import Card from "../../../../components/tsx/card";
import styles from "./redacao.module.css";

const NotasRedacaoChart = dynamic(() => import("./components/graphs/notas"), {
  ssr: false,
});
const NotasRedacaoTable = dynamic(
  () => import("./components/tables/describe"),
  { ssr: false },
);
const StatusRedacaoTable = dynamic(() => import("./components/tables/status"), {
  ssr: false,
});

export default function Redacao() {
  return (
    <section className={styles.redacao_main}>
      <div className={styles.redacao_top}>
        <div className={styles.redacao_top_left}>
          <Card>
            <PersonText />
            <h3 className={styles.card_redacao_title}>Situação da redação</h3>
            <StatusRedacaoTable />
          </Card>
        </div>
        <div className={styles.redacao_top_right}>
          <Card>
            <NotasRedacaoTable />
          </Card>
        </div>
      </div>
      <div id="topo-pagina" className={styles.redacao_bottom}>
        <Card>
          <NotasRedacaoChart />
        </Card>
      </div>
    </section>
  );
}
