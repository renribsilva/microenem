"use client";

import styles from "./dados-dos-itens.module.css"
import { TabsNavigation } from "../../../../components/tsx/tab_navigation";
import { useState } from "react";
import Card from "../../../../components/tsx/card";
import { useTccLogic } from "../../../../hooks/use_tcc_logic";
import tccData from "../json/tcc.json"
import ItensButtons from "./components/itens_buttons";
import ICCChart from "./components/graphs/icc";
import InputShell from "../../../../components/tsx/input_shell";
import ProbsTable from "./components/tables/prob";

const menuItems = [
  { id: 'LC', label: 'Linguagens' },
  { id: 'CH', label: 'Humanas' },
  { id: 'CN', label: 'Natureza' },
  { id: 'MT', label: 'Matemática' },
];

// Definimos o tipo do estado para ser consistente em todos os componentes
export type ItemSelection = Record<number, 'acerto' | 'erro'>;

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
    <main className={styles.main_container}>      
      <nav className={styles.nav_container}>
        <TabsNavigation 
          items={menuItems} 
          activeId={activeArea} 
          onTabChange={handleTabChange} 
        />
      </nav>
      <div className={styles.main_top}>
        <div className={styles.main_left}>
          <Card display="block" width={'250px'} height={'100%'}>
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
        <div className={styles.main_right}>
          <div className={styles.main_right1}>
            <Card display="block">
              <h3 className={styles.card_title}>Curva característica do item</h3>
              {/* O Gráfico agora recebe o objeto de mapeamento */}
              <ICCChart 
                itemSelection={selectedItems} 
                logic={chartLogic}
                area={activeArea}
                lastItemActive={lastItemActivate}
                onFilterChange={(filtered) => setActiveCodes(filtered)}
              />
            </Card>
          </div>
          <div className={styles.main_right2}>
            <Card display="block">
              <h3 className={styles.card_title}>Probabilidades</h3>
              <ProbsTable 
                logic={chartLogic}
                activeCodes={activeCodes}
                area={activeArea}
              />
            </Card>
          </div>
        </div>
      </div>   
    </main>
  );
}