"use client";

import styles from "./dados-dos-itens.module.css"
import { TabsNavigation } from "../../../../components/tsx/tab_navigation";
import { useState } from "react";
import Card from "../../../../components/tsx/card";
import { useTccLogic } from "../../../../hooks/use_tcc_logic";
import ItensButtons from "../../../../components/tsx/itens_buttons";
import ProbsTable from "./components/tables/prob";

// JSON Data
import tccData from "../json/tcc.json"
import dynamic from "next/dynamic";

// Imports dinâmicos
const ICCChart = dynamic(() => import("./components/graphs/icc"), { ssr: false })

const menuItems = [
  { id: 'LC', label: 'Linguagens' },
  { id: 'CH', label: 'Humanas' },
  { id: 'CN', label: 'Natureza' },
  { id: 'MT', label: 'Matemática' },
];

type ItemStatus = 'acerto' | 'erro';
type ItemData = {
  status: ItemStatus;
  posicao: number; // Aqui guardamos o CO_POSICAO
};
type ItemSelection = Record<number, ItemData>;

export default function DadosDoExame() {

  const [activeArea, setActiveArea] = useState("LC");
  const chartLogic = useTccLogic(tccData.datasets, activeArea);
  const [selectedItems, setSelectedItems] = useState<ItemSelection>({});
  const [lastItemActivate, setLastItemActivate] = useState<number>(0);
  const [activeCodes, setActiveCodes] = useState<number[]>([]);
  
  const handleTabChange = (id: string) => {
    setActiveArea(id);
  };

  return (
    <main className={styles.main}>   
      <nav className={styles.nav}>
        <TabsNavigation 
          items={menuItems} 
          activeId={activeArea} 
          onTabChange={handleTabChange} 
        />
      </nav>  
      <div className={styles.main_top}>
        <div className={styles.main_left}>
          <div className={styles.main_left1}>
            <Card>
              <h3 className={styles.card_title}>Questões de {activeArea}</h3>
              <ItensButtons 
                logic={chartLogic} 
                area={activeArea}
                selectedItems={selectedItems} 
                setSelectedItems={setSelectedItems}
                setLastItemActivate={setLastItemActivate}
              />
            </Card>
          </div>
          <div className={styles.main_left2}>
            <Card >
              <h3 className={styles.card_title}>Probabilidades</h3>
              <ProbsTable 
                itemSelection={selectedItems} 
                logic={chartLogic}
                activeCodes={activeCodes}
                area={activeArea}
              />
            </Card>
          </div>
        </div>
        <div className={styles.main_right}>
          <div className={styles.main_right_top}>
            <Card>
              <ICCChart 
                itemSelection={selectedItems} 
                logic={chartLogic}
                area={activeArea}
                lastItemActive={lastItemActivate}
                onFilterChange={(filtered) => setActiveCodes(filtered)}
              />
            </Card>
          </div>
          <div className={styles.main_right_bottom}>
          </div>
        </div>
      </div>   
    </main>
  );
}