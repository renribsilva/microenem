"use client";

import styles from "./dados-dos-itens.module.css"
import { TabsNavigation } from "../../../../components/tsx/tab_navigation";
import Card from "../../../../components/tsx/card";
import ItensButtons from "../../../../components/tsx/itens_buttons";
import ProbsTable from "./components/tables/prob";
import dynamic from "next/dynamic";
import { useHomeData } from "../../../../context/home_context";

// Imports dinâmicos
const ICCChart = dynamic(() => import("./components/graphs/icc"), { ssr: false })

const menuItems = [
  { id: 'LC', label: 'Linguagens' },
  { id: 'CH', label: 'Humanas' },
  { id: 'CN', label: 'Natureza' },
  { id: 'MT', label: 'Matemática' },
];

export default function DadosDoExame() {

  const { deferredArea, handleTabChange } = useHomeData();

  return (
    <main className={styles.main}>   
      <nav className={styles.nav}>
        <TabsNavigation 
          items={menuItems} 
          activeId={deferredArea} 
          onTabChange={handleTabChange} 
        />
      </nav>  
      <div className={styles.main_top}>
        <div className={styles.main_left}>
          <div className={styles.main_left1}>
            <Card>
              <h3 className={styles.card_title}>Questões de {deferredArea}</h3>
              <ItensButtons />
            </Card>
          </div>
          <div className={styles.main_left2}>
            <Card >
              <h3 className={styles.card_title}>Probabilidades</h3>
              <ProbsTable />
            </Card>
          </div>
        </div>
        <div className={styles.main_right}>
          <div className={styles.main_right_top}>
            <Card>
              <ICCChart />
            </Card>
          </div>
          <div className={styles.main_right_bottom}>
          </div>
        </div>
      </div>   
    </main>
  );
}