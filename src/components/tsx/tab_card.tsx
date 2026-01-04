import { useState } from "react";
import styles from "./components.module.css"

interface Itens {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsCardProps {
  items: Itens[];
  height?: string | number;
  width?: string | number;
  justifyContent?: string;
  display?: string;
  flexDirection?: string
}

export function TabsCard({ 
  items,
  height = "300px",
  width = "100%",
}: TabsCardProps) {

  const [activeTab, setActiveTab] = useState<string | null>(
    items && items.length > 0 ? items[0].id : null
  );

  if (!items || items.length === 0) {
    return <div className={styles.empty}>Nenhum conteúdo disponível.</div>;
  }

  return (
    <div className={styles.tab_card_container} style={{ width }}>
      <div className={styles.tab_card_wrapper} style={{ height }} >
        <div className={styles.tab_card_list}>
          {items.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={styles.tab_card_button}
            >
              {tab.label}
              {activeTab === tab.id && <div className={styles.tab_card_indicator} />}
            </button>
          ))}
        </div>
        <div className={styles.tab_card_content}>
          {items.map((tab) => (
            <div 
              key={tab.id} 
              className={activeTab === tab.id ? '' : styles.tab_card_hidden}
            >
              {tab.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}