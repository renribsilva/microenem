"use client";

import { DescribeTable } from "./components/tables/describe";
import styles from "./dados-do-exame.module.css"
import { TabsNavigation } from "../../../../components/tsx/tab_navigation";
import { Suspense, useEffect, useState } from "react";
import Card from "../../../../components/tsx/card";
import { useTccLogic } from "../../../../hooks/use_tcc_logic";
import dynamic from "next/dynamic";

// JSON Data
import tccData from "../json/tcc.json"

// Imports dinâmicos
const TCCChart = dynamic(() => import("./components/graphs/tcc"), { ssr: false })
const DensityNotasChart = dynamic(() => import("./components/graphs/density_notas"), { ssr: false })
const FrequencyAcertosChart = dynamic(() => import("./components/graphs/frequency_acertos"), { ssr: false })

const menuItems = [
  { id: 'LC', label: 'Linguagens' },
  { id: 'CH', label: 'Humanas' },
  { id: 'CN', label: 'Natureza' },
  { id: 'MT', label: 'Matemática' },
];

export default function DadosDoExame() {

  const [activeArea, setActiveArea] = useState("LC");
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const chartLogic = useTccLogic(tccData.datasets, activeArea);

  const handleTabChange = (id: string) => {
    setActiveArea(id);
    setSelectedRow(null); 
  };

  return (
    <section className={styles.main}>      
      <nav className={styles.nav}>
        <TabsNavigation 
          items={menuItems} 
          activeId={activeArea} 
          onTabChange={handleTabChange} 
        />
      </nav>
      <div className={styles.main_top}>
        <div className={styles.main_left}>
          <Card className={styles.card_describe}>
            <h3 className={styles.card_describe_title}>Descrição estatística de {activeArea}</h3>
            <DescribeTable 
              area={activeArea}
              selectedRowId={selectedRow?.id}
              onRowClick={(row: any) => setSelectedRow(row)}
            />
          </Card>
        </div>
        <div className={styles.main_right}>
          <div className={styles.main_right_top} style={{ minWidth: 0, minHeight: 0 }}>
            <Card className={styles.card_density}>
              <Suspense fallback={<p>...</p>}>
                <DensityNotasChart area={activeArea} highlightItem={selectedRow} />
              </Suspense>
            </Card>
            <Card className={styles.card_frequency}>
              <Suspense fallback={<p>...</p>}>
                <FrequencyAcertosChart area={activeArea} highlightItem={selectedRow} />
              </Suspense>
            </Card>
          </div>
          <div className={styles.main_right_bottom} style={{ minWidth: 0, minHeight: 0 }}>
            <Card className={styles.card_tcc}>
              <Suspense fallback={<p>...</p>}>
                <TCCChart logic={chartLogic}/>
              </Suspense>
            </Card>
          </div>
        </div>
      </div>   
    </section>
  );
}