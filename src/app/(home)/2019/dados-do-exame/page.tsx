"use client";

import { DescribeTable } from "./components/tables/describe";
import styles from "./dados-do-exame.module.css"
import { TabsNavigation } from "../../../../components/tsx/tab_navigation";
import { useState } from "react";
import Card from "../../../../components/tsx/card";
import DensityNotasChart from "./components/graphs/density_notas";
import FrequencyAcertosChart from "./components/graphs/frequency_acertos";

const menuItems = [
  { id: 'LC', label: 'Linguagens' },
  { id: 'CH', label: 'Humanas' },
  { id: 'CN', label: 'Natureza' },
  { id: 'MT', label: 'Matemática' },
];

export default function DadosDoExame() {

  const [activeArea, setActiveArea] = useState("LC");
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const handleTabChange = (id: string) => {
    setActiveArea(id);
    setSelectedRow(null); // Limpa seleção ao trocar de área
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
          <Card display="block" width={'100%'} height={'100%'}>
            <h3 className={styles.card_title}>Descrição estatística de {activeArea}</h3>
            <DescribeTable 
              area={activeArea}
              selectedRowId={selectedRow?.id}
              onRowClick={(row: any) => setSelectedRow(row)}
            />
          </Card>
        </div>
        <div className={styles.main_right}>
          {/* Gráficos recebem o selectedRow e mostram a linha fixa */}
          <Card display="block" width={'100%'} height={"fit-content"}>
            <h3 className={styles.card_title}>Curva de densidade das notas</h3>
            <DensityNotasChart area={activeArea} highlightItem={selectedRow} />
          </Card>
          <Card display="block" width={'100%'} height={"fit-content"}>
            <h3 className={styles.card_title}>Frequência de acertos</h3>
            <FrequencyAcertosChart area={activeArea} highlightItem={selectedRow} />
          </Card>
        </div>
      </div>   
    </main>
  );
}