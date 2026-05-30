import { YearProvider } from "../../../context/year_context";
import styles from "./layout.module.css";
import Navbar from "../../../components/tsx/navbar";

function YearLayout({ children }: { children: React.ReactNode }) {
  return (
    <YearProvider>
      <Navbar />
      <main>{children}</main>
      <div className={styles.table_footer}>
        Aviso: a análise dos microdados do ENEM apresentada neste saite está
        circunscrita aos dados dos que participaram de ao menos um dia da
        aplicação regular do exame (incluindo treineiros) – não inclui
        reaplicações, versões digitais ou adaptadas do exame. O motivo dessa
        exclusão reside no fato de que alguns microdados apresentam essas
        informações e outros não, além de itens exclusivos que modificam a
        dificuldade média do exame; de modo que excluí-los estabelece uma
        normalização para possíveis comparações.
      </div>
    </YearProvider>
  );
}

export default YearLayout;
