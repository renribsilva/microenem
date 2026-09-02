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
import { useParams, usePathname } from "next/navigation";
import {
  ActiveTCCType,
  AvailableTCCType,
  chartPropsType,
  DicDataType,
  GetMetadataType,
  HomeContextType,
  PointIndexType,
  SelectionsByAreaType,
  TCCCacheType,
} from "../types/home_types";

const HomeContext = createContext<HomeContextType | null>(null);

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
    useState<SelectionsByAreaType>({
      LC: "1459_0_X",
      CH: "1447_X_X",
      CN: "1483_X_X",
      MT: "1471_X_X",
    });

  // Extrai o rótulo da prova de acordo com a área ativa
  const selectedLabel = selectionsByArea[deferredArea];

  // Função auxiliar para alterar os rótulos das provas por área
  const setSelectedLabel = (newLabel: string) => {
    setSelectionsByArea((prev) => ({ ...prev, [deferredArea]: newLabel }));
  };

  // Loading inicial
  const [loading, setLoading] = useState<boolean>(true);

  // Parâmetro para carga dinâmica
  const params = useParams();
  const currentYear = params.year;
  const pathName = usePathname();

  // --------------------------------------------------------------------------
  // ---------- CARGA DINÂMICA DO DICIONÁRIO POR ANO (BUNDLE INICIAL) ---------
  // --------------------------------------------------------------------------

  const [dicData, setDicData] = useState<DicDataType | null>(null);

  // Importa a API sempre que o parâmetro currentYear for alterado
  useEffect(() => {
    if (!currentYear) return;
    async function loadYearlyData() {
      setLoading(true);
      try {
        const response = await fetch(`/api/dic?year=${currentYear}`);
        if (!response.ok) throw new Error("Erro ao carregar dados da API");
        const data = await response.json();
        setDicData(data);
      } catch (err) {
        console.error(`Erro ao carregar dados do ano ${currentYear}:`, err);
      } finally {
        setLoading(false);
      }
    }
    loadYearlyData();
  }, [currentYear]);

  const dicMap = useMemo(() => {
    const map = new Map<
      DicDataType["codigo"][number],
      { cor: DicDataType["cor"][number]; tipo: DicDataType["tipo"][number] }
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

  // Função auxiliar para extrair metadados do dicionário
  const getMetadata: GetMetadataType = (codigo, lingua) => {
    const info = dicMap.get(codigo);
    if (!info) return { fullText: `Caderno ${codigo}`, corNome: "" };
    let textoBase = info.cor;
    if (deferredArea === "LC" && (lingua === 0 || lingua === 1)) {
      textoBase += lingua === 0 ? " (Inglês)" : " (Espanhol)";
    }
    return { fullText: `${textoBase}`, corNome: info.cor };
  };

  // ---------------------------------------------------------------------------
  // ------------------ CARGA DINÂMICA DO TCC POR ANO (API) --------------------
  // ---------------------------------------------------------------------------

  // Prepara estados e referência para receber dados do TCC (curva
  // caracterísitca do tste)
  const [activeTCC, setActiveTCC] = useState<ActiveTCCType | null>(null);
  const [availableTCC, setAvailableTCC] = useState<AvailableTCCType | null>(
    null,
  );

  // Prepara cache para dados do tcc
  const tccCache = useRef<TCCCacheType | null>(null);

  useEffect(() => {
    // Primeiro, tenta buscar os dados do tcc no cache
    if (
      tccCache.current?.resLabel === selectedLabel &&
      tccCache.current?.year === Number(currentYear)
    ) {
      setActiveTCC(tccCache.current.activeTCC);
      setAvailableTCC(tccCache.current.availableTCC);
      return;
    }

    if (!currentYear || !selectedLabel || !deferredArea) return;

    // Api assíncrona que busca os dados do tcc seletivamente
    async function loadData() {
      try {
        const params = new URLSearchParams({
          area: deferredArea,
          label: selectedLabel,
          year: currentYear.toString(),
        });
        const res = await fetch(`/api/tcc?${params}`);
        if (!res.ok) return;
        const json = await res.json();
        // Guarda no cache
        tccCache.current = {
          year: Number(currentYear),
          resLabel: json.resLabel,
          activeTCC: json.activeDataset,
          availableTCC: json.availableDatasets,
        };
        // Guarda o tcc ativo
        setActiveTCC(json.activeDataset);
        // Guarda a lista de todos os tccs disponíveis
        setAvailableTCC(json.availableDatasets);
        // Atualiza os labels das provas
        if (json.resLabel !== selectedLabel) {
          setSelectionsByArea((prev) => ({
            ...prev,
            [deferredArea]: json.resLabel,
          }));
        }
      } catch (err) {
        console.error("Erro ao buscar dataset:", err);
      }
    }
    loadData();
  }, [deferredArea, selectedLabel, currentYear]);

  // ---------------------------------------------------------------------------
  // ------------------------------ POINT INDEX --------------------------------
  // ---------------------------------------------------------------------------

  // Estado para armazenar a manipulação do PointIndex
  const [userPointIndex, setUserPointIndex] = useState<number | null>(null);

  // PointIndex inicial
  const initialIndex = useMemo(() => {
    if (!activeTCC?.labels_x?.length) return 0;
    return 0;
  }, [activeTCC]);

  // PointIndex definido
  const pointIndexStuff: PointIndexType = {
    pointIndex: userPointIndex !== null ? userPointIndex : initialIndex,
    setPointIndex: setUserPointIndex,
  };

  // ---------------------------------------------------------------------------
  // ------------------------------ CHART PROPS --------------------------------
  // ---------------------------------------------------------------------------

  const { colorMap } = useChartTheme();

  const chartProps: chartPropsType = {
    chartColor:
      colorMap[activeTCC?.metadata?.cor.replace(/\s*\(.*?\)\s*/g, "").trim()] ||
      "#3b82f6",
    proficienciaAtual: activeTCC?.labels_x?.[pointIndexStuff.pointIndex] || 0,
    resultadoAtual: activeTCC?.data_teorico?.[pointIndexStuff.pointIndex] || 0,
    xMin: Math.floor((activeTCC?.metadata?.min || 0) / 100) * 100,
    xMax: Math.ceil((activeTCC?.metadata?.max || 1000) / 100) * 100,
    bMedio: activeTCC?.metadata?.b_medio_enem || 0,
  };

  // ---------------------------------------------------------------------------
  // -------------------------------- RETURN -----------------------------------
  // ---------------------------------------------------------------------------

  return (
    <HomeContext.Provider
      value={{
        // Definiões iniciais
        currentYear,
        activeArea,
        deferredArea,
        selectedLabel,
        selectionsByArea,
        selectedRowId,
        isFetchingBI: activeArea !== deferredArea || loading,
        pathName,

        // Carga dinâmica do dicionário no server (bundle inicial)
        dicData,

        // Carga dinâmica do TCC solicitada pelo ciente (API)
        availableTCC,
        activeTCC,

        // Carts props
        pointIndexStuff,
        chartProps,

        // Funções
        getMetadata,
        setSelectedRowId,
        setSelectedLabel,
        setActiveArea,
        setSelectionsByArea,
      }}
    >
      {children}
    </HomeContext.Provider>
  );
}

export const useHomeData = () => useContext(HomeContext);
