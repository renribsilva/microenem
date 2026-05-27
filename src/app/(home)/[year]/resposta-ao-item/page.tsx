import styles from "./resposta-ao-item.module.css";
import Card from "../../../../components/tsx/card";
import ScoreTable from "./components/tables/score_table";
import AcertosChart from "./components/graphs/acertos";
import ViolinBinsChart from "./components/graphs/violin";

export default function QuestoesPage() {
  return (
    <main className={styles.main_container}>
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
