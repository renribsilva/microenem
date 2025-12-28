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
import path from "node:path";

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

const navItems: NavItem[] = [
  // {
  //   icon: <CalenderIcon />,
  //   name: "Calendar",
  //   path: "/calendar",
  // },
  {
    // icon: <PlugInIcon />,
    name: "2025",
  },
  {
    // icon: <PlugInIcon />,
    name: "2024",
  },
  {
    // icon: <PlugInIcon />,
    name: "2023",
  },
  {
    // icon: <PlugInIcon />,
    name: "2022",
  },
  {
    // icon: <PlugInIcon />,
    name: "2021",
  },
  {
    // icon: <PlugInIcon />,
    name: "2020",
  },
  {
    // icon: <PlugInIcon />,
    name: "2019",
    subItems: [
      { name: "Visão geral", path: "/2019/visao-geral" },
      { name: "Questões", path: "/2019/questoes" },
      { name: "Tabela de notas", path: "/2019/tabela-notas" }
    ],
  }
];

const AppSidebar: React.FC = () => {

  const pathname = usePathname();
  const isActive = useCallback((path: string) => path === pathname, [pathname]);
  const { isMobileOpen, isMobile, isExpanded } = useSidebar();
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
  
  // console.log(isActive(pathname))

  const renderMenuItems = (
    navItems: NavItem[]
  ) => (
    <>
      <h2 className={styles.navbar_title}>EDIÇÕES</h2>
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
                  {nav.subItems ? (
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
                <Link href={nav.path}>
                  <span>
                    {nav.name}
                  </span>
                </Link>
              )
            )}
            {nav.subItems && (
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
        <div className={styles.appsidebar_navbar}>
          {renderMenuItems(navItems)}
        </div>
      </div>
      <div className={styles.appsidebar_footer}>
        <Footer />
      </div>
    </aside>
  )
}

export default AppSidebar