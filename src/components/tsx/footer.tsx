import Link from "next/link";
import styles from "../../styles/components.module.css";
import React from "react";

const currentYear = new Date().getFullYear();

const linkfooter = [
  { label: "nextjs", href: "https://nextjs.org/" },
];

const linkProps = {
  target: "_blank",
  rel: "noopener noreferrer"
};

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <span>© {currentYear} GPLv3</span>
      <span> | </span>
      <span>
        criado com:{" "}
        {linkfooter.map(({ label, href }) => (
          <Link key={href} href={href} {...linkProps} prefetch={false}>
          {label}
        </Link>
        ))}
      </span>
    </footer>
  );
}
