"use client";

import { createContext, useContext, useState, useDeferredValue, useMemo, ReactNode } from "react";
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
  
  // Guardamos apenas o ID da métrica para persistir entre áreas
  const [selectedRowId, setSelectedRowId] = useState<string | null>("mean");
  
  const { colorMap } = useChartTheme();

  // --- LÓGICA DO DATASET ---
  const availableDatasets = useMemo(() => {
    return tccData.datasets.filter(ds => ds.metadata?.area === deferredArea);
  }, [deferredArea]);

  const [internalSelectedLabel, setInternalSelectedLabel] = useState<string | null>(null);

  const selectedLabel = internalSelectedLabel && availableDatasets.some(d => d.label === internalSelectedLabel)
    ? internalSelectedLabel 
    : availableDatasets[0]?.label;

  const activeDataset = useMemo(() => {
    return availableDatasets.find(d => d.label === selectedLabel) || availableDatasets[0];
  }, [selectedLabel, availableDatasets]);

  // --- LÓGICA DE PONTO NA CURVA ---
  const [userPointIndex, setUserPointIndex] = useState<number | null>(null);

  const initialIndex = useMemo(() => {
    if (!activeDataset?.labels_x) return 0;
    const target = activeDataset.metadata.b_medio_enem;
    return activeDataset.labels_x.reduce((prev, curr, idx, arr) => 
      Math.abs(curr - target) < Math.abs(arr[prev] - target) ? idx : prev, 0);
  }, [activeDataset]);

  const pointIndex = userPointIndex !== null ? userPointIndex : initialIndex;

  // --- INFORMAÇÕES AUXILIARES ---
  const currentInfo = useMemo(() => {
    if (!activeDataset?.metadata) return { fullText: "", corNome: "" };
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
    proficienciaAtual: activeDataset?.labels_x?.[pointIndex] || 0,
    resultadoAtual: activeDataset?.data?.[pointIndex] || 0,
    xMin: activeDataset?.metadata?.min ? Math.floor(activeDataset.metadata.min / 100) * 100 : 0,
    xMax: activeDataset?.metadata?.max ? Math.ceil(activeDataset.metadata.max / 100) * 100 : 1000,
    bMedio: activeDataset?.metadata?.b_medio_enem || 0,
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
      selectedRowId,      // Exportamos o ID
      setSelectedRowId,    // Exportamos a função de setar o ID
      chartLogic, 
      handleTabChange: (id: string) => setActiveArea(id), 
      isUpdating: activeArea !== deferredArea 
    }}>
      {children}
    </HomeContext.Provider>
  );
}

export const useHomeData = () => useContext(HomeContext);