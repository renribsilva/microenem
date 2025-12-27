'use client'

import React, { useCallback, useRef, useState } from "react"
import styles from "./components.module.css"
import Footer from "./footer"
import { useSidebar } from "../../context/sidebar_context";
import Link from "next/link"
import { usePathname } from "next/navigation"

type NavItem = {
  name: string;
  // icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  // {
  //   icon: <CalenderIcon />,
  //   name: "Calendar",
  //   path: "/calendar",
  // },
  {
    // icon: <PlugInIcon />,
    name: "2019",
    subItems: [
      { name: "Visão geral", path: "/2019" }
    ],
  },
];

const AppSidebar: React.FC = () => {

  const pathname = usePathname();
  const { isMobileOpen, isMobile } = useSidebar();
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const isActive = useCallback((path: string) => path === pathname, [pathname]);

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

  const renderMenuItems = (
    navItems: NavItem[]
  ) => (
    <ul className={styles.navbar_list}>
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index)}
            >
              <span>
                {nav.name}
              </span>
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
            >
              <ul>
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
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
  )

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