import React from "react"
import styles from "./components.module.css"
import EnemLogo from "../svg/enem_logo"

const AppSidebar: React.FC = () => {
  return (
    <aside>
      <div className={styles.appsidebar_container}>
        <div className={styles.appsidebar_enemlogo1}>
          <EnemLogo />
        </div>
        <div className={styles.appsidebar_enemlogo2}>
          micro
        </div>
      </div>
    </aside>
  )
}

export default AppSidebar