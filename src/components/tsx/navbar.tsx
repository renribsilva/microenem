import { useHomeData } from "../../context/home_context";
import styles from "./components.module.css";
import { useYearData } from "../../context/year_context";
import TabsNavigation from "./tab_navigation";

const menuItems = [
  { id: "LC", label: "Linguagens" },
  { id: "CH", label: "Humanas" },
  { id: "CN", label: "Natureza" },
  { id: "MT", label: "Matemática" },
];

function Navbar() {
  const { pathName, deferredArea } = useHomeData();
  const { handleTabChange } = useYearData();

  const allowedPaths = [
    "dificuldade-do-exame",
    "probabilidade-e-info",
    "resposta-ao-item",
    "notas-e-acertos",
    "tri",
  ];

  const shouldShow = allowedPaths.some((path) => pathName.endsWith(path));

  if (!shouldShow) return null;

  return (
    <nav className={styles.nav}>
      <TabsNavigation
        items={menuItems}
        activeId={deferredArea}
        onTabChange={handleTabChange}
      />
    </nav>
  );
}

export default Navbar;
