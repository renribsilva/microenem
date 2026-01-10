"use client";

import styles from "./dados-dos-itens.module.css"
import { TabsNavigation } from "../../../../components/tsx/tab_navigation";
import { useState } from "react";
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

type ItemStatus = 'acerto' | 'erro';
type ItemData = {
  status: ItemStatus;
  posicao: number;
};
type ItemSelection = Record<number, ItemData>;

export default function DadosDoExame() {
  // TUDO VEM DO CONTEXTO PAI AGORA
  const { 
    activeArea, 
    deferredArea, 
    chartLogic, 
    handleTabChange, 
    isUpdating 
  } = useHomeData();

  // Estados locais que são específicos desta página de "Itens" permanecem aqui
  const [selectedItems, setSelectedItems] = useState<ItemSelection>({});
  const [lastItemActivate, setLastItemActivate] = useState<number>(0);
  const [activeCodes, setActiveCodes] = useState<number[]>([]);

  return (
    // Aplicamos a opacidade isUpdating para feedback visual de carregamento
    <main className={styles.main} style={{ opacity: isUpdating ? 0.7 : 1, transition: 'opacity 0.1s' }}>   
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
                area={deferredArea} // Usamos deferredArea para evitar lag visual
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
                area={deferredArea}
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
                area={deferredArea}
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