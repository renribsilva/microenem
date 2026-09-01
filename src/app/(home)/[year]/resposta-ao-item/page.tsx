import styles from "./resposta-ao-item.module.css";
import Card from "../../../../components/tsx/card";
import dynamic from "next/dynamic";

const ScoreTable = dynamic(() => import("./components/tables/score_table"));
const AcertosChart = dynamic(() => import("./components/graphs/acertos"));
const ViolinBinsChart = dynamic(() => import("./components/graphs/violin"));

export default function QuestoesPage() {
  return (
    <main id="topo-pagina" className={styles.main_container}>
      <div className={styles.main_top}>
        <div className={styles.main_top1}>
          <Card>
            <AcertosChart />
          </Card>
        </div>
        <div className={styles.main_top2}>
          <Card>
            <ViolinBinsChart />
          </Card>
        </div>
      </div>
      <div className={styles.main_bottom}>
        <Card>
          <ScoreTable />
        </Card>
      </div>
    </main>
  );
}
