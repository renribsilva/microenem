"use client";

import { createContext, useContext, useMemo, ReactNode, useRef, useLayoutEffect, useState, useCallback, useEffect } from "react";
import { useHomeData } from "./home_context";
import { useDescribe } from "../hooks/use_describe_data"; 
import ItensData from "../app/(home)/2019/json/itens_2019.json";
import constantes from "../app/(home)/json/constantes.json";
import scoreData from "../app/(home)/2019/resposta-ao-item/json/score_table.json"

const NineteenContext = createContext<any>(null);

export function NineteenProvider({ children }: { children: ReactNode }) {

  const { deferredArea, selectedRowId, chartLogic } = useHomeData();
  const { describeData } = useDescribe(deferredArea);
  const { selectedLabel } = chartLogic

  //--------------------------------------------------------------------------
  //---------------------------DIFICULDADE DO EXAME---------------------------
  //--------------------------------------------------------------------------

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

  
  const activeSelectedRow = useMemo(() => {
    return tableData.find(row => row.id === selectedRowId) || null;
  }, [tableData, selectedRowId]);

  //------------------------------------------------------------------------
  //--------------------------PROBABILIDADE E INFO--------------------------
  //------------------------------------------------------------------------

  const abandonadosCodes = useMemo(() => {
    const codes = new Set<number>();
    const data = ItensData as any;
    if (data?.CO_ITEM && data?.IN_ITEM_ABAN) {
      data.CO_ITEM.forEach((code: number, index: number) => {
        if (data.IN_ITEM_ABAN[index] === 1) codes.add(code);
      });
    }
    return codes;
  }, []);

  // Paleta fixa para os 45 itens
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

  const probCache = useRef<{ co_p: string; dataset: any; labels: any } | null>(null);
  const infoCache = useRef<{ co_p: string; dataset: any; labels: any } | null>(null);
  
  useEffect(() => {
    if (!co_p_selected) return;
    if (probCache.current?.co_p === co_p_selected) {
      setProbData(probCache.current.dataset);
      setProbLabels(probCache.current.labels);
      return;
    }
    async function fetchProbData() {
      try {
        const res = await fetch(`/api/2019/probtrace?co_p=${String(co_p_selected)}`);
        const json = await res.json();        
        probCache.current = {
          co_p: co_p_selected,
          dataset: json.dataset,
          labels: json.theta_labels
        };
        setProbData(json.dataset);
        setProbLabels(json.theta_labels);
      } catch (err) {
        console.error("Erro ao carregar probtrace:", err);
      } 
    }

    async function fetchInfoData() {
      try {
        const res = await fetch(`/api/2019/info?co_p=${String(co_p_selected)}`);
        const json = await res.json();        
        infoCache.current = {
          co_p: co_p_selected,
          dataset: json.dataset,
          labels: json.theta_labels
        };
        setInfoData(json.dataset);
        setInfoLabels(json.theta_labels);
      } catch (err) {
        console.error("Erro ao carregar infotrace:", err);
      } 
    }

    fetchProbData();
    fetchInfoData();

  }, [co_p_selected]);

  const [selectedItems, setSelectedItems] = useState<Record<number, any>>({});
  const [lastItemActivate, setLastItemActivate] = useState<number>(0);
  const [lastItemActivateNum, setLastItemActivateNum] = useState<number>(0);
  const prevLabelRef = useRef(selectedLabel);
  const previousLabel = prevLabelRef.current;

  // Função para traduzir Posição (ex: questão 95) em Código (ex: 11234)
  const getCodeByLabel = useCallback((num: number, label: string) => {
    if (!label) return null;
    const parts = label.split('_');
    const co_p = parts[0];
    const ling = parts[1] || "0";
    const p = ItensData as any;   
    const idx = Object.keys(p.CO_POSICAO).find(i => {
      const matchProva = Number(p.CO_PROVA[i]) === Number(co_p);
      const matchPos = Number(p.CO_POSICAO[i]) === num;
      if (!matchProva || !matchPos) return false;
      if (deferredArea === 'LC' && num <= 5 && ling !== undefined) {
        return Number(p.TP_LINGUA[i]) === Number(ling);
      }
      return true;
    })
    return idx ? Number(p.CO_ITEM[idx]) : null;
  }, [deferredArea]);

  const handleToggle = useCallback((num: number, isAbandoned: boolean) => {
    // Usamos o selectedLabel atual para descobrir qual o código do item no momento do clique
    const codeItem = getCodeByLabel(num, selectedLabel);
    
    if (!codeItem) {
      console.warn(`Não foi possível encontrar o código para a posição ${num} na prova ${selectedLabel}`);
      return;
    }

    setLastItemActivate(codeItem);

    setSelectedItems(prev => {
      const nextMapping = { ...prev };
      const current = nextMapping[codeItem];

      if (isAbandoned) {
        // Se for abandonado: Toggle simples entre selecionado (cinza) e nada
        if (current) {
          delete nextMapping[codeItem];
        } else {
          nextMapping[codeItem] = { status: 'acerto', posicao: num };
        }
        return nextMapping;
      }

      // Lógica de ciclo: Nada -> Acerto (verde) -> Erro (vermelho) -> Nada
      if (!current) {
        nextMapping[codeItem] = { status: 'acerto', posicao: num };
      } else if (current.status === 'acerto') {
        nextMapping[codeItem] = { status: 'erro', posicao: num };
      } else {
        delete nextMapping[codeItem];
      }      
      return nextMapping;
    });
  }, [selectedLabel, getCodeByLabel]);

  useLayoutEffect(() => {
    if (previousLabel === selectedLabel) return;

    const ranges: Record<string, { start: number; end: number }> = {
      "LC": { start: 1, end: 45 },
      "CH": { start: 46, end: 90 },
      "CN": { start: 91, end: 135 },
      "MT": { start: 136, end: 180 },
    };

    const { start, end } = ranges[deferredArea] || { start: 1, end: 45 };

    setSelectedItems(prev => {
      const currentlySelectedCodes = Object.keys(prev).map(Number);
      if (currentlySelectedCodes.length === 0) return prev;
      const nextMapping: Record<number, any> = {};      
      const translationMap = new Map();
      for (let num = start; num <= end; num++) {
        const oldCode = getCodeByLabel(num, previousLabel);
        const newCode = getCodeByLabel(num, selectedLabel);
        
        if (oldCode && newCode) {
          translationMap.set(oldCode, { newCode, posicao: num });
        }
      }
      currentlySelectedCodes.forEach(oldCode => {
        const translation = translationMap.get(oldCode);
        if (translation) {
          nextMapping[translation.newCode] = {
            ...prev[oldCode],
            posicao: translation.posicao
          };
        } else {
          nextMapping[oldCode] = prev[oldCode];
        }
      });
      return nextMapping;
    });
    prevLabelRef.current = selectedLabel;
  }, [selectedLabel, getCodeByLabel, deferredArea]);

  const activeCodes = useMemo(() => {
    const codes = Object.keys(selectedItems).map(Number);
    return codes.filter(code => 
      String(code) in (probData || {})
    );
  }, [selectedItems, probData, abandonadosCodes]);

  //---------------------------------------------------------------------
  //--------------------------RESPOSTA AO ITEM---------------------------
  //---------------------------------------------------------------------

  //--------------------------------------------------------------------
  //--------------------------NOTAS E ACERTOS---------------------------
  //--------------------------------------------------------------------

  const [acertosNum, setAcertosNum] = useState<number | null>(null);
  const [acertosData, setAcertosData] = useState<any>(null); 
  const acertosCache = useRef<{ area: string; dataset: any } | null>(null);

  useEffect(() => {
    if (acertosCache.current?.area === deferredArea) {
      setAcertosData(acertosCache.current.dataset);
      return;
    }

    async function fetchAcertosData() {
      try {
        const targetArea = deferredArea || 'LC';
        const res = await fetch(`/api/2019/acertos?area=${String(targetArea)}`);
        const json = await res.json();   
        
        if (json.dataset) {
          acertosCache.current = {
            area: String(targetArea),
            dataset: json.dataset,
          };
          setAcertosData(json.dataset);
        }
      } catch (err) {
        console.error("Erro ao carregar item_score:", err);
      } 
    }

    fetchAcertosData();
  }, [deferredArea]);
  
  return (
    <NineteenContext.Provider value={{ 
      describeRowData, 
      activeSelectedRow,
      describeData,
      abandonadosCodes,
      FIXED_PALETTE,
      d,
      k,
      probData,
      probLabels,
      infoData,
      infoLabels,
      selectedItems,
      lastItemActivate,
      setLastItemActivate,
      lastItemActivateNum,
      setLastItemActivateNum,
      scoreData,
      handleToggle,
      getCodeByLabel,
      activeCodes,
      acertosData,
      acertosNum,
      setAcertosNum
    }}>
      {children}
    </NineteenContext.Provider>
  );
}

export const useNineteenData = () => {
  const context = useContext(NineteenContext);
  if (!context) {
    throw new Error("useNineteenData deve ser usado dentro de um NineteenProvider");
  }
  return context;
};