"use client";

import { useEffect, useState } from "react";
import styles from "./tables.module.css";
import { useYearData } from "../../../../../../context/year_context";
import { useHomeData } from "../../../../../../context/home_context";
import { useSidebar } from "../../../../../../context/sidebar_context";
import clsx from "clsx";

export default function CandidateFullDetail() {
  const { dicData, setSelectionsByArea, setActiveArea } = useHomeData();
  const { meanData, getAreaMap, setShowPopUp, setIsLoaded, setQuestaoPopUp } =
    useYearData();
  const [activeTab, setActiveTab] = useState<"geral" | "scores">("geral");
  const { isMobile } = useSidebar();

  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
    visible: boolean;
  }>({
    text: "",
    x: 0,
    y: 0,
    visible: false,
  });

  const candidateData = meanData.candidateData;

  useEffect(() => {
    if (!candidateData) return;
    async function setSelections() {
      setSelectionsByArea({
        LC: `${candidateData.CO_PROVA_LC}_${candidateData.TP_LINGUA}_X`,
        CH: `${candidateData.CO_PROVA_CH}_X_X`,
        CN: `${candidateData.CO_PROVA_CN}_X_X`,
        MT: `${candidateData.CO_PROVA_MT}_X_X`,
      });
    }
    setSelections();
  }, [candidateData, setSelectionsByArea]);

  const handleMouseMove = (e: React.MouseEvent, text: string) => {
    const isRightSide = e.clientX > window.innerWidth / 2;
    setTooltip({
      text,
      // Se estiver na direita, subtrai o offset (aparece na esquerda)
      // Se estiver na esquerda, soma o offset (aparece na direita)
      x: isRightSide ? e.clientX - 160 : e.clientX + 15,
      y: e.clientY - 10,
      visible: true,
    });
  };

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

  const linguaEstrangeira =
    candidateData.TP_LINGUA === 0 ? "Inglês" : "Espanhol";

  const areas = [
    {
      label: isMobile
        ? `LC (${linguaEstrangeira.slice(0, 3)})`
        : `Linguagens (${linguaEstrangeira})`,
      key: "LC",
      nota: candidateData.NU_NOTA_LC,
      score: candidateData.SCORE_LC,
      cod: candidateData.CO_PROVA_LC,
    },
    {
      label: isMobile ? "CH" : "Humanas",
      key: "CH",
      nota: candidateData.NU_NOTA_CH,
      score: candidateData.SCORE_CH,
      cod: candidateData.CO_PROVA_CH,
    },
    {
      label: isMobile ? "CN" : "Natureza",
      key: "CN",
      nota: candidateData.NU_NOTA_CN,
      score: candidateData.SCORE_CN,
      cod: candidateData.CO_PROVA_CN,
    },
    {
      label: isMobile ? "MT" : "Matemática",
      key: "MT",
      nota: candidateData.NU_NOTA_MT,
      score: candidateData.SCORE_MT,
      cod: candidateData.CO_PROVA_MT,
    },
  ];

  return (
    <section className={styles.candidate_container}>
      {/* TOOLTIP FLUTUANTE */}
      {tooltip.visible && (
        <div
          className={styles.custom_tooltip}
          style={{ left: tooltip.x + 15, top: tooltip.y - 10 }}
        >
          {tooltip.text}
        </div>
      )}
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
                  const map = getAreaMap(
                    area.cod,
                    candidateData.TP_LINGUA,
                    area.score,
                  );
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
            {/* Adicione este bloco da legenda aqui */}
            <div className={styles.legend_container}>
              <div className={styles.legend_item}>
                <span className={`${styles.dot} ${styles.correct}`}></span>
                <span>Acerto</span>
              </div>
              <div className={styles.legend_item}>
                <span className={`${styles.dot} ${styles.wrong}`}></span>
                <span>Erro</span>
              </div>
              <div className={styles.legend_item}>
                <span className={`${styles.dot} ${styles.abandoned}`}></span>
                <span>Anulada</span>
              </div>
            </div>
            {areas.map((area) => {
              const map = getAreaMap(
                area.cod,
                candidateData.TP_LINGUA,
                area.score,
              );
              return (
                <div key={area.key} className={styles.score_block}>
                  <h4 className={styles.score_h4}>{area.label}</h4>
                  <div className={styles.score_dots_grid}>
                    {map.map((item, idx) => {
                      const statusText =
                        item.status === "correct"
                          ? "Acerto"
                          : item.status === "wrong"
                            ? "Erro"
                            : "Anulada";
                      const tpContent = `Questão ${item.pos}: ${statusText}`;
                      return (
                        <button
                          key={idx}
                          className={`${styles.dot} ${styles[item.status]}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveArea(area.key);
                            setShowPopUp(true);
                            setQuestaoPopUp(item.co_item);
                            setIsLoaded(false);
                          }}
                          onMouseMove={(e) => handleMouseMove(e, tpContent)}
                          onMouseLeave={() =>
                            setTooltip({ ...tooltip, visible: false })
                          }
                        />
                      );
                    })}
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
