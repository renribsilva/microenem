import { useSidebar } from "../../context/sidebar_context";
import Menu from "../svg/menu";
import styles from "./components.module.css";

function MenuButton() {
  const { toggleMobileSidebar } = useSidebar();

  return (
    <button className={styles.menu_button} onClick={toggleMobileSidebar}>
      <Menu />
    </button>
  );
}

export default MenuButton;
