'use client'

import { useTheme } from "next-themes";
import styles from "./components.module.css";
import Dark from "../svg/dark";
import Light from "../svg/light";
import { useEffect, useState } from "react";

function Theme() {
  
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={styles.theme_button} style={{ visibility: 'hidden' }}><Dark/></div>;
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={resolvedTheme === "light" ? "Ativar tema escuro" : "Ativar tema claro"}
      style={{ cursor: "pointer" }}
      className={styles.theme_button}
    >
      {resolvedTheme === "light" ? (
        <Dark/>
      ) : (
        <Light/>
      )}
    </button>
  );
}

export default Theme;
