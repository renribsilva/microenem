"use client";

import React from "react";
import styles from "./components.module.css";
import { useSidebar } from "../../context/sidebar_context";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  fullSize?: boolean; // Padrão é false
}

function Card({ children, className = "", fullSize = false }: CardProps) {
  const { isExpanded } = useSidebar();

  const wrapperClasses = [
    styles.card_wrapper,
    fullSize ? styles.full_size : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.card_container} key={isExpanded ? "open" : "closed"}>
      <div className={wrapperClasses}>{children}</div>
    </div>
  );
}

export default Card;
