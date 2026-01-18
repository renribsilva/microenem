'use client'

import PersonText from "../../../../components/svg/person_text"
import Card from "../../../../components/tsx/card"
import NotasRedacaoChart from "./components/graphs/notas"
import StatusRedacaoTable from "./components/tables/status"
import styles from "./redacao.module.css"

export default function Redacao() {

  return (
    <section className={styles.redacao_main}>
      <div className={styles.redacao_left}>
        <Card>
          <NotasRedacaoChart />
        </Card>
      </div>
      <div className={styles.redacao_right}>
        <div className={styles.redacao_right_top}>
          <Card>
            <PersonText />
            <h3 className={styles.card_redacao_title}>Situação da redação</h3>
            <StatusRedacaoTable />
          </Card>
        </div>
        <div className={styles.redacao_right_top}>
          <Card>
            <StatusRedacaoTable />
          </Card>
        </div>
      </div>
    </section>
  )
}