import styles from "./notas-e-acertos.module.css";
import Card from "../../../../components/tsx/card";
import dynamic from "next/dynamic";

const AcertosChart = dynamic(() => import("./components/graphs/acertos"));
const AcertosTable = dynamic(() => import("./components/tables/acertos_table"));

export default function QuestoesPage() {
  return (
    <main id="topo-pagina" className={styles.main_container}>
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
