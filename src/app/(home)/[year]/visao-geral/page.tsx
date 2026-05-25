'use client'

import { Suspense } from "react"
import dynamic from "next/dynamic"
import styles from "./visao-geral.module.css"
import Card from "../../../../components/tsx/card"
import Group from "../../../../components/svg/group"
import PersonCancel from "../../../../components/svg/person_cancel"
import { useYearData } from "../../../../context/year_context"
import Treineiros from "./components/tables/treineiros"
import PersonRemove from "../../../../components/svg/person_remove"

// Imports dinâmicos
const FX_ETARIA = dynamic(() => import("./components/graphs/fx_etaria"), { ssr: false })
const SEXO = dynamic(() => import("./components/graphs/sexo"), { ssr: false })
const COR_RACA = dynamic(() => import("./components/graphs/cor_raca"), { ssr: false })

export default function Visao() {

  const { Inscritos, Abstencao_dia1, Abstencao_dia2 } = useYearData();
  const total_inscritos = Inscritos[0].total.toLocaleString('pt-BR');
  const abstencao_dia1 = Abstencao_dia1[0].abst.toLocaleString('pt-BR', {
    minimumFractionDigits: 1, maximumFractionDigits: 1
  }) + '%';
  const abstencao_dia2 = Abstencao_dia2[0].abst.toLocaleString('pt-BR', {
    minimumFractionDigits: 1, maximumFractionDigits: 1
  }) + '%';

  return (
    <section className={styles.main}>
      <div className={styles.block1}>
        <div className={styles.block1_first}>
          <div className={styles.block1_first_left}>
            <div className={styles.block1_first_left1}>
              <Card className={styles.card_inscritos}>
                <Group />
                <h3 className={styles.card_inscritos_title}>Inscrições</h3>
                <p className={styles.card_inscritos_subtitle}>total</p>
                <p className={styles.card_inscritos_num}>{total_inscritos}</p>
              </Card>
            </div>
            <div className={styles.block1_first_left2}>
              <Card className={styles.card_abstencao}>
                <PersonCancel />
                <h3 className={styles.card_abstencao_title}>Abstenção</h3>
                <p className={styles.card_abstencao_subtitle}>dia 1</p>
                <p className={styles.card_abstencao_num}>{abstencao_dia1}</p>
                <p className={styles.card_abstencao_subtitle}>dia 2</p>
                <p className={styles.card_abstencao_num}>{abstencao_dia2}</p>
              </Card>
            </div>
          </div>
          <div className={styles.block1_first_right}>
            <Card className={styles.card_presenca}>
              <PersonRemove />
              <h3 className={styles.card_presenca_title}>Treineiros</h3>
              <div className={styles.card_presenca_table}>
                <Treineiros />
              </div>
            </Card>
          </div>
        </div>

        <div className={styles.block1_second}>
          <div className={styles.block1_second_left} style={{ minWidth: 0, minHeight: 0 }}>
            <Card className={styles.card_fxetaria}>
              <Suspense fallback={<p>Carregando gráfico...</p>}>
                <FX_ETARIA />
              </Suspense>
            </Card>
          </div>
          <div className={styles.block1_second_right} style={{ minWidth: 0, minHeight: 0 }}>
            <Card className={styles.card_sexo}>
              <Suspense fallback={<p>Carregando gráfico...</p>}>
                <SEXO />
              </Suspense>
            </Card>
          </div>
        </div>
      </div>

      <div className={styles.block2} style={{ minWidth: 0, minHeight: 0 }}>
        <div className={styles.block_third} style={{ minWidth: 0, minHeight: 0 }}>
          <Card className={styles.card_racacor}>
            <Suspense fallback={<p>Carregando gráfico...</p>}>
              <COR_RACA />
            </Suspense>
          </Card>
        </div>
      </div>
    </section>
  )
}
