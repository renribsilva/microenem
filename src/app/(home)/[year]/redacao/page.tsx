import dynamic from "next/dynamic";
import Card from "../../../../components/tsx/card";
import styles from "./redacao.module.css";

const PersonText = dynamic(
  () => import("../../../../components/svg/person_text"),
);
const NotasRedacaoChart = dynamic(() => import("./components/graphs/notas"));
const NotasRedacaoTable = dynamic(() => import("./components/tables/describe"));
const StatusRedacaoTable = dynamic(() => import("./components/tables/status"));

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
