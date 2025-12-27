'use client'

import { useEffect } from "react";
import AppHeader from "../../components/tsx/header"
import AppSidebar from "../../components/tsx/sidebar";
import { useSidebar } from "../../context/sidebar_context";
import styles from "./layout.module.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {  

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
          onClick={toggleMobileSidebar} // Fecha ao clicar no escuro
        />
      )}
      <div className={styles.layout_sidebar}>
        <AppSidebar />
      </div>
      <header className={styles.layout_header}>
        <AppHeader />
      </header>
      <main className={styles.layout_main}>
        {children}
      </main>
    </div>
  );
}