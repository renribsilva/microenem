'use client';

import React from "react";
import Theme from "./theme_button";
import styles from "./components.module.css";
import EnemLogo from "../svg/enem_logo";
import { useSidebar } from "../../context/sidebar_context";
import MenuButton from "./menu_button";
import Link from "next/link";

const AppHeader: React.FC = () => {

  const { isMobile } = useSidebar();

  return (
    <section className={styles.appheader_container}>
      {isMobile && (
        <div className={styles.appheader_menu_container}>
          <MenuButton  />
        </div>
      )}
      <Link href= '/' className={styles.appheader_enemlogo}>
        <div>
          {/* micro&nbsp; */}
          <EnemLogo  />
          &nbsp;micro
        </div>
      </Link>
      <div>
        <Theme />
      </div>
    </section>
  );
};

export default AppHeader;