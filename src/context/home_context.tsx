"use client";

import { createContext, useContext, useState, useDeferredValue, useMemo, ReactNode, useEffect, useRef } from "react";
import { useChartTheme } from '../hooks/use_chart_theme';
import { useParams } from "next/navigation";

const HomeContext = createContext<any>(null);

export function HomeProvider({ children }: { children: ReactNode }) {

  // ----------------------------------------------------
  // ---------------- DEFINIÇÕES INICIAIS ---------------
  // ----------------------------------------------------

  const [activeArea, setActiveArea] = useState("LC");
  const deferredArea = useDeferredValue(activeArea);
  const [selectedRowId, setSelectedRowId] = useState<string | null>("mean");
  const { colorMap } = useChartTheme();

  const [activeDataset, setActiveDataset] = useState<any | null>(null);
  const [availableDatasets, setAvailableDatasets] = useState<any[]>([]);
  const datasetsCache = useRef<{ label: string; data: any } | null>(null);

  const [selectionsByArea, setSelectionsByArea] = useState<Record<string, string>>({
    "LC": "511_0",
    "CH": "507",
    "CN": "503",
    "MT": "515"
  });

  // ---------------------------------------------------------------
  // ---------------- PARÂMETROS PARA CARGA DINÂMICA ---------------
  // ---------------------------------------------------------------

  const params = useParams();
  const currentYear = Array.isArray(params.year) ? params.year[0] : params.year || "2019";

  // --------------------------------------------------------------------------------
  // ---------------- CARGA DINÂMICA DE JSON POR ANO (BUNDLE INICIAL) ---------------
  // --------------------------------------------------------------------------------

  const [dicData, setDicData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadYearlyData() {
      setLoading(true);
      try {
        // Importação dinâmica baseada no ano da URL
        const itens = await import(`../app/(home)/JSON/${currentYear}/dic_${currentYear}.json`);
        setDicData(itens.default);
      } catch (err) {
        console.error(`Erro ao carregar dados do ano ${currentYear}:`, err);
      } finally {
        setLoading(false);
      }
    }
    loadYearlyData();
  }, [currentYear]);

  const dicMap = useMemo(() => {
    if (!dicData || !dicData.codigo) return new Map();    
    return new Map(
      dicData.codigo.map((cod: any, i: number) => [
        cod, 
        { cor: dicData.cor[i], aplicacao: dicData.aplicacao[i] }
      ])
    );
  }, [dicData]);

  // ---------------------------------------------------------------------
  // ---------------- CARGA DINÂMICA DE JSON POR ANO (API) ---------------
  // ---------------------------------------------------------------------

  const selectedLabel = selectionsByArea[deferredArea];
  const setSelectedLabel = (newLabel: string) => {
    setSelectionsByArea(prev => ({ ...prev, [deferredArea]: newLabel }));
  };

  useEffect(() => {
    if (datasetsCache.current?.label === selectedLabel) {
      setActiveDataset(datasetsCache.current.data);
      return;
    }
    async function loadData() {
      try {
        const res = await fetch(`/api/tcc?area=${deferredArea}&co_p=${selectedLabel}&year=${currentYear}`);
        if (!res.ok) return;
        const json = await res.json();        
        datasetsCache.current = {
          label: selectedLabel,
          data: json.dataset,
        };
        setActiveDataset(json.dataset);
        setAvailableDatasets(json.availableDatasets);
        if (json.label && json.label !== selectedLabel) {
           setSelectionsByArea(prev => ({ ...prev, [deferredArea]: json.label }));
        }
      } catch (err) {
        console.error("Erro ao buscar dataset:", err);
      }
    }
    loadData();
  }, [deferredArea, selectedLabel]);

  // ------------------------------------------------------
  // ---------------- OUTROS PROCESSAMENTOS ---------------
  // ------------------------------------------------------

  const [userPointIndex, setUserPointIndex] = useState<number | null>(null);

  const initialIndex = useMemo(() => {
    if (!activeDataset?.labels_x?.length) return 0;
    return 0;
  }, [activeDataset]);    

  const pointIndex = userPointIndex !== null ? userPointIndex : initialIndex;

  // CORREÇÃO: Dependência do dicMap adicionada e check de segurança
  const currentInfo = useMemo(() => {
    if (!activeDataset?.metadata || dicMap.size === 0) {
      return { fullText: "Carregando...", corNome: "..." };
    }
    const { codigo, lingua } = activeDataset.metadata;
    const info = dicMap.get(codigo);
    
    if (!info) return { fullText: `Caderno ${codigo}`, corNome: "" };    
    
    let textoBase = info.cor;    
    if (deferredArea === 'LC' && (lingua === 0 || lingua === 1)) {
      textoBase += lingua === 0 ? " (Inglês)" : " (Espanhol)";
    }
    return { fullText: `${textoBase} - ${info.aplicacao}`, corNome: info.cor };
  }, [activeDataset, deferredArea, dicMap]);

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
      handleTabChange: (id: string) => { setActiveArea(id) }, 
      isUpdating: activeArea !== deferredArea || loading,
      dicData
    }}>
      {children}
    </HomeContext.Provider>
  );
}

export const useHomeData = () => useContext(HomeContext);