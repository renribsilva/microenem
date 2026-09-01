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
import constantes from "../app/(home)/JSON/constantes.json";
import matrizHab from "../app/(home)/JSON/matriz_hab.json";
import matrizComp from "../app/(home)/JSON/matriz_comp.json";

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
  ItensDataType,
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
  GetCodeByLabelType,
  GetParamByLabelType,
  HandleToggleType,
  GetAreaMapType,
  ViolinDataType,
  GetItemDetails,
  HabilidadesJson,
  HabAreaData,
  CompetenciasJson,
  CompAreaData,
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

  const [itensData, setItensData] = useState<ItensDataType | null>(null);
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
    async function loadYearlyData() {
      setLoading(true);
      try {
        const [
          itens,
          inscritos,
          abstencao1,
          abstencao2,
          cor_raca,
          sexo,
          fx_etaria,
          score,
          competencia,
          status,
        ] = await Promise.all([
          import(`../app/(home)/JSON/${currentYear}/itens_${currentYear}.json`),
          import(
            `../app/(home)/JSON/${currentYear}/` +
              `visao-geral/overview/inscritos.json`
          ),
          import(
            `../app/(home)/JSON/${currentYear}/` +
              `visao-geral/overview/presenca_dia1.json`
          ),
          import(
            `../app/(home)/JSON/${currentYear}/` +
              `visao-geral/overview/presenca_dia2.json`
          ),
          import(
            `../app/(home)/JSON/${currentYear}/` +
              `visao-geral/socials/cor_raca.json`
          ),
          import(
            `../app/(home)/JSON/${currentYear}/visao-geral/socials/sexo.json`
          ),
          import(
            `../app/(home)/JSON/${currentYear}/` +
              `visao-geral/socials/faixa_etaria.json`
          ),
          import(
            `../app/(home)/JSON/${currentYear}/` +
              `resposta-ao-item/score_table.json`
          ),
          import(
            `../app/(home)/JSON/${currentYear}/` +
              `redacao/estatisticas_redacao_completa.json`
          ),
          import(
            `../app/(home)/JSON/${currentYear}/redacao/status_redacao.json`
          ),
        ]);
        setItensData(itens.default);
        setInscritosData(inscritos.default);
        setabstencaoDia1(abstencao1.default);
        setabstencaoDia2(abstencao2.default);
        setCor_raca_data(cor_raca.default);
        setSexo_data(sexo.default);
        setFx_etaria_data(fx_etaria.default);
        setScoreData(score.default);
        setCompetenciaRowData(competencia.default);
        setStatusData(status.default);
      } catch (err) {
        console.error(`Erro ao carregar dados do ano ${currentYear}:`, err);
      } finally {
        setLoading(false);
      }
    }
    loadYearlyData();
  }, [currentYear]);

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
      let density: { default: { regular: FreqDensityType["regular"] } };
      let describe: { default: { regular: DescribeType["regular"] } };
      let frequency: { default: { regular: FreqDensityType["regular"] } };
      switch (deferredArea) {
        case "CH":
          density = await import(
            `../app/(home)/JSON/${currentYear}/` +
              `dificuldade-do-exame/CH/density.json`
          );
          describe = await import(
            `../app/(home)/JSON/${currentYear}/` +
              `dificuldade-do-exame/CH/describe.json`
          );
          frequency = await import(
            `../app/(home)/JSON/${currentYear}/` +
              `dificuldade-do-exame/CH/frequency_acertos.json`
          );
          break;
        case "CN":
          density = await import(
            `../app/(home)/JSON/${currentYear}/` +
              `dificuldade-do-exame/CN/density.json`
          );
          describe = await import(
            `../app/(home)/JSON/${currentYear}/` +
              `dificuldade-do-exame/CN/describe.json`
          );
          frequency = await import(
            `../app/(home)/JSON/${currentYear}/` +
              `dificuldade-do-exame/CN/frequency_acertos.json`
          );
          break;
        case "MT":
          density = await import(
            `../app/(home)/JSON/${currentYear}/` +
              `dificuldade-do-exame/MT/density.json`
          );
          describe = await import(
            `../app/(home)/JSON/${currentYear}/` +
              `dificuldade-do-exame/MT/describe.json`
          );
          frequency = await import(
            `../app/(home)/JSON/${currentYear}/` +
              `dificuldade-do-exame/MT/frequency_acertos.json`
          );
          break;
        default:
          density = await import(
            `../app/(home)/JSON/${currentYear}/` +
              `dificuldade-do-exame/LC/density.json`
          );
          describe = await import(
            `../app/(home)/JSON/${currentYear}/` +
              `dificuldade-do-exame/LC/describe.json`
          );
          frequency = await import(
            `../app/(home)/JSON/${currentYear}/` +
              `dificuldade-do-exame/LC/frequency_acertos.json`
          );
      }
      setDensityDifData(density.default.regular);
      setDescribeDifData(describe.default.regular);
      setFrequencyDifData(frequency.default.regular);
    };
    loadData();
  }, [deferredArea, currentYear]);

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

  // Função para traduzir Posição (ex: questão 95) em Código (ex: 11234)
  const getCodeByLabel = useCallback<GetCodeByLabelType>(
    (num, label) => {
      if (!label || !itensData || !itensData.CO_POSICAO) return null;
      const p = itensData;
      const idx = Object.keys(p.CO_POSICAO).find((i) => {
        const matchProva = Number(p.CO_PROVA[i]) === Number(codigo);
        const matchPos = Number(p.CO_POSICAO[i]) === num;
        if (!matchProva || !matchPos) return false;
        if (deferredArea === "LC" && num <= 5 && lingua !== undefined) {
          return Number(p.TP_LINGUA[i]) === Number(lingua);
        }
        if (versao === "D" && p.TP_VERSAO_DIGITAL) {
          if (Number(versao) !== p.TP_VERSAO_DIGITAL[i]) return false;
        }
        return true;
      });
      return idx ? Number(p.CO_ITEM[idx]) : null;
    },
    [deferredArea, itensData, codigo, versao, lingua],
  );

  // Função para traduzir Posição (ex: questão 95) em Parâmetro (ex: 1.234)
  const getParamByLabel = useCallback<GetParamByLabelType>(
    (num, label, type) => {
      if (!label || !itensData || !itensData.CO_POSICAO) return null;
      const p = itensData;
      const idx = Object.keys(p.CO_POSICAO).find((i) => {
        const matchProva = Number(p.CO_PROVA[i]) === Number(codigo);
        const matchPos = Number(p.CO_POSICAO[i]) === num;
        if (!matchProva || !matchPos) return false;
        if (deferredArea === "LC" && num <= 5 && lingua !== undefined) {
          return Number(p.TP_LINGUA[i]) === Number(lingua);
        }
        if (versao === "D" && p.TP_VERSAO_DIGITAL) {
          if (Number(versao) !== p.TP_VERSAO_DIGITAL[i]) return false;
        }
        return true;
      });
      const map = {
        a: p.NU_PARAM_A?.[idx],
        b: p.NU_PARAM_B?.[idx],
        c: p.NU_PARAM_C?.[idx],
      };

      const val = map[type];
      return idx ? Number(val) : null;
    },
    [codigo, lingua, versao, deferredArea, itensData],
  );

  // Função para retornar metadata dos itens, a partir do codigo
  // da prova e do item
  const getItemDetails = useCallback<GetItemDetails>(
    (coItem: number) => {
      if (!itensData || !itensData.CO_PROVA) return null;
      const p = itensData;
      // Encontra o índice onde ambos, prova e item, correspondem
      const idx = p.CO_PROVA.findIndex(
        (pVal, i) =>
          Number(pVal) === Number(codigo) &&
          Number(p.CO_ITEM[i]) === Number(coItem),
      );

      if (idx === -1) return null;

      return {
        CO_POSICAO: p.CO_POSICAO[idx],
        SG_AREA: p.SG_AREA[idx],
        TX_GABARITO: p.TX_GABARITO[idx],
        CO_HABILIDADE: p.CO_HABILIDADE[idx],
        IN_ITEM_ABAN: p.IN_ITEM_ABAN[idx],
        TX_MOTIVO_ABAN: p.TX_MOTIVO_ABAN[idx],
        TX_COR: p.TX_COR[idx],
      };
    },
    [itensData, codigo],
  );

  const handleToggle = useCallback<HandleToggleType>(
    (num, isAbandoned) => {
      const codeItem = getCodeByLabel(num, selectedLabel);
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
    [selectedLabel, getCodeByLabel],
  );

  const getAreaMap: GetAreaMapType = (codProva, tpLingua, score) => {
    if (!itensData || !score) return [];
    const bits = score.split("");
    const temVersaoDigital = "TP_VERSAO_DIGITAL" in itensData;
    // 1. Coletar todos os índices válidos para esta prova e língua
    const indicesFiltrados = Object.keys(itensData.CO_PROVA)
      .map(Number)
      .filter((i) => {
        const matchProva = itensData.CO_PROVA[i] === codProva;
        const matchLingua =
          itensData.TP_LINGUA[i] === null ||
          itensData.TP_LINGUA[i] === tpLingua;
        let matchDigital = true;
        if (temVersaoDigital && itensData.TP_VERSAO_DIGITAL[i] !== null) {
          matchDigital = itensData.TP_VERSAO_DIGITAL[i] === tpLingua;
        }
        return matchProva && matchLingua && matchDigital;
      });

    // Ordenação por posição (essencial para parear com a string do score)
    indicesFiltrados.sort(
      (a, b) => itensData.CO_POSICAO[a] - itensData.CO_POSICAO[b],
    );

    // Se não encontrar exatamente 45 itens, a estrutura do caderno está errada
    // e o score não pode ser mapeado com segurança.
    if (indicesFiltrados.length !== 45) {
      console.error(
        [
          `Erro de integridade: Esperados 45 itens, `,
          `encontrados ${indicesFiltrados.length} para a prova ${codProva}.`,
        ].join(""),
      );
      return [];
    }

    return indicesFiltrados.map((i, pointer) => {
      return {
        pos: itensData.CO_POSICAO[i],
        status:
          itensData.IN_ITEM_ABAN[i] === 1
            ? "abandoned"
            : bits[pointer] === "1"
              ? "correct"
              : "wrong",
        co_item: itensData.CO_ITEM[i],
      };
    });
  };

  //---------------------------------ITEM CODES---------------------------------

  const abandonadosCodes = useMemo(() => {
    const codes = new Set<number>();
    const data = itensData;

    if (!data || !data.CO_ITEM) return codes;

    data.CO_ITEM.forEach((code: number, index: number) => {
      if (data.IN_ITEM_ABAN && data.IN_ITEM_ABAN[index] === 1) {
        codes.add(code);
      }
    });
    return codes;
  }, [itensData]);

  const activeCodes = useMemo(() => {
    if (!probData || Object.keys(selectedItems).length === 0) return [];
    const currentlySelectedCodes = Object.keys(selectedItems).map(Number);
    const { start, end } = ranges[deferredArea] || { start: 1, end: 45 };
    const validCodesForCurrentLabel = new Set();
    for (let num = start; num <= end; num++) {
      const currentCode = getCodeByLabel(num, selectedLabel);
      if (currentCode) {
        validCodesForCurrentLabel.add(currentCode);
      }
    }
    return currentlySelectedCodes.filter((code) => {
      const existsInCurrentLabel = validCodesForCurrentLabel.has(code);
      const existsInProbData = String(code) in probData;
      return existsInCurrentLabel && existsInProbData;
    });
  }, [selectedItems, probData, getCodeByLabel, deferredArea, selectedLabel]);

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

  useLayoutEffect(() => {
    const previousLabel = prevLabelRef.current;
    if (previousLabel === selectedLabel) return;

    const { start, end } = ranges[deferredArea] || { start: 1, end: 45 };

    setSelectedItems((prev) => {
      const currentlySelectedCodes = Object.keys(prev).map(Number);
      if (currentlySelectedCodes.length === 0) return prev;
      const nextMapping: typeof prev = {};
      const translationMap = new Map();
      for (let num = start; num <= end; num++) {
        const oldCode = getCodeByLabel(num, previousLabel);
        const newCode = getCodeByLabel(num, selectedLabel);

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
  }, [selectedLabel, getCodeByLabel, deferredArea]);

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

  if (loading) {
    return null;
  }

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
        itensData,
        overviewData,
        respostaAoItemData,
        redacaoData,
        dificuldadeDoExame,

        // Carga solicitada pelo cliente (API interna: lazy)
        probInfoData,
        itemGraphData,
        acertosData,
        meanData,

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
        getCodeByLabel,
        getParamByLabel,
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
