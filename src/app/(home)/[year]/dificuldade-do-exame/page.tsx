"use client";

import { DescribeTable } from "./components/tables/describe";
import styles from "./dados-do-exame.module.css"
import { TabsNavigation } from "../../../../components/tsx/tab_navigation";
import { Suspense } from "react";
import Card from "../../../../components/tsx/card";
import dynamic from "next/dynamic";
import { useHomeData } from "../../../../context/home_context";

// Imports dinâmicos mantidos
const TCCChart = dynamic(() => import("./components/graphs/tcc"), { ssr: false })
const DensityNotasChart = dynamic(() => import("./components/graphs/density_notas"), { ssr: false })
const FrequencyAcertosChart = dynamic(() => import("./components/graphs/frequency_acertos"), { ssr: false })

const menuItems = [
  { id: 'LC', label: 'Linguagens' },
  { id: 'CH', label: 'Humanas' },
  { id: 'CN', label: 'Natureza' },
  { id: 'MT', label: 'Matemática' },
];

const Skeleton = () => (
  <div style={{ 
    height: '300px', 
    width: '100%', 
    backgroundColor: 'rgba(0,0,0,0.05)', 
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <span style={{ opacity: 0.5 }}>Carregando gráfico...</span>
  </div>
);

export default function DadosDoExame() {
  
  const { 
    deferredArea,
    handleTabChange, 
    isUpdating 
  } = useHomeData();

  return (
    <section className={styles.main} style={{ 
      opacity: isUpdating ? 0.7 : 1, 
      transition: 'opacity 0.15s ease' 
    }}>      
      <nav className={styles.nav}>
        <TabsNavigation 
          items={menuItems} 
          activeId={deferredArea} 
          onTabChange={handleTabChange} 
        />
      </nav>
      <div className={styles.main_top}>
        <div className={styles.main_left}>
          <Card className={styles.card_describe}>
            <DescribeTable/>
          </Card>
        </div>
        <div className={styles.main_right}>
          <div className={styles.main_right_top} style={{ minWidth: 0, minHeight: 0 }}>
            <Card className={styles.card_density}>
              <Suspense fallback={<Skeleton />}>
                <DensityNotasChart/>
              </Suspense>
            </Card>
            <Card className={styles.card_frequency}>
              <Suspense fallback={<Skeleton />}>
                <FrequencyAcertosChart/>
              </Suspense>
            </Card>
          </div>
          <div className={styles.main_right_bottom} style={{ minWidth: 0, minHeight: 0 }}>
            <Card className={styles.card_tcc}>
              <Suspense fallback={<Skeleton />}>
                <TCCChart/>
              </Suspense>
            </Card>
          </div>
        </div>
      </div>   
    </section>
  );
}