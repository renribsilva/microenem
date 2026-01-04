  import React from "react";
  import styles from "./components.module.css"
import { useSidebar } from "../../context/sidebar_context";

  interface CardProps {
    children: React.ReactNode;
    height?: string | number;
    width?: string | number;
    justifyContent?: string
    display?: string
  }

  export default function Card({
    children,
    height = "300px",
    width = "100%",
    justifyContent = "center",
    display = "flex"
  }: CardProps) {

    const { isExpanded } = useSidebar();

    return (
      <>
        <div className={styles.card_container} style={{ width }} key={isExpanded ? 'open' : 'closed'}>
          <div 
            className={styles.card_wrapper} 
            style={{ height, justifyContent, display}}
          >
            {children}
          </div>
        </div>
      </>
    )
  }