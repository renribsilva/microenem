'use client'

import React, { useCallback, useEffect, useRef, useState } from "react"
import styles from "./components.module.css"
import Footer from "./footer"
import { useSidebar } from "../../context/sidebar_context";
import Link from "next/link"
import { usePathname } from "next/navigation"
import Circle from "../svg/circle";
import CircleFulfill from "../svg/circle_check";
import ArrowDown from "../svg/arrow_down";
import ArrowUp from "../svg/arrow_up";

type NavItem = {
  name: string;
  // icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string }[];
};

const icons = {
  circle_check: CircleFulfill,
  circle: Circle,
  arrow_down: ArrowDown,
  arrow_up: ArrowUp
}

const anosPermitidos = ["2019", "2020", "2021", "2022"];

// Função auxiliar para gerar sub-itens com base no ano
const generateSubItems = (year: string) => [
  { name: "Visão geral", path: `/${year}/visao-geral` },
  { name: "Dificuldade do exame", path: `/${year}/dificuldade-do-exame` },
  { name: "Probabilidade e Info", path: `/${year}/probabilidade-e-info` },
  { name: "Resposta ao item", path: `/${year}/resposta-ao-item` },
  { name: "Relação notas/acertos", path: `/${year}/notas-e-acertos` },
  { name: "Redação", path: `/${year}/redacao` },
  { name: "Médias simples", path: `/${year}/media-simples` },
  // { name: "TRI", path: `/${year}/tri` },
];

const navItems: NavItem[] = [
  { name: "2025", subItems: generateSubItems("2025") },
  { name: "2024", subItems: generateSubItems("2024") },
  { name: "2023", subItems: generateSubItems("2023") },
  { name: "2022", subItems: generateSubItems("2022") },
  { name: "2021", subItems: generateSubItems("2021") },
  { name: "2020", subItems: generateSubItems("2020") },
  { name: "2019", subItems: generateSubItems("2019") },
];

const AppSidebar: React.FC = () => {

  const pathname = usePathname();
  const isActive = useCallback((path: string) => path === pathname, [pathname]);
  const { isMobileOpen, isMobile, toggleMobileSidebar} = useSidebar();
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});

  const sidebarClass = isMobile && isMobileOpen 
    ? `${styles.appsidebar_container} ${styles.appsidebar_mobile_open}` 
    : styles.appsidebar_container;

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu === index
      ) {
        return null;
      }
      return index;
    });
  };

  const handleItemClick = () => {
    if (isMobile && isMobileOpen) {
      toggleMobileSidebar();
    }
  };

  const renderMenuItems = (
    navItems: NavItem[]
  ) => (
    <>
      <ul className={styles.navbar_list}>
        {navItems.map((nav, index) => (
          <li key={nav.name} className={styles.navbar_years}>
            {!nav.path ? (
              <button
                onClick={() => handleSubmenuToggle(index)}
                className={`${styles.navbar_button} ${openSubmenu === index ? styles.navbar_button_active : ""}`}
              >
                <div className={styles.navbar_button_1}>
                  {/* {nav.subItems ? (
                    <icons.circle_check width="20px" height="20px"/>
                  ) : (
                    <icons.circle width="20px" height="20px"/>
                  )} */}
                  <span>
                    {nav.name}
                  </span>
                </div>
                <div className={styles.navbar_button_2}>
                  {nav.subItems && anosPermitidos.includes(nav.name) ? (
                    <>
                      {openSubmenu === index ? (
                        <icons.arrow_up width='20px' height="20px" />
                      ): (
                        <icons.arrow_down width='20px' height="20px" />
                      )}
                    </>
                  ) : (
                    <div className={styles.em_breve}>em breve</div>
                  )}
                </div>
              </button>
            ) : (
              nav.path && (
                <Link 
                  href={nav.path}
                  onClick={handleItemClick}
                >
                  <span>
                    {nav.name}
                  </span>
                </Link>
              )
            )}
            {nav.subItems && anosPermitidos.includes(nav.name) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`${index}`] = el;
                }}
                style={{
                  height:
                    openSubmenu === index
                      ? `${subMenuHeight[`${index}`]}px`
                      : "0px",
                }}
                className={styles.navbar_subitems}
              >
                <ul className={styles.navbar_subitems_list}>
                  {nav.subItems.map((subItem) => (
                    <li 
                      key={subItem.name}
                      className={`${styles.navbar_subitems_items} ${isActive(subItem.path) ? styles.navbar_subitems_items_active : ""}`}
                    >
                      <Link
                        href={subItem.path}
                        className={styles.navbar_subitems_links}
                        onClick={handleItemClick}
                      >
                        {subItem.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  )

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    const items = navItems
    items.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu(index);
            submenuMatched = true;
          }
        });
      }
    });
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  return (
    <aside className={sidebarClass}>
      <div className={styles.appsidebar_topper}>
        <h2 className={styles.navbar_title}>EDIÇÕES</h2>
        <div className={styles.appsidebar_navbar}>
          {renderMenuItems(navItems)}
        </div>
        <div className={styles.appsidebar_hr_box}>
          <hr className={styles.appsidebar_hr} />
        </div>
        <div className={styles.appsidebar_footer}>
          <Footer />
        </div>
      </div>
    </aside>
  )
}

export default AppSidebar