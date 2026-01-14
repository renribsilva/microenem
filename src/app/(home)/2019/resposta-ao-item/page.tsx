"use client";

import styles from "./resposta-ao-item.module.css"
import { TabsNavigation } from "../../../../components/tsx/tab_navigation";
import Card from "../../../../components/tsx/card";
import ScoreTable from "./components/tables/score_table";
import AcertosChart from "./components/graphs/acertos";
import ViolinBinsChart from "./components/graphs/violin";
import { useHomeData } from "../../../../context/home_context";

const menuItems = [
  { id: 'LC', label: 'Linguagens' },
  { id: 'CH', label: 'Humanas' },
  { id: 'CN', label: 'Natureza' },
  { id: 'MT', label: 'Matemática' },
];

export default function QuestoesPage() {
  
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