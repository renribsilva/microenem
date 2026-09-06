import dynamic from "next/dynamic";
import Card from "../../../../components/tsx/card";
import styles from "./mean.module.css";

const RankingTable = dynamic(() => import("./components/tables/mean_table"));
const CandidateDetailTable = dynamic(
  () => import("./components/tables/candidate"),
);

export default function RedacaoPage() {
  return (
    <main className={styles.main_container}>
      <div className={styles.main_left}>
        <Card className={styles.card_ranking} fullSize>
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
