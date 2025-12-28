  import React from "react";
  import styles from "./components.module.css"
import { useSidebar } from "../../context/sidebar_context";

  interface ChartCardProps {
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
  }: ChartCardProps) {

    const { isExpanded } = useSidebar();

    return (
      <>
        <div className={styles.cardContainer} style={{ width }} key={isExpanded ? 'open' : 'closed'}>
          <div 
            className={styles.chartWrapper} 
            style={{ height, justifyContent, display}}
          >
            {children}
          </div>
        </div>
      </>
    )
  }