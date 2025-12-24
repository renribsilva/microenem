'use client'

import FX_ETARIA from "./components/graphs/overview/fx_etaria"
import styles from "./2019.module.css"
import Card from "../../../components/tsx/card"

export default function Page() {
  return (
    <section className={styles.main_2019}>
      <Card>
        <FX_ETARIA/>
      </Card>
    </section>
  )
}