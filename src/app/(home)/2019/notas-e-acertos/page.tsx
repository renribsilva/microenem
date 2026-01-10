"use client";

import styles from "./notas-e-acertos.module.css"
import { TabsNavigation } from "../../../../components/tsx/tab_navigation";
import { useState } from "react";
import Card from "../../../../components/tsx/card";

import tccData from "../json/tcc.json"
import InputShell from "../../../../components/tsx/input_shell";

const menuItems = [
  { id: 'LC', label: 'Linguagens' },
  { id: 'CH', label: 'Humanas' },
  { id: 'CN', label: 'Natureza' },
  { id: 'MT', label: 'Matemática' },
];

export default function QuestoesPage() {
  
  const [activeArea, setActiveArea] = useState("LC");

  return (
    <main className={styles.main_container}>      
      <nav className={styles.nav_container}>
        <TabsNavigation 
          items={menuItems} 
          activeId={activeArea} 
          onTabChange={setActiveArea} 
        />
      </nav>
      {/* <Card>
        <InputShell logic={chartLogic} />
      </Card> */}
      <div className={styles.main_top}>
        <Card>
          <h3 className={styles.card_title}>Acertos esperados por proeficiência</h3>
        </Card>
      </div>   
      <div className={styles.main_bottom}>

      </div> 
    </main>
  );
}