"use client";

import { DescribeTable } from "./components/tables/describe";
import styles from "./dados-do-exame.module.css"
import { TabsNavigation } from "../../../../components/tsx/tab_navigation";
import { Suspense, useState, useDeferredValue } from "react";
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

// Componente simples para o loading enquanto o deferredValue não processa
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
    <span style={{ opacity: 0.5 }}>Carregando dados...</span>
  </div>
);

export default function DadosDoExame() {
  // 1. Estado da UI: Muda instantaneamente ao clicar (Nav fluida)
  const [activeArea, setActiveArea] = useState("LC");
  
  // 2. Valor Adiado: O React prioriza a renderização da aba e 
  // deixa o processamento pesado para milissegundos depois
  const deferredArea = useDeferredValue(activeArea);

  const [selectedRow, setSelectedRow] = useState<any>(null);

  // 3. A lógica pesada agora depende do valor ADIADO
  const chartLogic = useTccLogic(tccData.datasets, deferredArea);

  const handleTabChange = (id: string) => {
    setActiveArea(id); // Muda a cor do botão na hora
    setSelectedRow(null); 
  };

  // Verifica se o conteúdo ainda está "atrás" da aba selecionada
  const isUpdating = activeArea !== deferredArea;

  return (
    <section className={styles.main} style={{ 
      opacity: isUpdating ? 0.7 : 1, 
      transition: 'opacity 0.15s ease' 
    }}>      
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
            <h3 className={styles.card_describe_title}>
              Descrição estatística de {activeArea}
            </h3>
            {/* Tabela usando o valor adiado para não travar a Nav */}
            <DescribeTable 
              area={deferredArea}
              selectedRowId={selectedRow?.id}
              onRowClick={(row: any) => setSelectedRow(row)}
            />
          </Card>
        </div>

        <div className={styles.main_right}>
          <div className={styles.main_right_top} style={{ minWidth: 0, minHeight: 0 }}>
            <Card className={styles.card_density}>
              <Suspense fallback={<Skeleton />}>
                <DensityNotasChart area={deferredArea} highlightItem={selectedRow} />
              </Suspense>
            </Card>
            <Card className={styles.card_frequency}>
              <Suspense fallback={<Skeleton />}>
                <FrequencyAcertosChart area={deferredArea} highlightItem={selectedRow} />
              </Suspense>
            </Card>
          </div>

          <div className={styles.main_right_bottom} style={{ minWidth: 0, minHeight: 0 }}>
            <Card className={styles.card_tcc}>
              <Suspense fallback={<Skeleton />}>
                {/* O gráfico só re-renderiza quando o deferredArea atualizar */}
                <TCCChart logic={chartLogic}/>
              </Suspense>
            </Card>
          </div>
        </div>
      </div>   
    </section>
  );
}