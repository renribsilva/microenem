"use client";

import Card from "../../../../components/tsx/card";
import CandidateDetailTable from "./components/tables/candidate";
import RankingTable from "./components/tables/mean_table";
import styles from "./mean.module.css";

export default function RedacaoPage() {
  return (
    <main className={styles.main_container}>
      <div className={styles.main_left}>
        <Card>
          <RankingTable />
        </Card>
      </div>
      <div id="topo-pagina" className={styles.main_right}>
        <Card>
          <CandidateDetailTable />
        </Card>
      </div>
    </main>
  );
}

