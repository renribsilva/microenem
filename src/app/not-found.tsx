'use client'

import { useEffect } from "react";
import styles from "../app/(home)/layout.module.css"
import { useSidebar } from "../context/sidebar_context";
import AppSidebar from "../components/tsx/sidebar";
import AppHeader from "../components/tsx/header";

export default function NotFoundLayout() {  

  const { isMobileOpen, toggleMobileSidebar, isMobile } = useSidebar();

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);

  return (
    <div className={styles.layout_container}>
      {isMobile && (
        <div 
          className={`${styles.backdrop} ${isMobileOpen ? styles.backdrop_active : ""}`}
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