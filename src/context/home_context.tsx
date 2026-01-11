"use client";

import { createContext, useContext, useState, useDeferredValue, useMemo, ReactNode, useEffect, act } from "react";
import dic from "../app/(home)/2019/json/dic_2019.json"; 
import tccData from "../app/(home)/2019/json/tcc.json"; 
import { useChartTheme } from '../hooks/use_chart_theme'; 

const dicMap = new Map(
  dic.codigo.map((cod, i) => [cod, { cor: dic.cor[i], aplicacao: dic.aplicacao[i] }])
);

const HomeContext = createContext<any>(null);

export function HomeProvider({ children }: { children: ReactNode }) {
  const [activeArea, setActiveArea] = useState("LC");
  const deferredArea = useDeferredValue(activeArea);
  const [selectedRowId, setSelectedRowId] = useState<string | null>("mean");
  const { colorMap } = useChartTheme();

  // --- FALLBACK MESTRE ---
  const backupLC = useMemo(() => {
    return tccData.datasets.find(ds => ds.metadata?.area === "LC") || tccData.datasets[0];
  }, []);

  // --- LISTA DISPONÍVEL ---
  const availableDatasets = useMemo(() => {
    const filtered = tccData.datasets.filter(ds => ds.metadata?.area === deferredArea);
    return filtered.length > 0 ? filtered : [backupLC];
  }, [deferredArea, backupLC]);

  // --- INICIALIZAÇÃO CORRETA: Nunca inicia null ---
  const [internalSelectedLabel, setInternalSelectedLabel] = useState<string>(availableDatasets[0].label);

  // --- SINCRONIZAÇÃO DE SEGURANÇA ---
  // Se a área mudar e o label atual não existir na nova área, força o primeiro da lista
  useEffect(() => {
    const exists = availableDatasets.some(d => d.label === internalSelectedLabel);
    if (!exists) {
      setInternalSelectedLabel(availableDatasets[0].label);
    }
  }, [availableDatasets, internalSelectedLabel]);

  // selectedLabel agora é apenas um reflexo garantido do internal ou fallback
  const selectedLabel = useMemo(() => {
    const exists = availableDatasets.some(d => d.label === internalSelectedLabel);
    return exists ? internalSelectedLabel : availableDatasets[0].label;
  }, [internalSelectedLabel, availableDatasets]);

  const activeDataset = useMemo(() => {
    return availableDatasets.find(d => d.label === selectedLabel) || availableDatasets[0];
  }, [selectedLabel, availableDatasets]);

  // --- RESTANTE DA LÓGICA ---
  const [userPointIndex, setUserPointIndex] = useState<number | null>(null);

  const initialIndex = useMemo(() => {
    if (!activeDataset.labels_x || activeDataset.labels_x.length === 0) return 0;
    const target = activeDataset.metadata.b_medio_enem;
    return activeDataset.labels_x.reduce((prev, curr, idx, arr) => 
      Math.abs(curr - target) < Math.abs(arr[prev] - target) ? idx : prev, 0);
  }, [activeDataset]);

  const pointIndex = userPointIndex !== null ? userPointIndex : initialIndex;

  const currentInfo = useMemo(() => {
    const { codigo, lingua } = activeDataset.metadata;
    const info = dicMap.get(codigo);
    if (!info) return { fullText: `Caderno ${codigo}`, corNome: "" };    
    let textoBase = info.cor;    
    if (deferredArea === 'LC' && (lingua === 0 || lingua === 1)) {
      textoBase += lingua === 0 ? " (Inglês)" : " (Espanhol)";
    }
    return { fullText: `${textoBase} - ${info.aplicacao}`, corNome: info.cor };
  }, [activeDataset, deferredArea]);

  const chartLogic = {
    availableDatasets,
    selectedLabel,
    setSelectedLabel: setInternalSelectedLabel,
    activeDataset,
    pointIndex,
    setPointIndex: setUserPointIndex,
    chartColor: colorMap[currentInfo.corNome] || "#3b82f6",
    currentInfo,
    proficienciaAtual: activeDataset.labels_x?.[pointIndex] || 0,
    resultadoAtual: activeDataset.data?.[pointIndex] || 0,
    xMin: Math.floor((activeDataset.metadata?.min || 0) / 100) * 100,
    xMax: Math.ceil((activeDataset.metadata?.max || 1000) / 100) * 100,
    bMedio: activeDataset.metadata?.b_medio_enem || 0,
    getInfoCaderno: (codigo: number, lingua?: any) => {
      const info = dicMap.get(codigo);
      if (!info) return { fullText: `Caderno ${codigo}`, corNome: "" };
      let textoBase = info.cor;
      if (deferredArea === 'LC' && (lingua === 0 || lingua === 1)) {
        textoBase += lingua === 0 ? " (Inglês)" : " (Espanhol)";
      }
      return { fullText: `${textoBase} - ${info.aplicacao}`, corNome: info.cor };
    }
  };

  return (
    <HomeContext.Provider value={{ 
      activeArea, 
      deferredArea, 
      selectedRowId,    
      setSelectedRowId,
      chartLogic, 
      handleTabChange: (id: string) => {
        setActiveArea(id);
        setUserPointIndex(null);
      }, 
      isUpdating: activeArea !== deferredArea 
    }}>
      {children}
    </HomeContext.Provider>
  );
}

export const useHomeData = () => useContext(HomeContext);