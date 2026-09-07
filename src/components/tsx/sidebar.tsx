import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./components.module.css";
import Footer from "./footer";
import { useSidebar } from "../../context/sidebar_context";
import Link from "next/link";
import { useHomeData } from "../../context/home_context";
import clsx from "clsx";
import DropdownSidebar from "./dropdown_sidebar";

interface SubItemsItem {
  name: string;
  path: string;
}

type GenerateSubItemsType = (year: string) => SubItemsItem[];

const generateItems: GenerateSubItemsType = (year) => [
  { name: "Visão geral", path: `/${year}/visao-geral` },
  { name: "Dificuldade do exame", path: `/${year}/dificuldade-do-exame` },
  { name: "Probabilidade e Info", path: `/${year}/probabilidade-e-info` },
  { name: "Resposta ao item", path: `/${year}/resposta-ao-item` },
  { name: "Relação notas/acertos", path: `/${year}/notas-e-acertos` },
  { name: "Redação", path: `/${year}/redacao` },
  { name: "Médias simples", path: `/${year}/media-simples` },
  { name: "TRI e parâmetros", path: `/${year}/tri` },
];

function AppSidebar() {
  const { pathName, currentYear } = useHomeData();
  const isActive = useCallback((path: string) => path === pathName, [pathName]);
  const { isMobileOpen, isMobile, toggleMobileSidebar } = useSidebar();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      )
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const items = generateItems(String(currentYear ? currentYear : "2025"));

  const renderMenuItems = (Items: SubItemsItem[]) => (
    <ul className={styles.navbar_subitems_list}>
      {Items.map((i) => {
        return (
          <li
            key={i.name}
            className={clsx(
              styles.navbar_subitems_items,
              isActive(i.path) && styles.navbar_subitems_items_active,
            )}
          >
            <Link
              href={i.path}
              onClick={handleItemClick}
              className={styles.navbar_subitems_links}
            >
              {i.name}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  const sidebarClass =
    isMobile && isMobileOpen
      ? `${styles.appsidebar_container} ${styles.appsidebar_mobile_open}`
      : styles.appsidebar_container;

  const handleItemClick = () => {
    if (isMobile && isMobileOpen) {
      toggleMobileSidebar();
    }
  };

  const [prevPathname, setPrevPathname] = useState(pathName);

  if (pathName !== prevPathname) {
    setPrevPathname(pathName);
  }

  return (
    <aside className={sidebarClass}>
      <div className={styles.appsidebar_topper}>
        <div className={styles.appsidebar_dropdown}>
          <DropdownSidebar
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            handleItemClick={handleItemClick}
          />
        </div>
        <div className={styles.appsidebar_navbar}>{renderMenuItems(items)}</div>
        <div className={styles.appsidebar_hr_box}>
          <hr className={styles.appsidebar_hr} />
        </div>
        <div className={styles.appsidebar_footer}>
          <Footer />
        </div>
      </div>
    </aside>
  );
}

export default AppSidebar;
