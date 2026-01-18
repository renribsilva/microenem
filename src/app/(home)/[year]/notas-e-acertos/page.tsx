"use client";

import styles from "./notas-e-acertos.module.css"
import { TabsNavigation } from "../../../../components/tsx/tab_navigation";
import Card from "../../../../components/tsx/card";
import AcertosChart from "./components/graphs/acertos";
import { useHomeData } from "../../../../context/home_context";
import AcertosTable from "./components/tables/acertos_table";

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