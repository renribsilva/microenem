import React from "react";
import Theme from "./theme_button";
import styles from "./components.module.css"

const AppHeader: React.FC = () => {
  return (
    <section className={styles.header_container}>
      <Theme />
    </section>
  )
}

export default AppHeader