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

  const isResolved = isMobile !== null;

  return (
    <div
      className={`${styles.tab_container} ${
        !isResolved ? styles.tab_container_loading : ""
      } ${isMobile ? styles.tab_container_mobile : ""}`}
      style={
        {
          "--tab-count": items.length,
          "--active-tab": Math.max(
            0,
            items.findIndex((tab) => tab.id === activeId),
          ),
        } as React.CSSProperties
      }
      role="tablist"
    >
      {isResolved &&
        items.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeId === tab.id}
            onClick={() => onTabChange(tab.id)}
            className={styles.tab_button}
          >
            {isMobile ? tab.id : tab.label}
          </button>
        ))}
    </div>
  );
}

export default TabsNavigation;
