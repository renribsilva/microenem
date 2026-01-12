"use client";

import { createContext, useContext, useState, useDeferredValue, useMemo, ReactNode, useEffect, useRef } from "react";
import dic from "../app/(home)/2019/json/dic_2019.json"; 
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

  const [activeDatasets, setActiveDatasets] = useState<any[] | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string>("511_0"); 

  const datasetsCache = useRef<{ area: string; data: any; } | null>(null);

  useEffect(() => {
    if (datasetsCache.current?.area === deferredArea) {
      setActiveDatasets(datasetsCache.current.data);
      return;
    }
    async function loadData() {
      try {
        const res = await fetch(`/api/tcc?area=${deferredArea}`);
        if (!res.ok) return;
        const json = await res.json();        
        datasetsCache.current = {
          area: deferredArea,
          data: json.datasets,
        };
        setActiveDatasets(json.datasets);
      } catch (err) {
        console.error("Erro ao buscar dataset:", err);
      }
    }
    loadData();
  }, [deferredArea]);

  // 2. Sincronização de Label: Se a área mudar e o label não existir, reseta para o primeiro
  useEffect(() => {
    if (activeDatasets && activeDatasets.length > 0) {
      const exists = activeDatasets.find(d => d.label === selectedLabel);
      if (!exists) {
        setSelectedLabel(activeDatasets[0].label);
      }
    }
  }, [activeDatasets, selectedLabel]);

  const activeDataset = useMemo(() => {
    if (!activeDatasets || activeDatasets.length === 0) return null;
    return activeDatasets.find(d => d.label === selectedLabel) || activeDatasets[0];
  }, [activeDatasets, selectedLabel]);

  const [userPointIndex, setUserPointIndex] = useState<number | null>(null);

  const initialIndex = useMemo(() => {
    if (!activeDataset?.labels_x || activeDataset.labels_x.length === 0) return 0;
    const target = activeDataset.metadata?.b_medio_enem || 0;
    return activeDataset.labels_x.reduce((prev: any, curr: any, idx: any, arr: any) => 
      Math.abs(curr - target) < Math.abs(arr[prev] - target) ? idx : prev, 0);
  }, [activeDataset]);

  const pointIndex = userPointIndex !== null ? userPointIndex : initialIndex;

  const currentInfo = useMemo(() => {
    if (!activeDataset?.metadata) return { fullText: "Carregando...", corNome: "" };
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
    selectedLabel,
    setSelectedLabel,
    activeDataset,
    pointIndex,
    setPointIndex: setUserPointIndex,
    chartColor: colorMap[currentInfo.corNome] || "#3b82f6",
    currentInfo,
    proficienciaAtual: activeDataset?.labels_x?.[pointIndex] || 0,
    resultadoAtual: activeDataset?.data_teorico?.[pointIndex] || 0,
    xMin: Math.floor((activeDataset?.metadata?.min || 0) / 100) * 100,
    xMax: Math.ceil((activeDataset?.metadata?.max || 1000) / 100) * 100,
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