// components/tsx/tabs_navigation.tsx
import styles from "./components.module.css";

interface TabItem {
  id: string;
  label: string;
}

interface TabsNavigationProps {
  items: TabItem[];
  activeId: string;
  onTabChange: (id: string) => void;
}

export function TabsNavigation({ items, activeId, onTabChange }: TabsNavigationProps) {
  return (
    <div className={styles.tab_container}>
      {items.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={styles.tab_button}
        >
          {tab.label}
          {activeId === tab.id && <div className={styles.tab_indicator} />}
        </button>
      ))}
    </div>
  );
}