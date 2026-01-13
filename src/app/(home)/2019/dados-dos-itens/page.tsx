"use client";

import styles from "./dados-dos-itens.module.css"
import { TabsNavigation } from "../../../../components/tsx/tab_navigation";
import Card from "../../../../components/tsx/card";
import ItensButtons from "../../../../components/tsx/itens_buttons";
import dynamic from "next/dynamic";
import { useHomeData } from "../../../../context/home_context";

// Imports dinâmicos
const ICCChart = dynamic(() => import("./components/graphs/icc"), { ssr: false })
const InfoChart = dynamic(() => import("./components/graphs/info"), { ssr: false })
const ProbsInfoTable = dynamic(() => import("./components/tables/prob_info"), { ssr: false })

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
        <div className={styles.main_top_left}>
          <Card>
            <h3 className={styles.card_title}>Questões de {deferredArea}</h3>
            <ItensButtons />
          </Card>
        </div>
        <div className={styles.main_top_right}>
          <Card >
            <h3 className={styles.card_title}>Tabela de informações do item</h3>
            <p className={styles.card_subtitle_p}>
              Probabilidades de erro ou acerto, segundo os parâmetros de chute, dificuldade e discriminação; e frequências de acerto e erro observadas em cada item.
            </p>
            <ProbsInfoTable />
          </Card>
        </div>
      </div>
      <div className={styles.main_bottom}>
        <Card>
          <ICCChart />
        </Card>
        <Card>
          <InfoChart />
        </Card>
      </div> 
    </main>
  );
}