import Link from "next/link";
import styles from "./components.module.css"

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div>GPLv3 © {currentYear}</div>
      <div>No bullshit, just data.</div>  
      <a 
        target="_blank"
        href={"https://github.com/renribsilva/microEnemAnalyze"} 
        rel="noopener noreferrer"
        className={styles.link_source}
      >
        source
      </a>
    </footer>
  );
}
