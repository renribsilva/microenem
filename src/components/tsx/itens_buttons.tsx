'use client'

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useChartTheme } from "../../hooks/chart_theme";
import ItensData from "../../app/(home)/2019/json/itens_2019.json"
import styles from "./components.module.css"

// Tipagem rigorosa para evitar erros
type ItemStatus = 'acerto' | 'erro';
type ItemData = {
  status: ItemStatus;
  posicao: number; // Aqui guardamos o CO_POSICAO
};
type ItemSelection = Record<number, ItemData>;

interface Props {
  logic: any;
  area: string;
  selectedItems: ItemSelection;
  setSelectedItems: React.Dispatch<React.SetStateAction<ItemSelection>>;
  setLastItemActivate: React.Dispatch<React.SetStateAction<number>>;
}

export default function ItensButtons({ 
  logic, 
  area, 
  selectedItems, 
  setSelectedItems,
  setLastItemActivate,
}: Props) {
  if (!logic) return null;

  const { 
    chartColor,
    currentInfo,
    availableDatasets,
    getInfoCaderno,
    setSelectedLabel,
    selectedLabel,
  } = logic;

  const { colorMap, panelColor, textColor, gridColor, isDark } = useChartTheme();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevLabelRef = useRef(selectedLabel);
  const [backdropAlert, setBackdropAlert] = useState<any | null>(false)
  const containerRef = useRef<HTMLDivElement>(null);

  const abandonadosCodes = useMemo(() => {
    const codes = new Set<number>();
    const data = ItensData as any;
    if (data?.CO_ITEM && data?.IN_ITEM_ABAN) {
      data.CO_ITEM.forEach((code: number, index: number) => {
        if (data.IN_ITEM_ABAN[index] === 1) {
          codes.add(code);
        }
      });
    }
    return codes;
  }, []);

  const ranges: Record<string, { start: number; end: number }> = {
    "LC": { start: 1, end: 45 },
    "CH": { start: 46, end: 90 },
    "CN": { start: 91, end: 135 },
    "MT": { start: 136, end: 180 },
  };

  const { start, end } = ranges[area] || { start: 1, end: 45 };
  const questions = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  
  const getCodeByLabel = useCallback((num: number, label: string) => {
    const [co_p, ling] = label.split('_');
    const p = ItensData as any;     
    const idx = Object.keys(p.CO_POSICAO).find(i => {
      const matchPos = Number(p.CO_POSICAO[i]) === num;
      const matchProva = Number(p.CO_PROVA[i]) === Number(co_p);
      
      if (num > 5) return matchPos && matchProva;
      
      return matchPos && matchProva && Number(p.TP_LINGUA[i]) === Number(ling);
    });

    return idx ? Number(p.CO_ITEM[idx]) : null;
  }, []);

  // 2. Remapeamento atualizado para preservar a posição
  useLayoutEffect(() => {
    if (prevLabelRef.current !== selectedLabel) {
      setSelectedItems(prev => {
        const newMapping = { ...prev };        
        questions.forEach(num => {
          const oldCode = getCodeByLabel(num, prevLabelRef.current);
          const newCode = getCodeByLabel(num, selectedLabel);
          if (oldCode && prev[oldCode] && newCode) {
            const oldData = prev[oldCode];           
            if (oldCode !== newCode) {
              delete newMapping[oldCode];
              newMapping[newCode] = { 
                status: oldData.status, 
                posicao: num 
              };
            }
          }
        });
        
        return newMapping;
      });
      prevLabelRef.current = selectedLabel;
    }
  }, [selectedLabel, setSelectedItems, getCodeByLabel, questions]);

  function handleToggle(num: number, e?: React.MouseEvent<HTMLButtonElement>) {
    const codeItem = getCodeByLabel(num, selectedLabel);
    if (!codeItem) return;
    
    setLastItemActivate(codeItem);
    const isAbandoned = abandonadosCodes.has(codeItem);

    setBackdropAlert(isAbandoned)

    if (isAbandoned) {
      const rect = e.currentTarget.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();

      setBackdropAlert({
        num: num,
        x: rect.left + rect.width / 2,
        y: rect.top,
        // Guardamos os limites do container pai
        limitLeft: (containerRect?.left || 0) + 95,
        limitRight: (containerRect?.right || window.innerWidth) - 95
      });
    } else {
      setBackdropAlert(null)
    }

    setSelectedItems(prev => {
      const nextMapping = { ...prev };
      const current = nextMapping[codeItem];
      if (isAbandoned) {
        if (!current) {
          nextMapping[codeItem] = { status: 'acerto', posicao: num }; 
        } else {
          delete nextMapping[codeItem];
        }
        return nextMapping;
      }

      // LÓGICA NORMAL: Ciclo de 3 estados
      if (!current) {
        // 1º CLIQUE: ACERTO
        nextMapping[codeItem] = { status: 'acerto', posicao: num };
      } else if (current.status === 'acerto') {
        // 2º CLIQUE: MUDA PARA ERRO (preservando a posição)
        nextMapping[codeItem] = { status: 'erro', posicao: num };
      } else {
        // 3º CLIQUE: REMOVE
        delete nextMapping[codeItem];
      }      
      return nextMapping;
    });
  }

  return (
    <section>
      {/* Dropdown de Prova */}
      <div style={{ position: 'relative', zIndex: 10, marginBottom: '20px' }} ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          // EFEITO DE HOVER AQUI
          style={{
            padding: '10px 16px', borderRadius: '8px', border: `1px solid ${gridColor}`,
            backgroundColor: panelColor, color: textColor, cursor: 'pointer', display: 'flex',
            alignItems: 'center', gap: '10px', fontSize: '0.9rem',
            fontWeight: '600', width: '100%', justifyContent: 'space-between'
          }}
        >
          <span>
            Prova: <span style={{ color: chartColor }}>{currentInfo.fullText}</span>
          </span>
          <span style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>▼</span>
        </button>

        {isOpen && (
          <div style={{
            position: 'absolute', top: '110%', left: 0, right: 0,
            backgroundColor: panelColor, border: `1px solid ${gridColor}`, borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', maxHeight: '300px', overflowY: 'auto', zIndex: 20
          }}>
            {availableDatasets.map((ds) => {
              const info = getInfoCaderno(ds.metadata.codigo, ds.metadata.lingua);
              return (
                <div
                  key={ds.label}
                  onClick={() => { setSelectedLabel(ds.label); setIsOpen(false); }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = gridColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = panelColor;
                  }}
                  style={{
                    padding: '12px 16px', cursor: 'pointer', fontSize: '0.85rem',
                    backgroundColor: selectedLabel === ds.label ? (isDark ? '#232527ff' : '#f1f5f9') : 'transparent',
                    color: selectedLabel === ds.label ? (colorMap[info.corNome] || textColor) : textColor,
                    borderLeft: `4px solid ${selectedLabel === ds.label ? (colorMap[info.corNome] || '#475569') : 'transparent'}`,
                  }}
                >
                  {info.fullText}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid de Botões */}
      <div ref={containerRef} className={styles.itens_container}>
        {questions.map((num) => {
          const thisCodeItem = getCodeByLabel(num, selectedLabel);
          const status = thisCodeItem ? selectedItems[thisCodeItem]?.status : null;
          const isAbandoned = thisCodeItem ? abandonadosCodes.has(thisCodeItem) : false;

          const getStyles = () => {
            // Se for abandonado e estiver selecionado: Cor Neutra (Cinza)
            if (isAbandoned && status) {
              return { 
                bg: isDark ? '#4a4a4a' : '#94a3b8', 
                text: '#fff', 
                border: 'transparent' 
              };
            }
            // Cores normais
            if (status === 'acerto') return { bg: '#22c55e', text: '#fff', border: 'transparent' };
            if (status === 'erro') return { bg: '#ef4444', text: '#fff', border: 'transparent' };
            
            // Estado Inativo
            return { bg: panelColor, text: textColor, border: chartColor + '55' };
          };

          const s = getStyles();

          return (
            <button
              key={num}
              onClick={(e) => handleToggle(num, e)}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = 'brightness(1.2)';
                if (!status) {
                  e.currentTarget.style.backgroundColor = isDark ? gridColor : gridColor;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'none';
                e.currentTarget.style.backgroundColor = s.bg;
              }}
              style={{
                aspectRatio: '1/1',
                borderRadius: '6px',
                border: `2px solid ${s.border}`,  
                backgroundColor: s.bg,
                color: s.text,
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.1s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                opacity: isAbandoned && !status ? 0.6 : 1 
              }}
            >
              {num}
              {isAbandoned && (
                <span style={{ 
                  position: 'absolute', 
                  top: '1px', 
                  right: '2px', 
                  fontSize: '8px' 
                }}>⚠️</span>
              )}
            </button>
          )
        })}
      </div>
      <div className={styles.itens_rodape}>
        <strong>Dica:</strong>
        <br></br>
        <span>1º clique (verde): probabilidade de acerto</span>
        <br></br>
        <span>2º clique (vermelho): probabilidade de erro</span>
        <br></br>
        <span>3º clique (sem cor): item desativado</span>
      </div>
      {backdropAlert && (
        <>
          <div 
            className={`${styles.backdrop} ${styles.backdrop_active}`}
            onClick={() => setBackdropAlert(null)}
          />
          <div className={styles.backdrop_msg}
            style={{
              position: 'fixed',
              left: `clamp(${backdropAlert.limitLeft}px, ${backdropAlert.x}px, ${backdropAlert.limitRight}px)`,
              top: backdropAlert.y - 10, 
              transform: 'translate(-50%, -100%)',
              zIndex: 9999,
              backgroundColor: '#ef4444',
              color: '#fff',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              width: 'fit-content',
              textAlign: 'center',
              pointerEvents: 'none',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
              transition: 'opacity 0.2s ease' 
            }}
          >
            <strong>Item {backdropAlert.num} abandonado.</strong>
            <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.9 }}>
              Não teve participação no <br /> cálculo da nota final.
            </p>
            {/* SETINHA */}
            <div style={{
              position: 'absolute', bottom: '-5px', left: '50%', transform: 'translateX(-50%)',
              borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
              borderTop: '5px solid #ef4444'
            }} />
          </div>
        </>
      )}
    </section>
  );
}