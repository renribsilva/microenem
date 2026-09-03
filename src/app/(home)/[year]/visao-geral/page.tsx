"use client";

import dynamic from "next/dynamic";
import styles from "./visao-geral.module.css";
import Card from "../../../../components/tsx/card";
import { useYearData } from "../../../../context/year_context";
import P from "../../../../components/skt/visao-geral/p";

const Group = dynamic(() => import("../../../../components/svg/group"));
const PersonRemove = dynamic(
  () => import("../../../../components/svg/person_remove"),
);
const PersonCancel = dynamic(
  () => import("../../../../components/svg/person_cancel"),
);

const Treineiros = dynamic(() => import("./components/tables/treineiros"));
const FX_ETARIA = dynamic(() => import("./components/graphs/fx_etaria"));
const SEXO = dynamic(() => import("./components/graphs/sexo"));
const COR_RACA = dynamic(() => import("./components/graphs/cor_raca"));

export default function Visao() {
  const { overviewData } = useYearData();

  const inscritosData = overviewData?.inscritosData;
  const abstencaoDia1 = overviewData?.abstencaoDia1;
  const abstencaoDia2 = overviewData?.abstencaoDia2;

  const total_inscritos = inscritosData?.[0]?.total ? (
    inscritosData[0].total.toLocaleString("pt-BR")
  ) : (
    <P />
  );

  const abstencao_dia1 = abstencaoDia1?.[0]?.abst ? (
    abstencaoDia1[0].abst.toLocaleString("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }) + "%"
  ) : (
    <P />
  );

  const abstencao_dia2 = abstencaoDia2?.[0]?.abst ? (
    abstencaoDia2[0].abst.toLocaleString("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }) + "%"
  ) : (
    <P />
  );

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
          <div
            className={styles.block1_second_left}
            style={{ minWidth: 0, minHeight: 0 }}
          >
            <Card className={styles.card_fxetaria} fullSize>
              <FX_ETARIA />
            </Card>
          </div>
          <div
            className={styles.block1_second_right}
            style={{ minWidth: 0, minHeight: 0 }}
          >
            <Card className={styles.card_sexo} fullSize>
              <SEXO />
            </Card>
          </div>
        </div>
      </div>

      <div className={styles.block2} style={{ minWidth: 0, minHeight: 0 }}>
        <div
          className={styles.block_third}
          style={{ minWidth: 0, minHeight: 0 }}
        >
          <Card className={styles.card_racacor} fullSize>
            <COR_RACA />
          </Card>
        </div>
      </div>
    </section>
  );
}
