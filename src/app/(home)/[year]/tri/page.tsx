"use client";

import styles from "./tri.module.css"
import { TabsNavigation } from "../../../../components/tsx/tab_navigation";
import Card from "../../../../components/tsx/card";
import { useHomeData } from "../../../../context/home_context";
import ItensButtons from "../../../../components/tsx/itens_buttons";
import ProdProbChart from "./components/graphs/prod_prob";
import MarginImpactTable from "./components/tables/margin_impact";

const menuItems = [
  { id: 'LC', label: 'Linguagens' },
  { id: 'CH', label: 'Humanas' },
  { id: 'CN', label: 'Natureza' },
  { id: 'MT', label: 'Matemática' },
];

export default function RedacaoPage() {
  
  const { deferredArea, handleTabChange } = useHomeData();

  return (
    <main className={styles.main_container}>      
      <nav className={styles.nav_container}>
        <TabsNavigation 
          items={menuItems} 
          activeId={deferredArea} 
          onTabChange={handleTabChange} 
        />
      </nav>
      <div className={styles.tri_container}>
        <div className={styles.tri_left}>
          <div className={styles.tri_top}>
            <Card>
              <h3 className={styles.card_title}>Sequência de erros e acertos de {deferredArea}</h3>
              <ItensButtons />
            </Card>
          </div>
          <div className={styles.tri_bottom}>
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