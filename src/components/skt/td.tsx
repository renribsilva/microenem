import styles from "./skt.module.css";

export default function TDMedium({ width = "50px", height = "1rem" }) {
  return (
    <span className={styles.skeletonTextMedium} style={{ width, height }} />
  );
}
