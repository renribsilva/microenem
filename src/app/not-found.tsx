"use client";

import styles from "../app/(home)/layout.module.css";
import { useSidebar } from "../context/sidebar_context";
import AppSidebar from "../components/tsx/sidebar";
import AppHeader from "../components/tsx/header";

function NotFoundLayout() {
  const { isMobileOpen, toggleMobileSidebar, isMobile } = useSidebar();
  return (
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
      <main className={styles.layout_main}>
        <h1>404 - Página não encontrada</h1>
      </main>
    </div>
  );
}

export default NotFoundLayout;
