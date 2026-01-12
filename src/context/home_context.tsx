"use client";

import { createContext, useContext, useState, useDeferredValue, useMemo, ReactNode, useEffect, useRef } from "react";
import dic from "../app/(home)/2019/json/dic_2019.json"; 
import { useChartTheme } from '../hooks/use_chart_theme'; 
import { init } from "next/dist/compiled/webpack/webpack";

const dicMap = new Map(
  dic.codigo.map((cod, i) => [cod, { cor: dic.cor[i], aplicacao: dic.aplicacao[i] }])
);

const HomeContext = createContext<any>(null);

export function HomeProvider({ children }: { children: ReactNode }) {
  const [activeArea, setActiveArea] = useState("LC");
  const deferredArea = useDeferredValue(activeArea);
  const [selectedRowId, setSelectedRowId] = useState<string | null>("mean");
  const { colorMap } = useChartTheme();

  const [activeDataset, setActiveDataset] = useState<any | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string>("511_0"); 
  const [availableDatasets, setAvailableDatasets] = useState<any[]>([]);

  const datasetsCache = useRef<{ label: string; data: any } | null>(null);

  useEffect(() => {
    if (datasetsCache.current?.label === selectedLabel) {
      setActiveDataset(datasetsCache.current.data);
      return;
    }
    async function loadData() {
      try {
        const res = await fetch(`/api/2019/tcc?area=${deferredArea}&co_p=${selectedLabel}`);
        if (!res.ok) return;
        const json = await res.json();        
        datasetsCache.current = {
          label: deferredArea,
          data: json.dataset,
        };
        setActiveDataset(json.dataset);
        setAvailableDatasets(json.availableDatasets);
        setSelectedLabel(json.label)
      } catch (err) {
        console.error("Erro ao buscar dataset:", err);
      }
    }
    loadData();
  }, [deferredArea, selectedLabel]);

  const [userPointIndex, setUserPointIndex] = useState<number | null>(null);

  const initialIndex = useMemo(() => {
    if (!activeDataset?.labels_x?.length) return 0;
    return 0;
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
  }, [activeDataset, deferredArea, selectedLabel]);

  const chartLogic = {
    selectedLabel,
    setSelectedLabel,
    activeDataset,
    pointIndex,
    setPointIndex: setUserPointIndex,
    chartColor: colorMap[currentInfo.corNome] || "#3b82f6",
    currentInfo,
    availableDatasets,
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
        // setUserPointIndex(null);
      }, 
      isUpdating: activeArea !== deferredArea 
    }}>
      {children}
    </HomeContext.Provider>
  );
}

export const useHomeData = () => useContext(HomeContext);