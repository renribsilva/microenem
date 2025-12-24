  import React from "react";
  import styles from "./components.module.css"

  interface ChartCardProps {
    children: React.ReactNode;
    height?: string | number;
    width?: string | number;
  }

  export default function Card({
    children,
    height = "300px",
    width = "300px"
  }: ChartCardProps) {
    return (
      <>
        <div className={styles.cardContainer} style={{ width }}>
          <div 
            className={styles.chartWrapper} 
            style={{ height }}
          >
            {children}
          </div>
        </div>
      </>
    )
  }