"use client";

import {
  createContext,
  useContext,
  useMemo,
  ReactNode,
  useRef,
  useLayoutEffect,
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
  ViolinDataType,
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
    currentYear,
    deferredArea,
    selectedRowId,
    selectedLabel,
  } = useHomeData();

  // ---------------------------------------------------------------------------
  // ------------------------ DEFINIÇÕES INICIAIS ------------------------------
  // ---------------------------------------------------------------------------
  //

  const [lastItemActivate, setLastItemActivate] = useState<number>(0);
  const [lastItemActivateNum, setLastItemActivateNum] = useState<number>(0);

  const [selectedItems, setSelectedItems] = useState<
    SelectedItemsType | object
  >({});

  const [loading, setLoading] = useState(true);

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
      setLoading(true);
      try {
        let visaoPromise = null;
        let respostaPromise = null;
        let redacaoPromise = null;
        // 2. Dispara apenas a requisição condizente com a rota atual
        if (pathName?.endsWith("/visao-geral")) {
          visaoPromise = fetch(`/api/visao?year=${currentYear}`).then((r) =>
            r.json(),
          );
        } else if (pathName?.endsWith("/resposta-ao-item")) {
          respostaPromise = fetch(`/api/resposta?year=${currentYear}`).then(
            (r) => r.json(),
          );
        } else if (pathName?.endsWith("/redacao")) {
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
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentYear, pathName]);

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

  useEffect(() => {
    const loadData = async () => {
      const isDescribePage = pathName?.endsWith("/dificuldade-do-exame");
      if (!isDescribePage) return;
      try {
        const response = await fetch(
          `/api/describe?year=${currentYear}&area=${deferredArea}`,
        );
        if (!response.ok) {
          throw new Error("Erro ao carregar os dados de dificuldade");
        }
        const data = await response.json();
        setDensityDifData(data.density.regular);
        setDescribeDifData(data.describe.regular);
        setFrequencyDifData(data.frequency.regular);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      }
    };
    loadData();
  }, [deferredArea, currentYear, pathName]);

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

  // -----------------------PROBABILIDADE E INFORMAÇÃO--------------------------

  const [infoData, setInfoData] = useState<InfoProbDataType>(null);
  const [probData, setProbData] = useState<InfoProbDataType>(null);
  const [probLabels, setProbLabels] = useState<InfoProbLabelType>([]);
  const [infoLabels, setInfoLabels] = useState<InfoProbLabelType>([]);
  const probCache = useRef<ProbCacheType | null>(null);
  const infoCache = useRef<ProbCacheType | null>(null);

  useEffect(() => {
    if (!codigo) return;
    const isProbInfoPage = pathName?.endsWith("/probabilidade-e-info");
    if (!isProbInfoPage) return;
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
  }, [pathName, codigo, currentYear]);

  // ---------------------------RESPOSTA AO ITEM--------------------------------

  const [itemGraphData, setItemGraphData] = useState<ItemGraphType | null>(
    null,
  );
  const itemGraphCache = useRef<ItemGraphCacheType | null>(null);

  useEffect(() => {
    if (!lastItemActivate) return;
    if (itemGraphCache.current?.code === lastItemActivate) {
      setItemGraphData(itemGraphCache.current.dataset);
      return;
    }
    async function fetchItemData() {
      try {
        const res = await fetch(
          `/api/score_graph?code=${String(lastItemActivate)}` +
            `&year=${currentYear}`,
        );
        const json = await res.json();
        itemGraphCache.current = {
          code: lastItemActivate,
          dataset: json?.dataset,
        };
        setItemGraphData(json?.dataset);
      } catch (err) {
        console.error("Erro ao carregar item_score:", err);
      }
    }
    fetchItemData();
  }, [lastItemActivate, needUpdateEAP, currentYear]);

  // -------------------------RELAÇÃO NOTAS-ACERTOS-----------------------------

  const [acertosData, setAcertosData] = useState<AcertosDataType | null>(null);
  const acertosCache = useRef<AcertosDataCacheType | null>(null);

  useEffect(() => {
    const isAcertosPage = pathName?.endsWith("/notas-e-acertos");
    if (!isAcertosPage) return;
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
  }, [pathName, deferredArea, currentYear]);

  //---------------------------------MEAN---------------------------------------

  const [activeRanking, setActiveRanking] = useState<number | null>(1);
  const [top2000Data, setTop2000Data] = useState<Top2000Type>();
  const [candidateData, setCandidateData] = useState<CandidateDataType>();

  useEffect(() => {
    const isMediaSimplesPage = pathName?.endsWith("/media-simples");
    async function fetchTop2000Data() {
      if (!isMediaSimplesPage || !currentYear) return;
      try {
        const res = await fetch(`/api/mean?year=${currentYear}`);
        const json = await res.json();
        setTop2000Data(json);
      } catch (err) {
        console.error("Erro ao carregar probtrace:", err);
      }
    }
    fetchTop2000Data();
  }, [pathName, currentYear]);

  useEffect(() => {
    const isMediaSimplesPage = pathName?.endsWith("/media-simples");
    async function fetchCandidateData() {
      if (!isMediaSimplesPage || !currentYear) return;
      try {
        const res = await fetch(
          `/api/candidate?year=${currentYear}&rank=${activeRanking}`,
        );
        const json: CandidateDataType = await res.json();
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
  }, [pathName, currentYear, activeRanking, setSelectionsByArea]);

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
    const isPathOfInterest = pathName.endsWith("tri");
    if (!isPathOfInterest) return;
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
    if (isPathOfInterest || needUpdateEAP) fetchEAPData();
  }, [
    deferredArea,
    lingua,
    versao,
    codigo,
    sampleEAP,
    pathName,
    needUpdateEAP,
    selectedLabel,
    currentYear,
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
      setLastItemActivate(0);
      setViolinData(null);
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

  // 2. Fetch do codesMap no Cliente
  const [codesMap, setCodesMap] = useState<CodesMapType>({});

  useEffect(() => {
    async function loadCodes() {
      if (!codigo || !currentYear) return;
      const isTriPage = pathName?.endsWith("/tri");
      const isRespostaPage = pathName?.endsWith("/resposta-ao-item");
      const isProbInfoPage = pathName?.endsWith("/probabilidade-e-info");
      if (!(isTriPage || isRespostaPage || isProbInfoPage)) return;
      setLoading(true);
      try {
        const params = new URLSearchParams({
          year: Array.isArray(currentYear)
            ? currentYear[0]
            : String(currentYear),
          codigo: String(codigo),
          area: deferredArea,
          ...(versao && { versao: String(versao) }),
          ...(lingua !== undefined && { lingua: String(lingua) }),
        });
        const res = await fetch(`/api/codes?${params.toString()}`);
        const data = await res.json();
        setCodesMap(data);
      } catch (err) {
        console.error("Erro ao carregar códigos:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCodes();
  }, [currentYear, codigo, deferredArea, versao, lingua, pathName]);

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
      setLastItemActivate(codeItem);
      setSelectedItems((prev) => {
        const nextMapping = { ...prev };
        const current = nextMapping[codeItem];
        if (isAbandoned) {
          // Se for abandonado: Toggle simples entre selecionado (cinza) e nada
          if (current) {
            delete nextMapping[codeItem];
          } else {
            nextMapping[codeItem] = { status: "anulado", posicao: num };
          }
          return nextMapping;
        }
        // Lógica de ciclo: Nada -> Acerto (verde) -> Erro (vermelho) -> Nada
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

  const [abandonadosCodes, setAbandonadosCodes] = useState<Set<number>>(
    new Set(),
  );

  useEffect(() => {
    if (!currentYear) return;
    async function fetchAbandonados() {
      try {
        const response = await fetch(`/api/aband?year=${currentYear}`);
        const codesArray: number[] = await response.json();
        setAbandonadosCodes(new Set(codesArray));
      } catch (error) {
        console.error("Erro ao carregar itens abandonados:", error);
      }
    }
    fetchAbandonados();
  }, [currentYear]);

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
    if (!describeDifData?.notas) return [];
    return rowOrder
      .filter((key) => describeDifData.notas[key] !== undefined)
      .map((key) => ({
        id: key,
        metric: labelMap[key] || key,
        nota: formatValue(key, describeDifData.notas[key], "nota"),
        acerto: formatValue(key, describeDifData.acertos?.[key], "acerto"),
      }));
  }, [describeDifData]);

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
    return tableData.find((row) => row.id === selectedRowId) || null;
  }, [tableData, selectedRowId]);

  const dificuldadeDoExameAux = {
    describeRowData,
    activeSelectedRow,
  };

  //---------------------------PROBABILIDADE E INFO-----------------------------

  const prevLabelRef = useRef<string>(selectedLabel);
  const prevCodesMapRef = useRef<typeof codesMap>(codesMap);

  useLayoutEffect(() => {
    const previousLabel = prevLabelRef.current;
    if (previousLabel === selectedLabel) return;
    const { start, end } = ranges[deferredArea] || { start: 1, end: 45 };
    const oldCodesMap = prevCodesMapRef.current;
    setSelectedItems((prev) => {
      const currentlySelectedCodes = Object.keys(prev).map(Number);
      if (currentlySelectedCodes.length === 0) return prev;
      const nextMapping: typeof prev = {};
      const translationMap = new Map();
      for (let num = start; num <= end; num++) {
        const oldCode = oldCodesMap[num]?.code;
        const newCode = codesMap[num]?.code;
        if (oldCode && newCode) {
          translationMap.set(oldCode, { newCode, posicao: num });
        }
      }
      currentlySelectedCodes.forEach((oldCode) => {
        const translation = translationMap.get(oldCode);
        if (translation) {
          nextMapping[translation.newCode] = {
            ...prev[oldCode],
            posicao: translation.posicao,
          };
        } else {
          nextMapping[oldCode] = prev[oldCode];
        }
      });
      return nextMapping;
    });
    prevLabelRef.current = selectedLabel;
    prevCodesMapRef.current = codesMap;
  }, [selectedLabel, codesMap, deferredArea]);

  //--------------------------RESPOSTA AO ITEM---------------------------

  const [violinData, setViolinData] = useState<ViolinDataType>(null);

  useEffect(() => {
    async function defineVioninData() {
      if (!scoreData || !lastItemActivate || !scoreData[lastItemActivate]) {
        setViolinData(null);
        return;
      }
      const rawBins = scoreData[lastItemActivate].bins;
      if (
        !rawBins ||
        !Array.isArray(rawBins["0"]) ||
        !Array.isArray(rawBins["1"]) ||
        !Array.isArray(rawBins.labels)
      ) {
        setViolinData(null);
        return;
      }
      const v0 = rawBins["0"];
      const v1 = rawBins["1"];
      const labels = rawBins.labels;
      const filteredIndices = labels
        .map((_, i) => i)
        .filter((i) => v0[i] > 0 || v1[i] > 0);
      setViolinData({
        "0": filteredIndices.map((i) => v0[i]).reverse(),
        "1": filteredIndices.map((i) => v1[i]).reverse(),
        labels: filteredIndices.map((i) => labels[i]).reverse(),
      });
    }
    defineVioninData();
  }, [scoreData, lastItemActivate]);

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
      }}
    >
      {children}
    </YearContext.Provider>
  );
}

export const useYearData = () => useContext(YearContext);
