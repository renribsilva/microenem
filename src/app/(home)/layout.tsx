"use client";

import AppHeader from "../../components/tsx/header";
import AppSidebar from "../../components/tsx/sidebar";
import { useSidebar } from "../../context/sidebar_context";
import styles from "./layout.module.css";
import { HomeProvider } from "../../context/home_context";

function HomeLayout({ children }: { children: React.ReactNode }) {
  const { isMobileOpen, toggleMobileSidebar, isMobile } = useSidebar();

  return (
    <HomeProvider>
      <div className={styles.layout_container}>
        {isMobile && (
          <div
            className={[
              `${styles.backdrop} `,
              `${isMobileOpen ? styles.backdrop_active : ""}`,
            ].join("")}
            onClick={toggleMobileSidebar}
          />
        )}
        <div className={styles.layout_sidebar}>
          <AppSidebar />
        </div>
        <header className={styles.layout_header}>
          <AppHeader />
        </header>
        <main className={styles.layout_main}>{children}</main>
      </div>
    </HomeProvider>
  );
}

export default HomeLayout;
