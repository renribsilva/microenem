"use client";

import styles from "./tri.module.css";
import Card from "../../../../components/tsx/card";
import { useHomeData } from "../../../../context/home_context";
import ItensButtons from "../../../../components/tsx/itens_buttons";
import dynamic from "next/dynamic";

const ProdProbChart = dynamic(() => import("./components/graphs/prod_prob"));
const MarginImpactTable = dynamic(
  () => import("./components/tables/margin_impact"),
);

export default function RedacaoPage() {
  const { deferredArea } = useHomeData();

  return (
    <main className={styles.main_container}>
      <div className={styles.tri_container}>
        <div className={styles.tri_top}>
          <div className={styles.tri_top_left}>
            <Card>
              <h3 className={styles.card_title}>
                Sequência de erros e acertos de {deferredArea}
              </h3>
              <ItensButtons />
            </Card>
          </div>
          <div id="topo-pagina" className={styles.tri_top_right}>
            <Card>
              <ProdProbChart />
            </Card>
          </div>
        </div>
        <div className={styles.tri_right}>
          <Card>
            <MarginImpactTable />
          </Card>
        </div>
      </div>
    </main>
  );
}
