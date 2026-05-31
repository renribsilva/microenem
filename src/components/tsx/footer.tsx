import Link from "next/link";
import styles from "./components.module.css";

const currentYear = new Date().getFullYear();

function Footer() {
  return (
    <footer className={styles.footer}>
      <div>GPLv3 © {currentYear}</div>
      <div>No bullshit, just data.</div>
      <div className={styles.link_container}>
        <div>
          <Link href="/sources" className={styles.link_source}>
            Código
          </Link>
        </div>
        <div>
          <Link href="/privacy" className={styles.link_source}>
            Privacidade
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
