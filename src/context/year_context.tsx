"use client";

import {
  createContext,
  useContext,
  useMemo,
  ReactNode,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useHomeData } from "./home_context";
import constantes from "../../public/JSON/constantes.json";
import matrizHab from "../../public/JSON/matriz_hab.json";
import matrizComp from "../../public/JSON/matriz_comp.json";

import {
  AbstencaoType,
  CompetenciaRowType,
  CorRacaDataType,
  DescribeType,
  DificuldadeDoExameType,
  FreqDensityType,
  FxSexoType,
  InfoProbDataType,
  InfoProbLabelType,
  InscritosType,
  ItemGraphCacheType,
  ItemGraphType,
  OverviewType,
  ProbCacheType,
  RedacaoType,
  RespostaAoItemType,
  ScoreType,
  SelectedItemsType,
  StatusType,
  YearContextType,
  AcertosDataType,
  AcertosDataCacheType,
  EAPDataType,
  TableDataType,
  DescribeRowDataType,
  TableDataItem,
  ConstantesType,
  Top2000Type,
  CandidateDataType,
  ProbInfoDataType,
  MeanDataType,
  FormatValueType,
  HandleToggleType,
  GetAreaMapType,
  GetItemDetails,
  HabilidadesJson,
  HabAreaData,
  CompetenciasJson,
  CompAreaData,
  CodesMapType,
  ItemDetails,
} from "../types/year_types";

const YearContext = createContext<YearContextType>(null);

const labelMap: Record<string, string> = {
  mean: "Média",
  median: "Mediana",
  mode: "Moda",
  sd: "Desvio Padrão",
  min: "Mínima¹",
  max: "Máxima²",
  skew: "Assimetria",
  kurtosis: "Curtose",
  q1: "1º quartil",
  q3: "3º quartil",
  p99: "Percentil 99",
};

const rowOrder = [
  "mean",
  "median",
  "mode",
  "min",
  "max",
  "sd",
  "q1",
  "q3",
  "p99",
  "skew",
  "kurtosis",
];

const ranges: Record<string, { start: number; end: number }> = {
  LC: { start: 1, end: 45 },
  CH: { start: 46, end: 90 },
  CN: { start: 91, end: 135 },
  MT: { start: 136, end: 180 },
};

export function YearProvider({ children }: { children: ReactNode }) {
  // ---------------------------------------------------------------------------
  // ---------------------- CONTEXTOS NECESSÁRIOS ------------------------------
  // ---------------------------------------------------------------------------

  const {
    pathName,
    setActiveArea,
    setSelectionsByArea,
    setActiveTCC,
    currentYear,
    deferredArea,
    selectedRowId,
    selectedLabel,
  } = useHomeData();

  // ---------------------------------------------------------------------------
  // ----------------------------- ENDPOINTS -----------------------------------
  // ---------------------------------------------------------------------------

  const isVisaoGeralPage = pathName.endsWith("visao-geral");
  const isDificuldadePage = pathName.endsWith("dificuldade-do-exame");
  const isProbInfoPage = pathName.endsWith("probabilidade-e-info");
  const isRespostaPage = pathName.endsWith("resposta-ao-item");
  const isNotaAcertosPage = pathName.endsWith("notas-e-acertos");
  const isRedacaoPage = pathName.endsWith("redacao");
  const isMediaSimplesPage = pathName.endsWith("media-simples");
  const isTriPage = pathName.endsWith("tri");

  // ---------------------------------------------------------------------------
  // ------------------------ DEFINIÇÕES INICIAIS ------------------------------
  // ---------------------------------------------------------------------------
  //

  const [lastItemActivate, setLastItemActivate] = useState<number | null>(null);
  const [lastItemActivateNum, setLastItemActivateNum] = useState<number | null>(
    null,
  );

  const [selectedItems, setSelectedItems] = useState<SelectedItemsType>({});

  const [codigo, lingua, versao] = selectedLabel.split("_");

  const [acertosNum, setAcertosNum] = useState<number>(0);

  const [sampleEAP, setSampleEAP] = useState<string>(
    "000000000000000000000000000000000000000000000",
  );

  const [needUpdateEAP, setNeedUpdateEAP] = useState<boolean>(false);

  const fixedPalette = useMemo<Record<number, string>>(
    () =>
      Array.from({ length: 45 }, (_, i) => `hsl(${(i * 360) / 45}, 70%, 50%)`),
    [],
  );

  const [isFetchingEAP, setIsFetchingEAP] = useState<boolean>(false);

  const [isInitialRender, setIsInitialRender] = useState<boolean>(true);

  const [questaoPopUp, setQuestaoPopUp] = useState(null);

  const [showPopUp, setShowPopUp] = useState(false);

  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const [showGabarito, setShowGabarito] = useState<boolean>(false);

  const [listCode, setListCode] = useState<number[]>([]);

  const [curve, setCurve] = useState<{ num: number; code: number } | null>(
    null,
  );

  // ---------------------------------------------------------------------------
  // ----------------- CARGA ESTÁTICA DE JSON (BUNDLE INICIAL) -----------------
  // ---------------------------------------------------------------------------

  // -----------------CONSTANTES DE TRANSFORMAÇÃO DA ESCALA --------------------
  const areaIdx: number = constantes.area.indexOf(deferredArea || "LC");
  const d: number = constantes.d[areaIdx];
  const k: number = constantes.k[areaIdx];

  const constantesData: ConstantesType = {
    areaIdx: areaIdx,
    d: d,
    k: k,
  };

  // ----------------MATRIZ DE RERÊNCIA (COMPETÊNCIAS E HABILIDADES)
  const habilidades: HabAreaData = (matrizHab as HabilidadesJson)[deferredArea];
  const competencias: CompAreaData = (matrizComp as CompetenciasJson)[
    deferredArea
  ];

  // ---------------------------------------------------------------------------
  // ------------ CARGA DINÂMICA DE JSON POR ANO (BUNDLE INICIAL) --------------
  // ---------------------------------------------------------------------------

  const [inscritosData, setInscritosData] = useState<InscritosType | null>(
    null,
  );
  const [abstencaoDia1, setabstencaoDia1] = useState<AbstencaoType | null>(
    null,
  );
  const [abstencaoDia2, setabstencaoDia2] = useState<AbstencaoType | null>(
    null,
  );
  const [corRacaData, setCor_raca_data] = useState<CorRacaDataType | null>(
    null,
  );
  const [sexoData, setSexo_data] = useState<FxSexoType | null>();
  const [fxEtariaData, setFx_etaria_data] = useState<FxSexoType | null>(null);
  const [scoreData, setScoreData] = useState<ScoreType | null>(null);
  const [competenciaRowData, setCompetenciaRowData] =
    useState<CompetenciaRowType>(null);
  const [statusData, setStatusData] = useState<StatusType | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        let visaoPromise = null;
        let respostaPromise = null;
        let redacaoPromise = null;
        // 2. Dispara apenas a requisição condizente com a rota atual
        if (isVisaoGeralPage) {
          visaoPromise = fetch(`/api/visao?year=${currentYear}`).then((r) =>
            r.json(),
          );
        } else if (isRespostaPage) {
          respostaPromise = fetch(`/api/resposta?year=${currentYear}`).then(
            (r) => r.json(),
          );
        } else if (isRedacaoPage) {
          redacaoPromise = fetch(`/api/redacao?year=${currentYear}`).then((r) =>
            r.json(),
          );
        }
        const [resVisao, resResposta, resRedacao] = await Promise.all([
          visaoPromise,
          respostaPromise,
          redacaoPromise,
        ]);
        // 4. Atualiza os estados correspondentes
        if (resVisao) {
          setInscritosData(resVisao.inscritos);
          setabstencaoDia1(resVisao.abstencao1);
          setabstencaoDia2(resVisao.abstencao2);
          setCor_raca_data(resVisao.cor_raca);
          setSexo_data(resVisao.sexo);
          setFx_etaria_data(resVisao.fx_etaria);
        }
        if (resResposta) {
          setScoreData(resResposta);
        }
        if (resRedacao) {
          setCompetenciaRowData(resRedacao.competencia);
          setStatusData(resRedacao.status);
        }
      } catch (err) {
        console.error(
          `Erro ao carregar dados da API para o ano ${currentYear}:`,
          err,
        );
      }
    }
    loadData();
  }, [currentYear, isRespostaPage, isVisaoGeralPage, isRedacaoPage]);

  // ---------------------------------------------------------------------------
  // ------- CARGA DINÂMICA DE JSON POR ANO E POR ÁREA (BUNDLE INICIAL) --------
  // ---------------------------------------------------------------------------

  const [densityDifData, setDensityDifData] = useState<
    FreqDensityType["regular"] | null
  >(null);
  const [describeDifData, setDescribeDifData] = useState<
    DescribeType["regular"] | null
  >(null);
  const [frequencyDifData, setFrequencyDifData] = useState<
    FreqDensityType["regular"] | null
  >(null);

  const cacheRef = useRef<
    Map<
      string,
      {
        density: FreqDensityType["regular"];
        describe: DescribeType["regular"];
        frequency: FreqDensityType["regular"];
      }
    >
  >(new Map());

  useEffect(() => {
    if (!isDificuldadePage) return;
    const loadData = async () => {
      const cacheKey = `${currentYear}-${deferredArea}`;
      if (cacheRef.current.has(cacheKey)) {
        const cachedData = cacheRef.current.get(cacheKey)!;
        setDensityDifData(cachedData.density);
        setDescribeDifData(cachedData.describe);
        setFrequencyDifData(cachedData.frequency);
        return;
      }
      try {
        const response = await fetch(
          `/api/describe?year=${currentYear}&area=${deferredArea}`,
        );
        if (!response.ok) {
          throw new Error("Erro ao carregar os dados de dificuldade");
        }
        const data = await response.json();
        const newDensity = data.density.regular;
        const newDescribe = data.describe.regular;
        const newFrequency = data.frequency.regular;
        cacheRef.current.set(cacheKey, {
          density: newDensity,
          describe: newDescribe,
          frequency: newFrequency,
        });
        setDensityDifData(newDensity);
        setDescribeDifData(newDescribe);
        setFrequencyDifData(newFrequency);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      }
    };
    loadData();
  }, [deferredArea, currentYear, isDificuldadePage]);

  // ---------------------------------------------------------------------------
  // ----------------- AGRUPAMENTO DE DADOS DO BUNDLE INICIAL ------------------
  // ---------------------------------------------------------------------------

  const overviewData: OverviewType = {
    inscritosData,
    abstencaoDia1,
    abstencaoDia2,
    corRacaData,
    sexoData,
    fxEtariaData,
  };

  const respostaAoItemData: RespostaAoItemType = {
    scoreData,
  };

  const redacaoData: RedacaoType = {
    competenciaRowData,
    statusData,
  };

  const dificuldadeDoExame: DificuldadeDoExameType = {
    densityDifData,
    describeDifData,
    frequencyDifData,
  };

  // ---------------------------------------------------------------------------
  // ------------------ CARGA DINÂMICA DE JSON POR ANO (API) -------------------
  // ---------------------------------------------------------------------------

  // ----------------- CODIGOS DOS ITENS (FILTRADO NO SERVIDOR) ----------------

  const [codesMap, setCodesMap] = useState<CodesMapType>({});
  const codesCacheRef = useRef<Map<string, CodesMapType>>(new Map());

  useEffect(() => {
    async function loadCodes() {
      if (!codigo || !currentYear) return;
      if (!(isTriPage || isRespostaPage || isProbInfoPage)) return;

      const yearStr = Array.isArray(currentYear)
        ? currentYear[0]
        : String(currentYear);
      const params = new URLSearchParams({
        year: yearStr,
        codigo: String(codigo),
        area: deferredArea,
        ...(versao && { versao: String(versao) }),
        ...(lingua !== undefined && { lingua: String(lingua) }),
      });

      const cacheKey = params.toString();

      const processData = (data: CodesMapType) => {
        setSelectedItems((prev) => {
          if (Object.keys(prev).length === 0) {
            return prev;
          }
          const codeToPosition = new Map<string, number>();
          Object.entries(data).forEach(([posStr, item]) => {
            if (item?.code !== undefined && item?.code !== null) {
              codeToPosition.set(String(item.code), Number(posStr));
            }
          });
          const nextMapping: typeof prev = {};
          Object.entries(prev).forEach(([code, itemData]) => {
            const newPosition = codeToPosition.get(String(code));
            if (newPosition === undefined) {
              return;
            }
            nextMapping[code] = {
              ...itemData,
              posicao: newPosition,
            };
          });
          return nextMapping;
        });
        const keys = Object.keys(data);
        if (keys.length > 0) {
          const firstItemNum = Number(keys[0]);
          if (data[firstItemNum]?.code !== undefined) {
            setLastItemActivateNum(firstItemNum);
            setLastItemActivate(Number(data[firstItemNum].code));
          }
        }
        setCodesMap(data);
      };
      if (codesCacheRef.current.has(cacheKey)) {
        processData(codesCacheRef.current.get(cacheKey)!);
        return;
      }

      try {
        const res = await fetch(`/api/codes?${cacheKey}`);
        const data: CodesMapType = await res.json();

        codesCacheRef.current.set(cacheKey, data);
        processData(data);
      } catch (err) {
        console.error("Erro ao carregar códigos:", err);
      }
    }
    loadCodes();
  }, [
    currentYear,
    codigo,
    deferredArea,
    versao,
    lingua,
    isTriPage,
    isProbInfoPage,
    isRespostaPage,
  ]);

  // ----------------- CODIGOS ABANDONADOS (FILTRADO NO SERVIDOR) --------------

  const [abandonadosCodes, setAbandonadosCodes] = useState<Set<number>>(
    new Set(),
  );

  const abandonadosCacheRef = useRef<Map<string | number, number[]>>(new Map());

  useEffect(() => {
    if (!currentYear) return;
    const normalizedYear = Array.isArray(currentYear)
      ? currentYear[0]
      : currentYear;
    if (abandonadosCacheRef.current.has(normalizedYear)) {
      const cachedArray = abandonadosCacheRef.current.get(normalizedYear)!;
      setAbandonadosCodes(new Set(cachedArray));
      return;
    }
    async function fetchAbandonados() {
      try {
        const response = await fetch(`/api/aband?year=${normalizedYear}`);
        const codesArray: number[] = await response.json();
        abandonadosCacheRef.current.set(normalizedYear, codesArray);
        setAbandonadosCodes(new Set(codesArray));
      } catch (error) {
        console.error("Erro ao carregar itens abandonados:", error);
      }
    }
    fetchAbandonados();
  }, [currentYear]);

  // -----------------------PROBABILIDADE E INFORMAÇÃO--------------------------

  const [infoData, setInfoData] = useState<InfoProbDataType>(null);
  const [probData, setProbData] = useState<InfoProbDataType>(null);
  const [probLabels, setProbLabels] = useState<InfoProbLabelType>([]);
  const [infoLabels, setInfoLabels] = useState<InfoProbLabelType>([]);
  const probCache = useRef<ProbCacheType | null>(null);
  const infoCache = useRef<ProbCacheType | null>(null);

  useEffect(() => {
    if (!codigo || !isProbInfoPage) return;
    if (probCache.current?.codigo === codigo) {
      setProbData(probCache.current.dataset);
      setProbLabels(probCache.current.labels);
      return;
    }
    async function fetchProbData() {
      try {
        const res = await fetch(
          `/api/probtrace?codigo=${String(codigo)}&year=${currentYear}`,
        );
        const json = await res.json();
        probCache.current = {
          codigo: codigo,
          dataset: json.dataset,
          labels: json.theta_labels,
        };
        setProbData(json.dataset);
        setProbLabels(json.theta_labels);
      } catch (err) {
        console.error("Erro ao carregar probtrace:", err);
      }
    }
    async function fetchInfoData() {
      try {
        const res = await fetch(
          `/api/info?codigo=${String(codigo)}&year=${currentYear}`,
        );
        const json = await res.json();
        infoCache.current = {
          codigo: codigo,
          dataset: json.dataset,
          labels: json.theta_labels,
        };
        setInfoData(json.dataset);
        setInfoLabels(json.theta_labels);
      } catch (err) {
        console.error("Erro ao carregar infotrace:", err);
      }
    }
    fetchProbData();
    fetchInfoData();
  }, [codigo, currentYear, isProbInfoPage]);

  // ---------------------------RESPOSTA AO ITEM--------------------------------

  const [itemGraphData, setItemGraphData] = useState<ItemGraphType | null>(
    null,
  );
  const [prevIsRespostaPage, setPrevIsRespostaPage] = useState(isRespostaPage);
  const itemGraphCache = useRef<ItemGraphCacheType | null>(null);

  if (prevIsRespostaPage !== isRespostaPage) {
    setPrevIsRespostaPage(isRespostaPage);
    if (!isRespostaPage) {
      setItemGraphData(null);
      setLastItemActivate(null);
      setLastItemActivateNum(null);
    }
  }

  useEffect(() => {
    const currentCode = lastItemActivate;
    if (!currentCode || !isRespostaPage) return;
    if (String(itemGraphCache.current?.code) === String(currentCode)) {
      setItemGraphData({
        code: currentCode,
        dataset: itemGraphCache.current!.dataset,
      });
      return;
    }
    async function fetchItemData(codeToFetch: number) {
      try {
        const res = await fetch(
          `/api/score_graph?code=${String(codeToFetch)}` +
            `&year=${currentYear}`,
        );
        const json = await res.json();
        const newCacheData: ItemGraphType = {
          code: json?.code,
          dataset: json?.dataset,
        };

        itemGraphCache.current = newCacheData;

        if (lastItemActivate === codeToFetch) {
          setItemGraphData(newCacheData);
        }
      } catch (err) {
        console.error("Erro ao carregar item_score:", err);
      }
    }

    fetchItemData(currentCode);
  }, [
    lastItemActivate,
    needUpdateEAP,
    currentYear,
    isRespostaPage,
    isProbInfoPage,
    isTriPage,
  ]);

  // -------------------------RELAÇÃO NOTAS-ACERTOS-----------------------------

  const [acertosData, setAcertosData] = useState<AcertosDataType | null>(null);
  const acertosCache = useRef<AcertosDataCacheType | null>(null);

  useEffect(() => {
    if (!isNotaAcertosPage) return;
    const tipo = "regular";
    if (
      acertosCache.current?.area === deferredArea &&
      acertosCache.current?.versao === tipo
    ) {
      setAcertosData(acertosCache.current.dataset);
      return;
    }

    async function fetchAcertosData() {
      try {
        const targetArea = deferredArea || "LC";
        const res = await fetch(
          `/api/acertos?area=${String(targetArea)}&year=${currentYear}`,
        );
        const json = await res.json();
        if (json.dataset) {
          acertosCache.current = {
            area: String(targetArea),
            dataset: json.dataset.regular,
            versao: tipo,
          };
          setAcertosData(json.dataset.regular);
        }
      } catch (err) {
        console.error("Erro ao carregar item_score:", err);
      }
    }

    fetchAcertosData();
  }, [deferredArea, currentYear, isNotaAcertosPage]);

  //---------------------------------MEAN---------------------------------------

  const [activeRanking, setActiveRanking] = useState<number | null>(1);
  const [top2000Data, setTop2000Data] = useState<Top2000Type>();
  const [candidateData, setCandidateData] = useState<CandidateDataType>();

  const top2000Cache = useRef<Map<string | number, Top2000Type>>(new Map());
  const candidateCache = useRef<Map<string, CandidateDataType>>(new Map());

  const normalizedYear = Array.isArray(currentYear)
    ? currentYear[0]
    : currentYear;

  useEffect(() => {
    if (!isMediaSimplesPage || !normalizedYear) return;

    if (top2000Cache.current.has(normalizedYear)) {
      setTop2000Data(top2000Cache.current.get(normalizedYear));
      return;
    }

    async function fetchTop2000Data() {
      try {
        const res = await fetch(`/api/mean?year=${normalizedYear}`);
        const json = await res.json();
        top2000Cache.current.set(normalizedYear, json);
        setLastItemActivate(null);
        setTop2000Data(json);
      } catch (err) {
        console.error("Erro ao carregar probtrace:", err);
      }
    }
    fetchTop2000Data();
  }, [normalizedYear, isMediaSimplesPage]);

  useEffect(() => {
    if (!isMediaSimplesPage || !normalizedYear || activeRanking === null)
      return;

    const cacheKey = `${normalizedYear}-${activeRanking}`;

    if (candidateCache.current.has(cacheKey)) {
      const json = candidateCache.current.get(cacheKey)!;
      setCandidateData(json);
      setSelectionsByArea({
        LC: `${json.CO_PROVA_LC}_${json.TP_LINGUA}_X`,
        CH: `${json.CO_PROVA_CH}_X_X`,
        CN: `${json.CO_PROVA_CN}_X_X`,
        MT: `${json.CO_PROVA_MT}_X_X`,
      });
      return;
    }

    async function fetchCandidateData() {
      try {
        const res = await fetch(
          `/api/candidate?year=${normalizedYear}&rank=${activeRanking}`,
        );
        const json: CandidateDataType = await res.json();
        candidateCache.current.set(cacheKey, json);
        setCandidateData(json);
        setSelectionsByArea({
          LC: `${json.CO_PROVA_LC}_${json.TP_LINGUA}_X`,
          CH: `${json.CO_PROVA_CH}_X_X`,
          CN: `${json.CO_PROVA_CN}_X_X`,
          MT: `${json.CO_PROVA_MT}_X_X`,
        });
      } catch (err) {
        console.error("Erro ao carregar probtrace:", err);
      }
    }
    fetchCandidateData();
  }, [normalizedYear, activeRanking, setSelectionsByArea, isMediaSimplesPage]);

  // ---------------------------------------------------------------------------
  // ------------ AGRUPAMENTO DE DADOS SOCILITIDADOS PELO CLIENTE --------------
  // ---------------------------------------------------------------------------

  const probInfoData: ProbInfoDataType = {
    probData,
    probLabels,
    infoData,
    infoLabels,
  };

  const meanData: MeanDataType = {
    activeRanking,
    top2000Data,
    candidateData,
  };

  // ---------------------------------------------------------------------------
  // -------------- CARGA DO CÁLCULO EAP (API EXTERNA: RENDER) -----------------
  // ---------------------------------------------------------------------------

  const [EAPData, setEAPData] = useState<EAPDataType | null>(null);

  useEffect(() => {
    if (!isTriPage || !isFetchingEAP) return;
    async function fetchEAPData() {
      try {
        const res = await fetch(
          `/api/eap?sample=${sampleEAP}&area=${deferredArea}&ano=` +
            `${currentYear}&codigo=${codigo}&lingua=${lingua}`,
        );
        if (!res.ok) throw new Error("Erro na rota interna");
        const json = await res.json();
        if (json) {
          setEAPData(json);
          setIsFetchingEAP(false);
        }
      } catch (err) {
        console.error("Erro ao carregar EAPdata:", err);
      }
    }
    if (isTriPage || needUpdateEAP) fetchEAPData();
  }, [
    deferredArea,
    isFetchingEAP,
    lingua,
    versao,
    codigo,
    sampleEAP,
    needUpdateEAP,
    selectedLabel,
    currentYear,
    isTriPage,
  ]);

  //----------------------------------------------------------------------------
  //---------------------------TRANSFORMAÇÃO DE DADOS---------------------------
  //----------------------------------------------------------------------------

  //---------------------------FUNÇÕES AUXILIARES-------------------------------

  // Função auxiliar para atualizar estado da área ativa
  const handleTabChange = (id: string) => {
    setActiveArea(id);
    if (deferredArea !== id) {
      //EAP handle
      setEAPData(null);
      setIsInitialRender(true);
      setNeedUpdateEAP(true);
      //Dificuldade do Exame handle
      setDensityDifData(null);
      setFrequencyDifData(null);
      setDescribeDifData(null);
      //RespostaAoItem
      setItemGraphData(null);
      setLastItemActivate(null);
      setLastItemActivateNum(null);
      setActiveTCC(null);
    }
  };

  const formatValue: FormatValueType = (key, val, type) => {
    if (typeof val !== "number") return val;
    const isSpecial = key === "skew" || key === "kurtosis";
    return val.toLocaleString("pt-BR", {
      maximumFractionDigits: isSpecial ? 2 : type === "nota" ? 1 : 0,
      minimumFractionDigits: 0,
    });
  };

  const getItemDetails = useCallback<GetItemDetails>(
    async (coItem: number) => {
      if (!codigo) return null;
      try {
        const response = await fetch(
          `/api/itens_details?year=${currentYear}` +
            `&codigo=${codigo}&coItem=${coItem}`,
        );
        if (!response.ok) return null;
        const data: ItemDetails | null = await response.json();
        return data;
      } catch (error) {
        console.error("Erro ao buscar detalhes do item:", error);
        return null;
      }
    },
    [codigo, currentYear],
  );

  const handleToggle = useCallback<HandleToggleType>(
    (num, isAbandoned) => {
      const codeItem = codesMap[num]?.code;
      if (!codeItem) {
        console.warn(
          [
            `Não foi possível encontrar o código para a posição `,
            `${num} na prova ${selectedLabel}`,
          ].join(""),
        );
        return;
      }
      setLastItemActivate(null);
      setLastItemActivateNum(null);
      setSelectedItems((prev) => {
        const nextMapping = { ...prev };
        const current = nextMapping[codeItem];
        if (isAbandoned) {
          if (current) {
            delete nextMapping[codeItem];
          } else {
            nextMapping[codeItem] = { status: "anulado", posicao: num };
          }
          return nextMapping;
        }
        if (!current) {
          nextMapping[codeItem] = { status: "acerto", posicao: num };
        } else if (current.status === "acerto") {
          nextMapping[codeItem] = { status: "erro", posicao: num };
        } else {
          delete nextMapping[codeItem];
        }
        return nextMapping;
      });
    },
    [selectedLabel, codesMap],
  );

  const getAreaMap: GetAreaMapType = async (codProva, tpLingua, score) => {
    if (!score) return [];
    try {
      const response = await fetch(
        `/api/area_map?year=${currentYear}` +
          `&codProva=${codProva}&tpLingua=${tpLingua ?? ""}&score=${score}`,
      );
      if (!response.ok) return [];
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        return [];
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Erro ao buscar area map:", error);
      return [];
    }
  };

  //---------------------------------ITEM CODES---------------------------------

  const activeCodes = useMemo(() => {
    if (Object.keys(selectedItems).length === 0) return [];
    const currentlySelectedCodes = Object.keys(selectedItems).map(Number);
    const { start, end } = ranges[deferredArea] || { start: 1, end: 45 };
    const validCodesForCurrentLabel = new Set();
    for (let num = start; num <= end; num++) {
      const currentCode = codesMap[num]?.code;
      if (currentCode) {
        validCodesForCurrentLabel.add(currentCode);
      }
    }
    return currentlySelectedCodes.filter((code) => {
      const existsInCurrentLabel = validCodesForCurrentLabel.has(code);
      return existsInCurrentLabel;
    });
  }, [selectedItems, codesMap, deferredArea]);

  //-----------------------------DIFICULDADE DO EXAME---------------------------

  const tableData = useMemo<TableDataType>(() => {
    if (!isDificuldadePage) return;
    if (!describeDifData?.notas) return [];
    return rowOrder
      .filter((key) => describeDifData.notas[key] !== undefined)
      .map((key) => ({
        id: key,
        metric: labelMap[key] || key,
        nota: formatValue(key, describeDifData.notas[key], "nota"),
        acerto: formatValue(key, describeDifData.acertos?.[key], "acerto"),
      }));
  }, [describeDifData, isDificuldadePage]);

  const describeRowData = useMemo<DescribeRowDataType>(
    () => ({
      data: tableData,
      n: describeDifData?.notas?.n || 0,
      raw: describeDifData,
      cod_min_ref: describeDifData?.notas?.cod_min,
      cod_max_ref: describeDifData?.notas?.cod_max,
      cor_min_ref: describeDifData?.notas?.cor_min,
      cor_max_ref: describeDifData?.notas?.cor_max,
    }),
    [tableData, describeDifData],
  );

  const activeSelectedRow = useMemo<TableDataItem>(() => {
    if (!isDificuldadePage) return;
    return tableData.find((row) => row.id === selectedRowId) || null;
  }, [tableData, selectedRowId, isDificuldadePage]);

  const dificuldadeDoExameAux = {
    describeRowData,
    activeSelectedRow,
  };

  //--------------------------RESPOSTA AO ITEM---------------------------

  const violinData = useMemo(() => {
    if (!isRespostaPage) return null;
    if (!scoreData || !lastItemActivate || !scoreData[lastItemActivate]) {
      return null;
    }
    const rawBins = scoreData[lastItemActivate].bins;
    if (
      !rawBins ||
      !Array.isArray(rawBins["0"]) ||
      !Array.isArray(rawBins["1"]) ||
      !Array.isArray(rawBins.labels)
    ) {
      return null;
    }
    const v0 = rawBins["0"];
    const v1 = rawBins["1"];
    const labels = rawBins.labels;
    const filteredIndices = labels
      .map((_, i) => i)
      .filter((i) => v0[i] > 0 || v1[i] > 0);

    return {
      code: lastItemActivate,
      dataset: {
        "0": filteredIndices.map((i) => v0[i]).reverse(),
        "1": filteredIndices.map((i) => v1[i]).reverse(),
        labels: filteredIndices.map((i) => labels[i]).reverse(),
      },
    };
  }, [scoreData, lastItemActivate, isRespostaPage]);

  //--------------------------EAP---------------------------

  const intervalData = useMemo<string>(() => {
    const { start, end } = ranges[deferredArea as keyof typeof ranges] || {
      start: 1,
      end: 45,
    };
    const updatedInterval = Array(45).fill("0");
    activeCodes.forEach((codigo: number) => {
      const itemMarcado = selectedItems[codigo];
      if (itemMarcado && itemMarcado.status === "acerto") {
        const pos = itemMarcado.posicao;
        if (pos >= start && pos <= end) {
          const index = pos - start;
          if (index >= 0 && index < 45) {
            updatedInterval[index] = "1";
          }
        }
      }
    });
    return updatedInterval.join("");
  }, [deferredArea, activeCodes, selectedItems]);

  //----------------------------------------------------------------------------
  //----------------------------------RETURN------------------------------------
  //----------------------------------------------------------------------------
  //

  return (
    <YearContext.Provider
      value={{
        // Definições iniciais
        lastItemActivate,
        selectedItems,
        acertosNum,
        sampleEAP,
        fixedPalette,
        questaoPopUp,
        showPopUp,
        isLoaded,
        showGabarito,
        listCode,
        curve,

        // Updatings
        isInitialRender,
        needUpdateEAP,

        // Carga estática no server (bundle inicial)
        constantesData,
        habilidades,
        competencias,

        // Carga dinâmica no server (bundle inicial)
        overviewData,
        respostaAoItemData,
        redacaoData,
        dificuldadeDoExame,

        // Carga solicitada pelo cliente (API interna: lazy)
        probInfoData,
        itemGraphData,
        acertosData,
        meanData,
        codesMap,

        // Carga solicitada pelo cliente (API externa: render)
        EAPData,
        isFetchingEAP,

        // Transformação de dados
        abandonadosCodes,
        activeCodes,
        dificuldadeDoExameAux,
        lastItemActivateNum,
        intervalData,
        violinData,

        // Funções
        getItemDetails,
        handleToggle,
        getAreaMap,
        setLastItemActivate,
        setLastItemActivateNum,
        setActiveRanking,
        setAcertosNum,
        setSampleEAP,
        setNeedUpdateEAP,
        setIsFetchingEAP,
        setIsInitialRender,
        handleTabChange,
        setItemGraphData,
        setAcertosData,
        setEAPData,
        setQuestaoPopUp,
        setShowPopUp,
        setIsLoaded,
        setShowGabarito,
        setListCode,
        setCurve,
        setSelectedItems,
      }}
    >
      {children}
    </YearContext.Provider>
  );
}

export const useYearData = () => useContext(YearContext);
