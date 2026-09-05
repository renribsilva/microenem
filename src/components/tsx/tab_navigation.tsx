import { useSidebar } from "../../context/sidebar_context";
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

function TabsNavigation({ items, activeId, onTabChange }: TabsNavigationProps) {
  const { isMobile } = useSidebar();
  return (
    <div className={styles.tab_container}>
      {items.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={styles.tab_button}
        >
          {isMobile ? tab.id : tab.label}
          {activeId === tab.id && <div className={styles.tab_indicator} />}
        </button>
      ))}
    </div>
  );
}

export default TabsNavigation;
