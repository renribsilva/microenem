import Link from "next/link";
import Card from "../../../components/tsx/card";
import styles from "./sources.module.css";

function Sources() {
  return (
    <section className={styles.layout_main}>
      <Card>
        <h1>Código aberto</h1>
        <div className={styles.layout_section}>
          <div className={styles.sources_item}>
            <p>Pacote R para análise exploratória dos microdados do ENEM</p>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href={"https://github.com/renribsilva/microEnemAnalyze"}
            >
              github.com/renribsilva/microEnemAnalyze
            </Link>
          </div>
          <div className={styles.sources_item}>
            <p>
              Aplicação web para apresentaçao visual dos microdados do ENEM
              (este saite)
            </p>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href={"https://github.com/renribsilva/microenem"}
            >
              github.com/renribsilva/microenem
            </Link>
          </div>
          <div className={styles.sources_item}>
            <p>
              API hospedado no Render para executar a reprodução da TRI por meio
              de um script R
            </p>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href={"https://github.com/renribsilva/microenemAPI"}
            >
              github.com/renribsilva/microenemAPI
            </Link>
          </div>
        </div>
      </Card>
    </section>
  );
}

export default Sources;
