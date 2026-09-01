"use client";

import styles from "./dados-do-exame.module.css";
import Card from "../../../../components/tsx/card";
import dynamic from "next/dynamic";

// Imports dinâmicos mantidos
const TCCChart = dynamic(() => import("./components/graphs/tcc"), {
  ssr: false,
});

const DensityNotasChart = dynamic(
  () => import("./components/graphs/density_notas"),
  { ssr: false },
);
const FrequencyAcertosChart = dynamic(
  () => import("./components/graphs/frequency_acertos"),
  { ssr: false },
);
const DescribeTable = dynamic(() => import("./components/tables/describe"));

export default function DadosDoExame() {
  return (
    <section className={styles.main}>
      <div className={styles.main_top}>
        <div className={styles.main_left}>
          <Card className={styles.card_describe}>
            <DescribeTable />
          </Card>
        </div>
        <div className={styles.main_right}>
          <div
            id="topo-pagina"
            className={styles.main_right_top}
            style={{ minWidth: 0, minHeight: 0 }}
          >
            <Card className={styles.card_density}>
              <DensityNotasChart />
            </Card>
            <Card className={styles.card_frequency}>
              <FrequencyAcertosChart />
            </Card>
          </div>
          <div
            className={styles.main_right_bottom}
            style={{ minWidth: 0, minHeight: 0 }}
          >
            <Card className={styles.card_tcc}>
              <TCCChart />
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
