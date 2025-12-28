import { useState } from "react";
import styles from "./components.module.css"

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  items: Tab[];
}

export function Tabs({ items }: TabsProps) {

  const [activeTab, setActiveTab] = useState<string | null>(
    items && items.length > 0 ? items[0].id : null
  );

  if (!items || items.length === 0) {
    return <div className={styles.empty}>Nenhum conteúdo disponível.</div>;
  }

  return (
    <div className={styles.tab_card_container}>
      <div className={styles.tabList}>
        {items.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.activeButton : ''}`}
          >
            {tab.label}
            {activeTab === tab.id && <div className={styles.indicator} />}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {items.map((tab) => (
          <div 
            key={tab.id} 
            className={activeTab === tab.id ? '' : styles.hidden}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}