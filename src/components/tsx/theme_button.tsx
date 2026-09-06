"use client";

import { useTheme } from "next-themes";
import styles from "./components.module.css";
import Dark from "../svg/dark";
import Light from "../svg/light";
import { useEffect, useState } from "react";

function Theme() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    //eslint-disable-next-line
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };

  const isDark = mounted ? resolvedTheme === "dark" : false;

  return (
    <button
      onClick={toggleTheme}
      aria-label="Alternar tema"
      style={{ cursor: "pointer", touchAction: "manipulation" }}
      className={styles.theme_button}
    >
      {isDark ? <Light /> : <Dark />}
    </button>
  );
}

export default Theme;
