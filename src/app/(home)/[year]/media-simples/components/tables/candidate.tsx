"use client";

import { useState } from "react";
import styles from "./tables.module.css";
import { useNineteenData } from "../../../../../../context/nineteen_context";
import { useHomeData } from "../../../../../../context/home_context";

export default function CandidateFullDetail() {
  const { dicData } = useHomeData();
  const { candidateData, itensData } = useNineteenData();
  const [activeTab, setActiveTab] = useState<"geral" | "scores">("geral");
  
  const getProvaInfo = (codProva: number) => {
    if (!dicData || !dicData.codigo) return { cor: "#333", nome: "---" };
    const index = dicData.codigo.indexOf(codProva);
    if (index === -1) return { cor: "#333", nome: `Cód: ${codProva}` };
    const nomeCorOriginal = dicData.cor[index];
    const colorMap: { [key: string]: string } = {
      "Azul": "#0070f3", "Amarela": "#ffd700", "Rosa": "#ff2d55",
      "Branca": "#ffffff", "Cinza": "#808080", "Laranja": "#ff8c00", "Verde": "#28a745"
    };
    const hex = colorMap[nomeCorOriginal.split(" ")[0]] || "#333";
    return { cor: hex, nome: nomeCorOriginal };
  };

  const getAreaMap = (codProva: number, tpLingua: number, score: string) => {
    if (!itensData?.CO_PROVA || !score) return [];
    const bits = score.split("");
    const result = [];
    let pointer = 0;

    // 1. Criar array de índices para poder ordenar dados colunares
    const indices = Array.from({ length: itensData.CO_PROVA.length }, (_, i) => i);

    // 2. Ordenar os índices com base na CO_POSICAO
    indices.sort((a, b) => itensData.CO_POSICAO[a] - itensData.CO_POSICAO[b]);

    // 3. Iterar sobre os índices ordenados
    for (const i of indices) {
      if (itensData.CO_PROVA[i] === codProva) {
        // Filtro de Língua
        if (itensData.TP_LINGUA[i] !== null && itensData.TP_LINGUA[i] !== tpLingua) continue;

        result.push({
          status: itensData.IN_ITEM_ABAN[i] === 1 ? "abandoned" : (bits[pointer] === "1" ? "correct" : "wrong"),
          pos: itensData.CO_POSICAO[i]
        });
        
        // Só incrementa o pointer se o item for da língua certa (válido para o score)
        pointer++;
      }
    }
    
    // O array já sai ordenado por CO_POSICAO devido ao indices.sort
    return result;
  };

  if (!candidateData) return <div className={styles.fallback}>Aguarde...</div>;

  const areas = [
    { label: "Linguagens", key: "LC", nota: candidateData.NU_NOTA_LC, score: candidateData.SCORE_LC, cod: candidateData.CO_PROVA_LC },
    { label: "Humanas", key: "CH", nota: candidateData.NU_NOTA_CH, score: candidateData.SCORE_CH, cod: candidateData.CO_PROVA_CH },
    { label: "Natureza", key: "CN", nota: candidateData.NU_NOTA_CN, score: candidateData.SCORE_CN, cod: candidateData.CO_PROVA_CN },
    { label: "Matemática", key: "MT", nota: candidateData.NU_NOTA_MT, score: candidateData.SCORE_MT, cod: candidateData.CO_PROVA_MT },
  ];

  return (
    <section className={styles.candidate_container}>
      <div className={styles.full_header}>
        <div className={styles.main_info}>
          <span className={styles.rank_badge}>#{candidateData.RANKING}°</span>
          <h2 className={styles.media_title}>Média Geral: {candidateData.MEDIA_GERAL.toFixed(2)}</h2>
        </div>
      </div>

      <div className={styles.tabs}>
        <button onClick={() => setActiveTab("geral")} className={`${styles.tab_btn} ${activeTab === "geral" ? styles.active : ""}`}>Resumo de Notas</button>
        <button onClick={() => setActiveTab("scores")} className={`${styles.tab_btn} ${activeTab === "scores" ? styles.active : ""}`}>Mapa de Acertos</button>
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
                  <th className={styles.static_th}>Cor da Prova</th>
                </tr>
              </thead>
              <tbody className={styles.static_body}>
                {areas.map((area) => {
                  const info = getProvaInfo(area.cod);
                  const map = getAreaMap(area.cod, candidateData.TP_LINGUA, area.score);
                  const validos = map.filter(x => x.status !== "abandoned").length;
                  const acertos = map.filter(x => x.status === "correct").length;
                  return (
                    <tr key={area.key} className={styles.static_tr}>
                      <td className={styles.static_td}>{area.label}</td>
                      <td className={styles.static_td}>{area.nota}</td>
                      <td className={styles.static_td}>{acertos}/{validos}</td>
                      <td className={styles.static_td}>
                        <div className={styles.prova_color_cell}>
                          <span className={styles.color_circle} style={{ backgroundColor: info.cor, border: info.cor === "#ffffff" ? "1px solid #ddd" : "none" }} />
                          <span style={{ color: info.cor === "#ffffff" ? "#999" : info.cor }}>{info.nome}</span>
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
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={styles.comp_row}>
                    <span className={styles.comp_label}>C{i}</span>
                    <div className={styles.comp_bar_bg}>
                      <div 
                        className={styles.comp_bar_fill} 
                        style={{ width: `${(candidateData[`NU_NOTA_COMP${i}` as keyof typeof candidateData] / 200) * 100}%` }} 
                      />
                    </div>
                    <span className={styles.comp_val}>{candidateData[`NU_NOTA_COMP${i}` as keyof typeof candidateData]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.scores_content}>
            {areas.map(area => {
              const map = getAreaMap(area.cod, candidateData.TP_LINGUA, area.score)
              return (
                <div key={area.key} className={styles.score_block}>
                  <h4 className={styles.score_h4}>{area.label}</h4>
                  <div className={styles.score_dots_grid}>
                    {map.map((item, idx) => (
                      <div key={idx} className={`${styles.dot} ${styles[item.status]}`} title={`Q${item.pos}`} />
                    ))}
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