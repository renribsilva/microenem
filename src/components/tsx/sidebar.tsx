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

  // Referências para controlar o gesto de swipe no touch
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

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

  // Manipuladores do gesto de touch
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || !isMobileOpen) return;
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !isMobileOpen) return;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!isMobile || !isMobileOpen) return;

    const swipeDistance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50; // Mínimo em pixels para considerar swipe

    // Arrastou da direita para a esquerda além do limite mínimo
    if (swipeDistance > minSwipeDistance) {
      toggleMobileSidebar();
    }
  };

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
    <aside
      className={sidebarClass}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
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
