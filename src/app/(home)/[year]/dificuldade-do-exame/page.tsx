"use client";

import { DescribeTable } from "./components/tables/describe";
import styles from "./dados-do-exame.module.css";
import Card from "../../../../components/tsx/card";
import dynamic from "next/dynamic";
import { useHomeData } from "../../../../context/home_context";

// Imports dinâmicos mantidos
const TCCChart = dynamic(() => import("./components/graphs/tcc"));
const DensityNotasChart = dynamic(
  () => import("./components/graphs/density_notas"),
);
const FrequencyAcertosChart = dynamic(
  () => import("./components/graphs/frequency_acertos"),
);

export default function DadosDoExame() {
  const { isUpdating } = useHomeData();

  return (
    <section
      className={styles.main}
      style={{
        opacity: isUpdating ? 0.7 : 1,
        transition: "opacity 0.15s ease",
      }}
    >
      <div className={styles.main_top}>
        <div className={styles.main_left}>
          <Card className={styles.card_describe}>
            <DescribeTable />
          </Card>
        </div>
        <div className={styles.main_right}>
          <div
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
