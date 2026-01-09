import React from "react";
import styles from "./components.module.css"
import { useSidebar } from "../../context/sidebar_context";

interface CardProps {
  children: React.ReactNode;
  className?: string; // Classe para o WRAPPER
}

export default function Card({ children, className }: CardProps) {
  const { isExpanded } = useSidebar();

  return (
    <div 
      className={styles.card_container} 
      key={isExpanded ? 'open' : 'closed'}
    >
      <div className={`${styles.card_wrapper} ${className || ""}`}>
        {children}
      </div>
    </div>
  )
}