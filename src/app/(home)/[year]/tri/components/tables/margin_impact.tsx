'use client'

import { useHomeData } from '../../../../../../context/home_context';
import { useNineteenData } from '../../../../../../context/nineteen_context';
import { useChartTheme } from '../../../../../../hooks/use_chart_theme';
import styles from "./tables.module.css"

export default function MarginImpactTable() {
  const { deferredArea } = useHomeData();
  const { EAPData, selectedItems } = useNineteenData();
  const { textColor, isDark } = useChartTheme();

  // Mapeia o objeto do R [CÓDIGO: {posicao, valor}] para um array injetando o código dentro
  const impactosArray = EAPData?.impacto_individual 
    ? Object.entries(EAPData.impacto_individual)
        .map(([codigo, info]: [string, any]) => ({
          codigo,
          ...info
        }))
        .sort((a, b) => a.posicao - b.posicao)
    : [];

  const temImpacto = impactosArray.length > 0;
  const statusPorPosicao: Record<number, string> = {};
  
  if (selectedItems) {
    Object.values(selectedItems).forEach((item: any) => {
      if (item.posicao) {
        statusPorPosicao[item.posicao] = item.status;
      }
    });
  }

  return (
    <div className={styles.impact_container}>
      <div className={styles.tcc_cabecalho}>      
        <div className={styles.tcc_title}>
          <h3 className={styles.tcc_title_h3} style={{ color: textColor }}>Impacto virtual do item</h3>
          <p className={styles.tcc_subtitle_p}>
            Qual seria o impacto na nota final se a questão x o seu status invertido? 
          </p>
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
            {temImpacto && impactosArray.map((itemData: any, idx) => {
              
              const posicaoDaLinha = itemData.posicao;
              const codigoDoItem = itemData.codigo;
              const posicaoRelativa = idx + 1;
              const valRaw = itemData.valor;

              // Verificação para null ou [null]
              const isAnulado = valRaw === null || (Array.isArray(valRaw) && valRaw[0] === null);
              
              // Se for array [0.5], extrai. Se nulo, 0.
              const valorTratado = Array.isArray(valRaw) ? valRaw[0] : valRaw;
              const valNum = isAnulado ? 0 : Number(valorTratado);

              const statusOriginal = statusPorPosicao[posicaoRelativa] || "erro";
              const labelStatus = isAnulado ? "anulado" : statusOriginal;

              let bgColor = isDark ? '#973f3f' : '#fef2f2'; 
              let fontColor = isDark? '#f89393' : '#dc2626';
              
              if (labelStatus === 'anulado') {
                bgColor = isDark ? '#585a5c' : '#f1f5f9';
                fontColor = isDark ? '#d0dcec' : '#64748b';
              } else if (labelStatus === 'acerto') {
                bgColor = isDark ? '#376952' : '#ecfdf5';
                fontColor = isDark ? '#b8ffe9' : '#059669';
              }

              return (
                <tr key={codigoDoItem} className={styles.margin_tr}>
                  <td className={styles.margin_td}>
                    {posicaoDaLinha}
                  </td>
                  <td className={styles.margin_td} >
                    {codigoDoItem}
                  </td>
                  <td className={styles.margin_td}>
                    <span style={{ 
                      padding: '4px 8px', 
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      fontWeight: '500',
                      background: bgColor,
                      color: fontColor,
                    }}>
                      {labelStatus}
                    </span>
                  </td>
                  <td style={{ 
                    padding: '8px', 
                    textAlign: 'right',
                    fontWeight: '500', 
                    color: (isAnulado || deferredArea === "MT") ? '#cbd5e0' : (valNum > 0 ? '#10b981' : '#f43f5e'),
                    fontFamily: 'monospace',
                    fontSize: '13px'
                  }}>
                    {isAnulado ? 'N/A' : (
                      deferredArea === "MT" ? '---' : (
                        valNum > 0 ? `+${valNum.toFixed(1)}` : `${valNum.toFixed(1)}`
                      )
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {!temImpacto && (
          <div className={styles.margin_initial}>
            <p style={{ fontSize: '16px', fontWeight: 500 }}>
              Processe o cálculo para visualizar o impacto virtual de cada item.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}