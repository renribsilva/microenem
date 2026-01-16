"use client";

import { createContext, useContext, useMemo, ReactNode, useRef, useState, useCallback, useEffect } from "react";
import { useParams } from "next/navigation"; // Para capturar o ano da URL
import { useHomeData } from "./home_context";
import { useDescribe } from "../hooks/use_describe_data"; 
import constantes from "../app/(home)/json/constantes.json";

const DynamicYearContext = createContext<any>(null);

export function DynamicYearProvider({ children }: { children: ReactNode }) {
  const params = useParams();
  // Se sua rota for [...year], params.year será um array. Pegamos o primeiro item.
  const currentYear = Array.isArray(params.year) ? params.year[0] : params.year || "2019";

  const { deferredArea, selectedRowId, chartLogic } = useHomeData();
  const { describeData } = useDescribe(deferredArea);
  const { selectedLabel } = chartLogic;

  // Estados para os JSONs carregados dinamicamente
  const [itensData, setItensData] = useState<any>(null);
  const [scoreData, setScoreData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- CARGA DINÂMICA DE JSON POR ANO ---
  useEffect(() => {
    async function loadYearlyData() {
      setLoading(true);
      try {
        // Carrega os JSONs baseados no ano da URL
        const [itens, score] = await Promise.all([
          import(`../app/(home)/${currentYear}/json/itens_${currentYear}.json`),
          import(`../app/(home)/${currentYear}/resposta-ao-item/json/score_table.json`)
        ]);
        setItensData(itens.default);
        setScoreData(score.default);
      } catch (err) {
        console.error(`Erro ao carregar dados do ano ${currentYear}:`, err);
      } finally {
        setLoading(false);
      }
    }
    loadYearlyData();
  }, [currentYear]);

  //---------------------------DIFICULDADE DO EXAME---------------------------
  // (Mantido igual à sua lógica original, apenas usando as funções utilitárias)
  const labelMap: Record<string, string> = {
    mean: "Média", median: "Mediana", mode: "Moda", sd: "Desvio Padrão",
    min: "Mínima", max: "Máxima", skew: "Assimetria", kurtosis: "Curtose",
    q1: "1º quartil", q3: "3º quartil", p99: "Percentil 99"
  };
  const rowOrder = ["mean", "median", "mode", "min", "max", "sd", "q1", "q3", "p99", "skew", "kurtosis"];

  const formatValue = (key: string, val: any, type: 'nota' | 'acerto') => {
    if (typeof val !== "number") return val;
    const isSpecial = key === 'skew' || key === 'kurtosis';
    return val.toLocaleString('pt-BR', { 
      maximumFractionDigits: isSpecial ? 2 : (type === 'nota' ? 1 : 0), 
      minimumFractionDigits: 0 
    });
  };

  const tableData = useMemo(() => {
    if (!describeData?.notas) return [];
    return rowOrder
      .filter(key => describeData.notas[key] !== undefined)
      .map((key) => ({
        id: key, 
        metric: labelMap[key] || key,
        nota: formatValue(key, describeData.notas[key], 'nota'),
        acerto: formatValue(key, describeData.acertos?.[key], 'acerto')
      }));
  }, [describeData, deferredArea]);

  const describeRowData = useMemo(() => ({
    data: tableData,
    n: describeData?.notas?.n || 0,
    raw: describeData 
  }), [tableData, describeData]);

  //--------------------------PROBABILIDADE E INFO--------------------------
  const abandonadosCodes = useMemo(() => {
    const codes = new Set<number>();
    if (itensData?.CO_ITEM && itensData?.IN_ITEM_ABAN) {
      itensData.CO_ITEM.forEach((code: number, index: number) => {
        if (itensData.IN_ITEM_ABAN[index] === 1) codes.add(code);
      });
    }
    return codes;
  }, [itensData]);

  const FIXED_PALETTE = useMemo(() => 
    Array.from({ length: 45 }, (_, i) => `hsl(${(i * 360) / 45}, 70%, 50%)`), 
  []);

  const areaIdx = constantes.area.indexOf(deferredArea || "LC");
  const d = constantes.d[areaIdx];
  const k = constantes.k[areaIdx];
  const [co_p_selected] = selectedLabel.split('_');

  const [probData, setProbData] = useState<any>(null);
  const [infoData, setInfoData] = useState<any>(null);
  const [probLabels, setProbLabels] = useState<any>([]);
  const [infoLabels, setInfoLabels] = useState<any>([]);

  // Cache invalidado quando o ano muda
  const probCache = useRef<{ co_p: string; year: string; dataset: any; labels: any } | null>(null);

  useEffect(() => {
    if (!co_p_selected || loading) return;

    async function fetchTracingData() {
      try {
        // Agora o fetch aponta para /api/[year]/...
        const [resProb, resInfo] = await Promise.all([
          fetch(`/api/${currentYear}/probtrace?co_p=${co_p_selected}`),
          fetch(`/api/${currentYear}/info?co_p=${co_p_selected}`)
        ]);
        
        const jsonProb = await resProb.json();
        const jsonInfo = await resInfo.json();

        setProbData(jsonProb.dataset);
        setProbLabels(jsonProb.theta_labels);
        setInfoData(jsonInfo.dataset);
        setInfoLabels(jsonInfo.theta_labels);
      } catch (err) {
        console.error("Erro ao carregar dados da API:", err);
      } 
    }
    fetchTracingData();
  }, [co_p_selected, currentYear, loading]);

  //--------------------------LOGICA DE SELEÇÃO--------------------------

  const getCodeByLabel = useCallback((num: number, label: string) => {
    if (!label || !itensData) return null;
    const parts = label.split('_');
    const co_p = parts[0];
    const ling = parts[1] || "0";
    
    const idx = Object.keys(itensData.CO_POSICAO).find(i => {
      const matchProva = Number(itensData.CO_PROVA[i]) === Number(co_p);
      const matchPos = Number(itensData.CO_POSICAO[i]) === num;
      if (!matchProva || !matchPos) return false;
      if (deferredArea === 'LC' && num <= 5) {
        return Number(itensData.TP_LINGUA[i]) === Number(ling);
      }
      return true;
    });
    return idx ? Number(itensData.CO_ITEM[idx]) : null;
  }, [deferredArea, itensData]);

  const [selectedItems, setSelectedItems] = useState<Record<number, any>>({});
  // ... (Restante das funções handleToggle e acertosData seguindo o padrão de usar currentYear)

  if (loading) return null; // Ou um skeleton

  return (
    <DynamicYearContext.Provider value={{ 
      year: currentYear,
      describeRowData, 
      scoreData,
      itensData,
      probData,
      probLabels,
      infoData,
      infoLabels,
      selectedItems,
      getCodeByLabel,
      // ... espalhe o restante dos valores
    }}>
      {children}
    </DynamicYearContext.Provider>
  );
}

export const useDynamicData = () => useContext(DynamicYearContext);