"use client";

import {
  createContext,
  useContext,
  useState,
  useDeferredValue,
  useMemo,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { useChartTheme } from "../hooks/use_chart_theme";
import { useParams } from "next/navigation";
import { dicDataType, selectionsByAreaType } from "../types/context_types";

const HomeContext = createContext(null);

export function HomeProvider({ children }: { children: ReactNode }) {
  // --------------------------------------------------------------------------
  // ------------------------ DEFINIÇÕES INICIAIS -----------------------------
  // --------------------------------------------------------------------------

  // Área do conhecimento inicial é Linguagens
  const [activeArea, setActiveArea] = useState<string>("LC");
  const deferredArea = useDeferredValue<string | null>(activeArea);

  // Medida de centralidade inicial é média
  const [selectedRowId, setSelectedRowId] = useState<string>("mean");

  // Labels iniciais de cada área do conhecimento
  const [selectionsByArea, setSelectionsByArea] =
    useState<selectionsByAreaType>({
      LC: "1395_0_X",
      CH: "1383_X_X",
      CN: "1419_X_X",
      MT: "1407_X_X",
    });

  // Loading inicial
  const [loading, setLoading] = useState<boolean>(true);

  // --------------------------------------------------------------------------
  // -------------------- PARÂMETROS PARA CARGA DINÂMICA ----------------------
  // --------------------------------------------------------------------------

  const params = useParams();
  const currentYear = params.year;

  // --------------------------------------------------------------------------
  // ---------- CARGA DINÂMICA DO DICIONÁRIO POR ANO (BUNDLE INICIAL) ---------
  // --------------------------------------------------------------------------

  // Estado dependente de currentYear
  const [dicData, setDicData] = useState<dicDataType | null>(null);

  // Importa um novo JSON sempre que o parâmentro currentYear for alterado
  useEffect(() => {
    async function loadYearlyData() {
      setLoading(true);
      try {
        const itens = await import(
          `../app/(home)/JSON/${currentYear}/dic_${currentYear}.json`
        );
        setDicData(itens.default);
      } catch (err) {
        console.error(`Erro ao carregar dados do ano ${currentYear}:`, err);
      } finally {
        setLoading(false);
      }
    }
    loadYearlyData();
  }, [currentYear]);

  // (Re)mapeia os códigos das provas, associando suas respectivas propriedades
  // cor e tipo
  const dicMap = useMemo(() => {
    const map = new Map<
      dicDataType["codigo"][number],
      { cor: dicDataType["cor"][number]; tipo: dicDataType["tipo"][number] }
    >();
    if (!dicData || !dicData.codigo) return map;
    dicData.codigo.forEach((cod, i) => {
      map.set(cod, {
        cor: dicData.cor[i],
        tipo: dicData.tipo[i],
      });
    });
    return map;
  }, [dicData]);

  // ---------------------------------------------------------------------------
  // ------------------ CARGA DINÂMICA DO TCC POR ANO (API) --------------------
  // ---------------------------------------------------------------------------

  const [activeTCC, setActiveDataset] = useState(null);
  const [availableTCC, setAvailableDatasets] = useState([]);
  const tccCache = useRef(null);

  const selectedLabel = selectionsByArea[deferredArea];
  const setSelectedLabel = (newLabel: string) => {
    setSelectionsByArea((prev) => ({ ...prev, [deferredArea]: newLabel }));
  };

  useEffect(() => {
    if (
      tccCache.current?.label === selectedLabel &&
      tccCache.current?.year === currentYear
    ) {
      setActiveDataset(tccCache.current.data);
      return;
    }

    if (!currentYear || !selectedLabel || !deferredArea) return;

    async function loadData() {
      try {
        const params = new URLSearchParams({
          area: deferredArea,
          co_p: selectedLabel,
          year: currentYear.toString(),
        });
        const res = await fetch(`/api/tcc?${params}`);
        if (!res.ok) return;
        const json = await res.json();
        tccCache.current = {
          label: selectedLabel,
          data: json.dataset,
          year: currentYear,
        };
        setActiveDataset(json.dataset);
        setAvailableDatasets(json.availableTCC);
        if (json.label && json.label !== selectedLabel) {
          setSelectionsByArea((prev) => ({
            ...prev,
            [deferredArea]: json.label,
          }));
        }
      } catch (err) {
        console.error("Erro ao buscar dataset:", err);
      }
    }
    loadData();
  }, [deferredArea, selectedLabel, currentYear]);

  // ---------------------------------------------------------------------------
  // -------------------------- OUTROS PROCESSAMENTOS --------------------------
  // ---------------------------------------------------------------------------

  const [userPointIndex, setUserPointIndex] = useState<number | null>(null);

  const initialIndex = useMemo(() => {
    if (!activeTCC?.labels_x?.length) return 0;
    return 0;
  }, [activeTCC]);

  const pointIndex = userPointIndex !== null ? userPointIndex : initialIndex;

  // CORREÇÃO: Dependência do dicMap adicionada e check de segurança
  const currentInfo = useMemo(() => {
    if (!activeTCC?.metadata || dicMap.size === 0) {
      return { fullText: "Carregando...", corNome: "..." };
    }
    const { codigo, lingua } = activeTCC.metadata;
    const info = dicMap.get(codigo);

    if (!info) return { fullText: `Caderno ${codigo}`, corNome: "" };

    let textoBase = info.cor;
    if (deferredArea === "LC" && (lingua === 0 || lingua === 1)) {
      textoBase += lingua === 0 ? " (Inglês)" : " (Espanhol)";
    }
    return { fullText: `${textoBase} - ${info.tipo}`, corNome: info.cor };
  }, [activeTCC, deferredArea, dicMap]);

  const { colorMap } = useChartTheme();

  const chartLogic = {
    selectedLabel,
    setSelectedLabel,
    activeTCC,
    pointIndex,
    setPointIndex: setUserPointIndex,
    chartColor: colorMap[currentInfo.corNome] || "#3b82f6",
    currentInfo,
    availableTCC,
    proficienciaAtual: activeTCC?.labels_x?.[pointIndex] || 0,
    resultadoAtual: activeTCC?.data_teorico?.[pointIndex] || 0,
    xMin: Math.floor((activeTCC?.metadata?.min || 0) / 100) * 100,
    xMax: Math.ceil((activeTCC?.metadata?.max || 1000) / 100) * 100,
    bMedio: activeTCC?.metadata?.b_medio_enem || 0,
    getInfoCaderno: (codigo: number, lingua?: any) => {
      const info = dicMap.get(codigo);
      if (!info) return { fullText: `Caderno ${codigo}`, corNome: "" };
      let textoBase = info.cor;
      if (deferredArea === "LC" && (lingua === 0 || lingua === 1)) {
        textoBase += lingua === 0 ? " (Inglês)" : " (Espanhol)";
      }
      return { fullText: `${textoBase} - ${info.tipo}`, corNome: info.cor };
    },
  };

  const hasDigital = useMemo(() => {
    if (!availableTCC || availableTCC.length === 0) return false;
    return availableTCC.some((item) => item.metadata?.versao_digital === "D");
  }, [availableTCC, deferredArea, currentYear]);

  return (
    <HomeContext.Provider
      value={{
        activeArea,
        deferredArea,
        selectedRowId,
        setSelectedRowId,
        chartLogic,
        handleTabChange: (id: string) => {
          setActiveArea(id);
        },
        isUpdating: activeArea !== deferredArea || loading,
        dicData,
        hasDigital,
      }}
    >
      {children}
    </HomeContext.Provider>
  );
}

export const useHomeData = () => useContext(HomeContext);
