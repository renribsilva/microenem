"use client";

import { createContext, useContext, useMemo, ReactNode, useRef, useLayoutEffect, useState, useCallback, useEffect } from "react";
import { useHomeData } from "./home_context";
import { useDescribe } from "../hooks/use_describe_data"; 
import ItensData from "../app/(home)/2019/json/itens_2019.json";
import constantes from "../app/(home)/json/constantes.json";
import scoreData from "../app/(home)/2019/dados-dos-itens/json/score_table.json"

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

  //--------------------------------------------------------------------
  //--------------------------ERROS E ACERTOS---------------------------
  //--------------------------------------------------------------------

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
  const [probLabels, setProbLabels] = useState<any>([]);

  const probCache = useRef<{ co_p: string; dataset: any; labels: any } | null>(null);
  
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

    fetchProbData();
  }, [co_p_selected]);

  //-----------------------------------------------------------------------
  //--------------------------ITENS SELECIONADOS---------------------------
  //-----------------------------------------------------------------------

  const [selectedItems, setSelectedItems] = useState<Record<number, any>>({});
  const [lastItemActivate, setLastItemActivate] = useState<number>(0);
  const prevLabelRef = useRef(selectedLabel);
  const previousLabel = prevLabelRef.current;

  // Função para traduzir Posição (ex: questão 95) em Código (ex: 11234)
  const getCodeByLabel = useCallback((num: number, label: string) => {
    if (!label) return null;
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

  // Handler de Clique (Toggle)
  const handleToggle = useCallback((num: number, isAbandoned: boolean) => {
    const codeItem = getCodeByLabel(num, selectedLabel);
    if (!codeItem) return;

    setLastItemActivate(codeItem);

    setSelectedItems(prev => {
      const nextMapping = { ...prev };
      const current = nextMapping[codeItem];
      if (isAbandoned) {
        current ? delete nextMapping[codeItem] : nextMapping[codeItem] = { status: 'acerto', posicao: num };
        return nextMapping;
      }
      if (!current) {
        nextMapping[codeItem] = { status: 'acerto', posicao: num };
      } else if (current.status === 'acerto') {
        nextMapping[codeItem] = { status: 'erro', posicao: num };
      } else {
        delete nextMapping[codeItem];
      }      
      return nextMapping;
    });
  }, [selectedLabel, getCodeByLabel, selectedLabel]);
  
  useLayoutEffect(() => {
    if (previousLabel === selectedLabel) return;
    const ranges: any = { "LC": [1,45], "CH": [46,90], "CN": [91,135], "MT": [136,180] };
    const [start, end] = ranges[deferredArea] || [1, 45];      
    console.log("chegou ")
    setSelectedItems(prev => {
      const newMapping = { ...prev };
      console.log(newMapping)
      for (let num = start; num <= end; num++) {
        // Usamos o previousLabel estável aqui
        const oldCode = getCodeByLabel(num, previousLabel); 
        const newCode = getCodeByLabel(num, selectedLabel);
        
        if (oldCode && prev[oldCode] && newCode && oldCode !== newCode) {
          newMapping[newCode] = { ...prev[oldCode], posicao: num };
          delete newMapping[oldCode];
        }
      }
      return newMapping;
    });
    // O ref já foi atualizado no corpo, então não precisamos atualizar aqui
  }, [selectedLabel, deferredArea, getCodeByLabel, previousLabel]);

  const activeCodes = useMemo(() => {
    const codes = Object.keys(selectedItems).map(Number);
    // Filtra apenas os que existem no probData e não são abandonados
    return codes.filter(code => 
      String(code) in (probData || {})
    );
  }, [selectedItems, probData, abandonadosCodes]);

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
      selectedItems,
      lastItemActivate,
      scoreData,
      handleToggle,
      getCodeByLabel,
      activeCodes,
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