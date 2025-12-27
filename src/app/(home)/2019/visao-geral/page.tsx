'use client'

import FX_ETARIA from "./components/graphs/fx_etaria"
import styles from "./2019.module.css"
import Card from "../../../../components/tsx/card"
import SEXO from "./components/graphs/sexo"
import Group from "../../../../components/svg/group"
import Inscritos from "./json/overview/inscritos.json"
import Abstencao_dia1 from "./json/overview/presenca_dia1.json"
import Abstencao_dia2 from "./json/overview/presenca_dia2.json"
import Presence from "./components/tables/presence"
import PersonCheck from "../../../../components/svg/person_check"
import { usePathname } from "next/navigation"
import COR_RACA from "./components/graphs/cor_raca"
import PersonCancel from "../../../../components/svg/person_cancel"


const total_inscritos = Inscritos[0].total.toLocaleString('pt-BR');
const abstencao_dia1 = Abstencao_dia1[0].abst.toLocaleString('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
}) + '%';
const abstencao_dia2 = Abstencao_dia2[0].abst.toLocaleString('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
}) + '%';

export default function Page() {

  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const folderName = segments[0]; 

  return (
    <section className={styles.main}>
      <div className={styles.title}>
        <h1>
          {folderName}: visão geral
        </h1>
      </div>
      <div className={styles.block}>
        <div className={styles.block_first}>
          <div className={styles.block_first_top}>
            <div className={styles.block_first_top1}>
              <Card width={"100%"} height={"100%"}>
                <div className={styles.cards_title_container}>
                  <Group />
                  <h3 className={styles.cards_title_txt1}>Inscritos</h3>
                </div>
                <p className={styles.cards_title_txt2}>total</p>
                <p className={styles.cards_title_num}>{total_inscritos}</p>
              </Card>
            </div>
            <div className={styles.block_first_top2}>
              <Card width={"100%"} height={"100%"}>
                <div className={styles.cards_title_container}>
                  <PersonCancel />
                  <h3 className={styles.cards_title_txt1}>Abstenção</h3>
                </div>
                <p className={styles.cards_title_txt2}>dia 1</p>
                <p className={styles.cards_title_num}>{abstencao_dia1}</p>
                <p className={styles.cards_title_txt2}>dia 2</p>
                <p className={styles.cards_title_num}>{abstencao_dia2}</p>
              </Card>
            </div>
          </div>
          <div className={styles.block_first_bottom}>
            <Card width={"100%"} height={"100%"}>
              <FX_ETARIA/>
            </Card>
          </div>
        </div>
        <div className={styles.block_second}>
          <div className={styles.block_second_top}>
            <Card width={"100%"} height={"100%"}>
              <div className={styles.cards_title_container}>
                <PersonCheck />
                <h3 className={styles.cards_title_txt1}>Presença (em ao menos um dia)</h3>
              </div>
              <Presence />
            </Card>
          </div>
          <div className={styles.block_second_bottom}>
            <Card width={"100%"} height={"100%"}>
              <SEXO/> 
            </Card>
          </div>
        </div>
        <div className={styles.block_third}>
           <Card width={"100%"} height={"100%"}>
            <COR_RACA/>
          </Card>
        </div>
      </div>
    </section>
  )
}