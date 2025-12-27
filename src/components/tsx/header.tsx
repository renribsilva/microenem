'use client';

import React from "react";
import Theme from "./theme_button";
import styles from "./components.module.css";
import EnemLogo from "../svg/enem_logo";
import { useSidebar } from "../../context/sidebar_context";
import MenuButton from "./menu_button";

const AppHeader: React.FC = () => {

  const { isMobile } = useSidebar();

  return (
    <section className={styles.appheader_container}>
      {isMobile && (
        <div>
          <MenuButton />
        </div>
      )}
      <div className={styles.appheader_enemlogo}>
        <EnemLogo  />
        &nbsp;&nbsp;micro
      </div>
      <div>
        <Theme />
      </div>
    </section>
  );
};

export default AppHeader;