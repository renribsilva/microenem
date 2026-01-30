'use client'

import { useEffect, useState } from 'react';
import { useHomeData } from '../../../../../../context/home_context';
import { useNineteenData } from '../../../../../../context/nineteen_context';
import { useChartTheme } from '../../../../../../hooks/use_chart_theme';
import styles from "./tables.module.css"

export default function MarginImpactTable() {

  const { deferredArea, chartLogic } = useHomeData();
  const { selectedLabel } = chartLogic
  const { 
    EAPData, 
    selectedItems, 
    setSampleEAP, 
    intervalData, 
    setUpdateTrigger,
    currentYear
  } = useNineteenData();
  const { textColor, isDark } = useChartTheme();
  const [impactoDesatualizado, setImpactoDesatualizado] = useState(false);

  const handleUpdateChart = () => {
    if (Object.entries(selectedItems).length === 0) return;
    setSampleEAP(intervalData);
    setUpdateTrigger((prev: any) => !prev);
  };

  // Invalida ao mudar itens ou área
  useEffect(() => {
    if (Object.keys(selectedItems || {}).length > 0) {
      setImpactoDesatualizado(true);
    }
  }, [selectedItems, deferredArea || '', selectedLabel]);

  // Revalida quando o EAPData novo chegar
  useEffect(() => {
    setImpactoDesatualizado(false);
  }, [EAPData]);

  const impactosArray = EAPData?.impacto_individual 
    ? Object.entries(EAPData.impacto_individual)
        .map(([codigo, info]: [string, any]) => ({
          codigo,
          ...info
        }))
        .sort((a, b) => a.posicao - b.posicao)
    : [];

  const temImpacto = impactosArray.length > 0;
  const statusPorCodigo: Record<string, string> = {};

  if (selectedItems) {
    Object.entries(selectedItems).forEach(([codigo, dados]: [string, any]) => {
      if (codigo) statusPorCodigo[codigo] = dados.status;
    });
  }

  return (
    <div className={styles.impact_container}>
      <div className={styles.tcc_cabecalho}>      
        <div className={styles.tcc_title}>
          <h3 className={styles.tcc_title_h3} style={{ color: textColor }}>Impacto virtual do item</h3>
          <p className={styles.tcc_subtitle_p}>
            "Qual seria o impacto na nota final se um item tivesse o seu status invertido, mantidos os outros status inalterados?"
          </p>
        </div>
        <div className={styles.tcc_impacto}>
          {impactoDesatualizado && temImpacto && (
            <button onClick={handleUpdateChart} className={styles.update_button}>
              Recalcular Impactos
            </button>
          )}
        </div>
      </div>      
      <div className={styles.margin_container}>
        <table className={styles.margin_table}>
          <thead className={styles.margin_thead}>
            <tr className={styles.margin_tr}>
              <th className={styles.margin_th}>ITEM</th>
              <th className={styles.margin_th}>CÓDIGO</th>
              <th className={styles.margin_th}>STATUS</th>
              <th className={styles.margin_th} style={{textAlign: 'right'}}>IMPACTO</th>
            </tr>
          </thead>
          <tbody>
            {temImpacto && impactosArray.map((itemData: any) => {
              const codigoDoItem = itemData.codigo;
              const valRaw = itemData.valor;
              const isAnulado = valRaw === null || (Array.isArray(valRaw) && valRaw[0] === null);
              const valNum = isAnulado ? 0 : Number(Array.isArray(valRaw) ? valRaw[0] : valRaw);

              const statusOriginal = statusPorCodigo[codigoDoItem] || "erro";
              const labelStatus = isAnulado ? "anulado" : statusOriginal;

              let bgColor = isDark ? '#452727' : '#fef2f2'; 
              let fontColor = isDark? '#f89393' : '#dc2626';
              if (labelStatus === 'anulado') {
                bgColor = isDark ? '#1e293b' : '#f1f5f9';
                fontColor = isDark ? '#94a3b8' : '#64748b';
              } else if (labelStatus === 'acerto') {
                bgColor = isDark ? '#064e3b' : '#ecfdf5';
                fontColor = isDark ? '#6ee7b7' : '#059669';
              }

              return (
                <tr key={codigoDoItem} className={styles.margin_tr}>
                  <td className={styles.margin_td} style={{ color: '#94a3b8', fontSize: '11px' }}>{itemData.posicao}</td>
                  <td className={styles.margin_td} style={{ fontFamily: 'monospace', fontSize: '12px' }}>{codigoDoItem}</td>
                  <td className={styles.margin_td}>
                    <span style={{ padding: '4px 8px', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', background: bgColor, color: fontColor, borderRadius: '4px' }}>
                      {labelStatus}
                    </span>
                  </td>
                  <td style={{ 
                    padding: '8px', textAlign: 'right', fontWeight: '500', 
                    color: (isAnulado || impactoDesatualizado || (deferredArea === "MT" && currentYear === 2019)) ? '#64748b' : (valNum > 0 ? '#10b981' : '#f43f5e'),
                    fontFamily: 'monospace', fontSize: '13px'
                  }}>
                    {/* AQUI DESATIVA A COLUNA */}
                    {impactoDesatualizado ? '---' : (
                      isAnulado ? 'N/A' : (
                        (deferredArea === "MT" && currentYear === "2019") ? '---' : (
                          valNum > 0 ? `+${valNum.toFixed(1)}` : `${valNum.toFixed(1)}`
                        )
                      )
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!EAPData && (
          <div className={styles.eap_initial} >
            <p style={{ fontSize: '16px', fontWeight: 500 }}>
              {'Calcule o desempenho TRI pra ver o impacto virtual de cada item.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}