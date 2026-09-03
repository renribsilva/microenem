import styles from "./dados-do-exame.module.css";
import Card from "../../../../components/tsx/card";
import dynamic from "next/dynamic";

// Imports dinâmicos mantidos
const TCCChart = dynamic(() => import("./components/graphs/tcc"));
const DensityNotasChart = dynamic(
  () => import("./components/graphs/density_notas"),
);
const FrequencyAcertosChart = dynamic(
  () => import("./components/graphs/frequency_acertos"),
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
            <Card className={styles.card_density} fullSize>
              <DensityNotasChart />
            </Card>
            <Card className={styles.card_frequency} fullSize>
              <FrequencyAcertosChart />
            </Card>
          </div>
          <div>
            <Card className={styles.card_tcc} fullSize>
              <TCCChart />
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
