"use client";

import PersonText from "../../../../components/svg/person_text";
import Card from "../../../../components/tsx/card";
import NotasRedacaoChart from "./components/graphs/notas";
import NotasRedacaoTable from "./components/tables/describe";
import StatusRedacaoTable from "./components/tables/status";
import styles from "./redacao.module.css";

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

