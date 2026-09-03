"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./tables.module.css";
import { useYearData } from "../../../../../../context/year_context";
import { useHomeData } from "../../../../../../context/home_context";
import { useSidebar } from "../../../../../../context/sidebar_context";
import clsx from "clsx";
import { AreaItemMap } from "../../../../../../types/year_types";

export default function CandidateFullDetail() {
  const { dicData, setActiveArea } = useHomeData();
  const {
    meanData,
    getAreaMap,
    setIsLoaded,
    setShowPopUp,
    setQuestaoPopUp,
    setListCode,
  } = useYearData();
  const [activeTab, setActiveTab] = useState<"geral" | "scores">("geral");
  const [areaMaps, setAreaMaps] = useState<{ [key: string]: AreaItemMap[] }>(
    {},
  );
  const { isMobile } = useSidebar();

  const candidateData = meanData.candidateData;

  const linguaEstrangeira =
    candidateData?.TP_LINGUA === 0 ? "Inglês" : "Espanhol";

  const areas = useMemo(
    () => [
      {
        label: isMobile
          ? `LC (${linguaEstrangeira.slice(0, 3)})`
          : `Linguagens (${linguaEstrangeira})`,
        key: "LC",
        nota: candidateData?.NU_NOTA_LC,
        score: candidateData?.SCORE_LC,
        cod: candidateData?.CO_PROVA_LC,
      },
      {
        label: isMobile ? "CH" : "Humanas",
        key: "CH",
        nota: candidateData?.NU_NOTA_CH,
        score: candidateData?.SCORE_CH,
        cod: candidateData?.CO_PROVA_CH,
      },
      {
        label: isMobile ? "CN" : "Natureza",
        key: "CN",
        nota: candidateData?.NU_NOTA_CN,
        score: candidateData?.SCORE_CN,
        cod: candidateData?.CO_PROVA_CN,
      },
      {
        label: isMobile ? "MT" : "Matemática",
        key: "MT",
        nota: candidateData?.NU_NOTA_MT,
        score: candidateData?.SCORE_MT,
        cod: candidateData?.CO_PROVA_MT,
      },
    ],
    [isMobile, linguaEstrangeira, candidateData],
  );

  useEffect(() => {
    if (!candidateData) return;

    let isMounted = true;

    async function loadMaps() {
      const maps: { [key: string]: AreaItemMap[] } = {};
      for (const area of areas) {
        if (area.cod && area.score) {
          const res = await getAreaMap(
            area.cod,
            candidateData.TP_LINGUA,
            area.score,
          );
          maps[area.key] = res;
        } else {
          maps[area.key] = [];
        }
      }
      if (isMounted) {
        setAreaMaps(maps);
      }
    }

    loadMaps();

    return () => {
      isMounted = false;
    };
  }, [candidateData, getAreaMap, areas]);

  const getProvaInfo = (codProva: number) => {
    if (!dicData || !dicData.codigo) return { cor: "#333", nome: "---" };
    const index = dicData.codigo.indexOf(codProva);
    if (index === -1) return { cor: "#333", nome: `Cód: ${codProva}` };
    const nomeCorOriginal = dicData.cor[index];
    const colorMap: { [key: string]: string } = {
      Azul: "#0070f3",
      Amarela: "#d4a522",
      Rosa: "#ff2ddc",
      Branca: "#ffffff",
      Cinza: "#808080",
      Laranja: "#ff8c00",
      Verde: "#28a745",
    };
    const hex = colorMap[nomeCorOriginal.split(" ")[0]] || "#333";
    return { cor: hex, nome: nomeCorOriginal };
  };

  if (!candidateData) return <div className={styles.fallback}>Aguarde...</div>;

  return (
    <section className={styles.candidate_container}>
      <div className={styles.full_header}>
        <div className={styles.main_info}>
          <span className={styles.rank_badge}>#{candidateData.RANKING}°</span>
          <h2 className={styles.media_title}>
            Média Simples: {Number(candidateData.MEDIA_GERAL).toFixed(2)}
          </h2>
        </div>
      </div>
      <div className={styles.tabs}>
        <button
          onClick={() => setActiveTab("geral")}
          className={clsx(
            styles.tab_btn,
            activeTab === "geral" && styles.active,
          )}
        >
          Resumo de Notas
        </button>
        <button
          onClick={() => setActiveTab("scores")}
          className={clsx(
            styles.tab_btn,
            activeTab === "scores" && styles.active,
          )}
        >
          Mapa de Acertos
        </button>
      </div>

      <div className={styles.tab_body}>
        {activeTab === "geral" ? (
          <div className={styles.geral_content}>
            <table className={styles.static_table}>
              <thead className={styles.static_thead}>
                <tr className={styles.static_tr}>
                  <th className={styles.static_th}>Área</th>
                  <th className={styles.static_th}>Nota</th>
                  <th className={styles.static_th}>Acertos</th>
                  <th className={styles.static_th}>Prova</th>
                </tr>
              </thead>
              <tbody className={styles.static_body}>
                {areas.map((area) => {
                  const info = getProvaInfo(area.cod);
                  const map = areaMaps[area.key] || [];
                  const validos = map.filter(
                    (x) => x.status !== "abandoned",
                  ).length;
                  const acertos = map.filter(
                    (x) => x.status === "correct",
                  ).length;
                  return (
                    <tr key={area.key} className={styles.static_tr}>
                      <td className={styles.static_td}>{area.label}</td>
                      <td className={styles.static_td}>{area.nota}</td>
                      <td className={styles.static_td}>
                        {acertos}/{validos}
                      </td>
                      <td className={styles.static_td}>
                        <div className={styles.prova_color_cell}>
                          <span
                            className={styles.color_circle}
                            style={{ backgroundColor: info.cor }}
                          />
                          <span
                            style={{
                              color: info.cor === "#ffffff" ? "#999" : info.cor,
                            }}
                          >
                            {info.nome}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className={styles.redacao_full_card}>
              <div className={styles.redacao_header_row}>
                <span className={styles.redacao_label}>Redação: </span>
                <strong>{candidateData.NU_NOTA_REDACAO}</strong>
              </div>
              <div>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={styles.comp_row}>
                    <span className={styles.comp_label}>C{i}</span>
                    <div className={styles.comp_bar_bg}>
                      <div
                        className={styles.comp_bar_fill}
                        style={{
                          width: (() => {
                            const notaCompetencia = candidateData[
                              `NU_NOTA_COMP${i}` as keyof typeof candidateData
                            ] as number;
                            const percentual = (notaCompetencia / 200) * 100;
                            return `${percentual}%`;
                          })(),
                        }}
                      />
                    </div>
                    <span className={styles.comp_val}>
                      {
                        candidateData[
                          `NU_NOTA_COMP${i}` as keyof typeof candidateData
                        ]
                      }
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.scores_content}>
            <div className={styles.legend_container}>
              <div className={styles.legend_item}>
                <span
                  className={`${styles.legend_dot} ${styles.correct}`}
                ></span>
                <span>Acerto</span>
              </div>
              <div className={styles.legend_item}>
                <span className={`${styles.legend_dot} ${styles.wrong}`}></span>
                <span>Erro</span>
              </div>
              <div className={styles.legend_item}>
                <span
                  className={`${styles.legend_dot} ${styles.abandoned}`}
                ></span>
                <span>Anulada</span>
              </div>
            </div>{" "}
            {areas.map((area) => {
              const map = areaMaps[area.key] || [];
              const orderedCodes = map.map((item) => item.co_item);
              return (
                <div key={area.key} className={styles.score_block}>
                  <h4 className={styles.score_h4}>{area.label}</h4>
                  <div className={styles.score_dots_grid}>
                    {map.map((item, idx) => (
                      <button
                        key={idx}
                        className={`${styles.dot} ${styles[item.status]}`}
                        onClick={() => {
                          setActiveArea(area.key);
                          setShowPopUp(true);
                          setQuestaoPopUp(item.co_item);
                          setListCode(orderedCodes);
                          setIsLoaded(false);
                        }}
                        title={`Questão ${item.pos}: ${
                          item.status === "correct"
                            ? "Acerto"
                            : item.status === "wrong"
                              ? "Erro"
                              : "Anulada"
                        }`}
                      >
                        <span className={styles.dot_number}>{item.pos}</span>
                      </button>
                    ))}{" "}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
