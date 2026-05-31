import Card from "../../../components/tsx/card";
import styles from "./not-found.module.css";

function Custum404() {
  return (
    <section className={styles.layout_main}>
      <Card>
        <h1>Eita!!!</h1>
        <p>
          A página que você procura não foi encontrada. Para encontrar a página
          que deseja, navegue no menu.
        </p>
      </Card>
    </section>
  );
}

export default Custum404;
