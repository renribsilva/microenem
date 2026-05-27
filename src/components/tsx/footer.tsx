import Link from "next/link";
import styles from "./components.module.css";

const currentYear = new Date().getFullYear();

function Footer() {
  return (
    <footer className={styles.footer}>
      <div>GPLv3 © {currentYear}</div>
      <div>No bullshit, just data.</div>
      <div className={styles.links_container}>
        <span>
          <a
            target="_blank"
            href="https://github.com/renribsilva/microEnemAnalyze"
            rel="noopener noreferrer"
            className={styles.link_source}
          >
            source
          </a>
        </span>
        <span className={styles.separator}> | </span>
        <span>
          <Link href="/privacy" className={styles.link_source}>
            política de privacidade
          </Link>
        </span>
      </div>
    </footer>
  );
}

export default Footer;

