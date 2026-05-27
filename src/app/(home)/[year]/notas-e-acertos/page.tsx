import styles from "./notas-e-acertos.module.css";
import Card from "../../../../components/tsx/card";
import AcertosChart from "./components/graphs/acertos";
import AcertosTable from "./components/tables/acertos_table";

export default function QuestoesPage() {
  return (
    <main className={styles.main_container}>
      <div className={styles.main_top}>
        <Card className={styles.card_top}>
          <AcertosChart />
        </Card>
      </div>
      <div className={styles.main_bottom}>
        <Card>
          <AcertosTable />
        </Card>
      </div>
    </main>
  );
}

