"use client";

import { useMemo, useState } from "react";
import { useHomeData } from "../../../../../../context/home_context";
import { useYearData } from "../../../../../../context/year_context";
import { useChartTheme } from "../../../../../../hooks/use_chart_theme";
import styles from "./tables.module.css";
import { useSidebar } from "../../../../../../context/sidebar_context";

export default function MarginImpactTable() {
  const { deferredArea, selectedLabel, currentYear } = useHomeData();
  const { isMobile } = useSidebar();
  const { EAPData, selectedItems, getParamByLabel, getCodeByLabel } =
    useYearData();

  const { textColor, isDark } = useChartTheme();

  // Estado para o Sort
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc" | null;
  }>({
    key: "posicao",
    direction: "asc",
  });

  const paramsPorCodigo = useMemo(() => {
    const ranges = {
      LC: { start: 1, end: 45 },
      CH: { start: 46, end: 90 },
      CN: { start: 91, end: 135 },
      MT: { start: 136, end: 180 },
    };

    const { start, end } = ranges[deferredArea] || { start: 1, end: 45 };
    const map: Record<string, { a: number; b: number; c: number }> = {};

    for (let i = start; i <= end; i++) {
      const code = getCodeByLabel(i, selectedLabel);
      if (code) {
        map[code] = {
          a: getParamByLabel(i, selectedLabel, "a"),
          b: getParamByLabel(i, selectedLabel, "b"),
          c: getParamByLabel(i, selectedLabel, "c"),
        };
      }
    }
    return map;
  }, [deferredArea, selectedLabel, getCodeByLabel, getParamByLabel]);

  // Lógica de ordenação REVISADA
  const impactosArray = useMemo(() => {
    if (!EAPData?.impacto_individual) return [];
    console.log(EAPData.impacto_individual);
    const baseArray = Object.entries(EAPData.impacto_individual).map(
      ([codigo, info]) => {
        const params = paramsPorCodigo[codigo];
        const valRaw = info.valor;
        const valNum =
          valRaw === null || (Array.isArray(valRaw) && valRaw[0] === null)
            ? -999
            : Number(Array.isArray(valRaw) ? valRaw[0] : valRaw);

        return {
          codigo,
          ...info,
          a: params?.a ?? 0,
          b: params?.b ?? 0,
          c: params?.c ?? 0,
          valorNum: valNum,
        };
      },
    );

    if (sortConfig.direction) {
      baseArray.sort((a, b) => {
        let valA = a[sortConfig.key as keyof typeof a];
        let valB = b[sortConfig.key as keyof typeof b];

        // Força ordenação numérica para chaves conhecidas
        if (["posicao", "a", "b", "c"].includes(sortConfig.key)) {
          valA = Number(valA);
          valB = Number(valB);
        }

        if (sortConfig.key === "impacto") {
          valA = a.valorNum;
          valB = b.valorNum;
        }

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return baseArray;
  }, [EAPData, paramsPorCodigo, sortConfig]);

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" | null = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    } else if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = null;
    }
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key: string) => {
    const sortedState = sortConfig.key === key ? sortConfig.direction : null;
    return (
      <span
        style={{
          fontSize: "10px",
          marginLeft: "4px",
          opacity: sortedState ? 1 : 0.5,
        }}
      >
        {{
          asc: " 🔼",
          desc: " 🔽",
        }[sortedState as string] ?? " ↕️"}
      </span>
    );
  };

  const temImpacto = impactosArray.length > 0;

  const isTRIDivergente =
    (deferredArea === "MT" && currentYear === "2009") ||
    (deferredArea === "MT" && currentYear === "2019");
  // || (deferredArea === "CN" && currentYear === "2021")

  return (
    <div className={styles.impact_container}>
      <div className={styles.tcc_cabecalho}>
        <div className={styles.tcc_title}>
          <h3 className={styles.tcc_title_h3} style={{ color: textColor }}>
            Impacto virtual do item
          </h3>
          <p className={styles.tcc_subtitle_p}>
            &quot Qual seria o impacto na nota final se um item tivesse o seu
            status invertido, mantidos os outros status inalterados?&quot
          </p>
        </div>
      </div>

      <div className={styles.margin_container}>
        <table className={styles.margin_table}>
          <thead className={styles.margin_thead}>
            <tr className={styles.margin_tr}>
              <th
                className={styles.margin_th}
                onClick={() => requestSort("posicao")}
                style={{ cursor: "pointer" }}
              >
                ITEM {renderSortIcon("posicao")}
              </th>
              {!isMobile && (
                <th
                  className={styles.margin_th}
                  onClick={() => requestSort("codigo")}
                  style={{ cursor: "pointer" }}
                >
                  CÓDIGO {renderSortIcon("codigo")}
                </th>
              )}
              <th className={styles.margin_th}>STATUS</th>
              <th
                className={styles.margin_th}
                onClick={() => requestSort("a")}
                style={{ cursor: "pointer" }}
              >
                a¹ {renderSortIcon("a")}
              </th>
              {!isMobile && (
                <th
                  className={styles.margin_th}
                  onClick={() => requestSort("b")}
                  style={{ cursor: "pointer" }}
                >
                  b² {renderSortIcon("b")}
                </th>
              )}
              {!isMobile && (
                <th
                  className={styles.margin_th}
                  onClick={() => requestSort("c")}
                  style={{ cursor: "pointer" }}
                >
                  c³ {renderSortIcon("c")}
                </th>
              )}
              <th
                className={styles.margin_th}
                onClick={() => requestSort("impacto")}
                style={{ cursor: "pointer", textAlign: "right" }}
              >
                IMPACTO {renderSortIcon("impacto")}
              </th>
            </tr>
          </thead>
          <tbody>
            {temImpacto &&
              impactosArray.map((itemData) => {
                const codigoItem = itemData.codigo;
                const params = paramsPorCodigo[codigoItem];
                const valRaw = itemData.valor;
                const isAnulado =
                  valRaw === null ||
                  (Array.isArray(valRaw) && valRaw[0] === null);
                const valNum = isAnulado
                  ? 0
                  : Number(Array.isArray(valRaw) ? valRaw[0] : valRaw);
                const statusOriginal =
                  selectedItems[codigoItem]?.status || "erro";
                const labelStatus = isAnulado ? "anulado" : statusOriginal;

                let bgColor = isDark ? "#452727" : "#fef2f2";
                let fontColor = isDark ? "#f89393" : "#dc2626";

                if (labelStatus === "anulado") {
                  bgColor = isDark ? "#1e293b" : "#f1f5f9";
                  fontColor = isDark ? "#94a3b8" : "#64748b";
                } else if (labelStatus === "acerto") {
                  bgColor = isDark ? "#064e3b" : "#ecfdf5";
                  fontColor = isDark ? "#6ee7b7" : "#059669";
                }

                return (
                  <tr key={codigoItem} className={styles.margin_tr}>
                    <td className={styles.margin_td}>{itemData.posicao}</td>
                    {!isMobile && (
                      <td className={styles.margin_td}>{codigoItem}</td>
                    )}
                    <td className={styles.margin_td}>
                      <span
                        style={{
                          padding: "4px 8px",
                          fontSize: "11px",
                          textTransform: "uppercase",
                          fontWeight: "600",
                          background: bgColor,
                          color: fontColor,
                          borderRadius: "4px",
                        }}
                      >
                        {labelStatus}
                      </span>
                    </td>
                    <td className={styles.margin_td}>
                      {params?.a?.toFixed(3) ?? "—"}
                    </td>
                    {!isMobile && (
                      <td className={styles.margin_td}>
                        {params?.b?.toFixed(3) ?? "—"}
                      </td>
                    )}
                    {!isMobile && (
                      <td className={styles.margin_td}>
                        {params?.c?.toFixed(3) ?? "—"}
                      </td>
                    )}
                    <td
                      style={{
                        padding: "8px",
                        textAlign: "right",
                        fontWeight: "500",
                        color:
                          isAnulado || isTRIDivergente
                            ? "#64748b"
                            : valNum > 0
                              ? "#10b981"
                              : "#f43f5e",
                        fontFamily: "monospace",
                        fontSize: "13px",
                      }}
                    >
                      {isAnulado
                        ? "N/A"
                        : isTRIDivergente
                          ? "---"
                          : valNum > 0
                            ? `+${valNum.toFixed(1)}`
                            : `${valNum.toFixed(1)}`}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>

        {!EAPData && (
          <div className={styles.eap_initial}>
            <p style={{ fontSize: "16px", fontWeight: 500 }}>
              Calcule o desempenho TRI para ver o impacto virtual de cada item.
            </p>
          </div>
        )}
      </div>
      <div className={styles.table_footer}>
        <div>
          ¹ Parâmetro de discriminação: é o poder de discriminação do item para
          diferenciar os participantes que dominam dos participantes que não
          dominam a habilidade avaliada.
        </div>
        {!isMobile && (
          <>
            <div>
              ² Parâmetro de dificuldade: associado à dificuldade do item, sendo
              que quanto maior seu valor, mais difícil é o item.
            </div>
            <div>
              ³ Parâmetro de acerto ao acaso: é a probabilidade de um
              participante acertar o item não dominando a habilidade exigida.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
