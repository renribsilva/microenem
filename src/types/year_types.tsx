export type ConstantesType = {
  areaIdx: number;
  d: number;
  k: number;
};

interface SelectedItemsItem {
  status: string;
  posicao: number;
}

export type SelectedItemsType = Record<number, SelectedItemsItem>;

export type ItensDataType = {
  CO_POSICAO: number[];
  SG_AREA: string[];
  CO_ITEM: number[];
  TX_GABARITO: (string | null)[];
  CO_HABILIDADE: number[];
  IN_ITEM_ABAN: number[];
  TX_MOTIVO_ABAN: string[];
  NU_PARAM_A: (number | null)[];
  NU_PARAM_B: (number | null)[];
  NU_PARAM_C: (number | null)[];
  TX_COR: string[];
  CO_PROVA: number[];
  TP_LINGUA: (number | null)[];
  IN_ITEM_ADAPTADO: (number | null)[];
  TP_VERSAO_DIGITAL?: (number | null)[];
};

export type InscritosItem = {
  grupo: string;
  total: number;
  freq: number;
  subRows?: InscritosItem[];
};

export type InscritosType = InscritosItem[];

interface AbstencaoItem {
  grupo: string;
  total: number;
  abst: number;
}

export type AbstencaoType = AbstencaoItem[];

interface CorRacaTreeItem {
  label: string;
  value: number;
  abs: number;
}

interface CorRacaDatasetItem {
  tree: CorRacaTreeItem[];
  key: string;
  groups: string[];
  n: number;
}

export type CorRacaDataType = {
  datasets: CorRacaDatasetItem[];
};

interface FxSexoDatasetItem {
  data: number[];
  abs_values: number[];
  n: number;
}

export type FxSexoType = {
  labels: string[];
  datasets: FxSexoDatasetItem[];
};

export type OverviewType = {
  inscritosData: InscritosType | null;
  abstencaoDia1: AbstencaoType | null;
  abstencaoDia2: AbstencaoType | null;
  corRacaData: CorRacaDataType | null;
  sexoData: FxSexoType | null;
  fxEtariaData: FxSexoType | null;
};

interface ScoreItem {
  0: number | number[];
  1: number | number[];
  7: number | number[];
  8: number | number[];
  labels: string[];
}

export type ScoreType = Record<
  string,
  {
    counts: ScoreItem;
    bins: ScoreItem;
  }
>;

interface FrequenciaItem {
  labels: number[];
  values: (number | null)[];
}

interface EstatisticasItem {
  media: number;
  mediana: number;
  moda: number;
  sd: number;
  q1: number;
  q3: number;
  p99: number;
  skew: number;
  kurtosis: number;
  n: number;
}

interface DensidadeItem {
  x: (number | null)[];
  y: (number | null)[];
}

interface NUNotaItem {
  nome: string;
  frequencia: FrequenciaItem;
  estatisticas: EstatisticasItem;
  densidade: DensidadeItem;
}

export type CompetenciaRowType = {
  NU_NOTA_COMP1: NUNotaItem;
  NU_NOTA_COMP2: NUNotaItem;
  NU_NOTA_COMP3: NUNotaItem;
  NU_NOTA_COMP4: NUNotaItem;
  NU_NOTA_COMP5: NUNotaItem;
  NU_NOTA_REDACAO: NUNotaItem;
};

interface StatusItem {
  data: number[];
  n_total: number;
}

export type StatusType = {
  labels: string[];
  datasets: StatusItem[];
};

export type RespostaAoItemType = {
  scoreData: ScoreType | null;
};

export type RedacaoType = {
  competenciaRowData: CompetenciaRowType;
  statusData: StatusType;
};

interface FreqDensityDatasetDataItem {
  x: number;
  y: number;
}

interface FreqDensityDatasetItem {
  id?: string;
  label?: string;
  data: FreqDensityDatasetDataItem;
}

export type FreqDensityType = {
  digital: object;
  regular: {
    datasets: FreqDensityDatasetItem[];
  };
};

interface DescribeItem {
  vars: number;
  n: number;
  mean: number;
  sd: number;
  median: number;
  trimmed: number;
  mad: number;
  min: number;
  max: number;
  range: number;
  skew: number;
  kurtosis: number;
  se: number;
  mode: number;
  q1: number;
  q3: number;
  p99: number;
  cor_min?: string;
  cor_max?: string;
  cod_min?: number;
  cod_max?: number;
}

export type DescribeType = {
  digital: object;
  regular: {
    notas: DescribeItem;
    acertos: DescribeItem;
  };
};

export type DificuldadeDoExameType = {
  densityDifData: FreqDensityType["regular"] | null;
  describeDifData: DescribeType["regular"] | null;
  frequencyDifData: FreqDensityType["regular"] | null;
};

export type InfoProbDataType = Record<string, number[]> | null;

export type InfoProbLabelType = number[];

export type ProbCacheType = {
  co_p: string;
  dataset: InfoProbDataType;
  labels: InfoProbLabelType;
};

export type ItemGraphType = {
  x: number[];
  y: number[];
};

export type ItemGraphCacheType = {
  code: number;
  dataset: ItemGraphType;
};

interface AcertosDensityItem {
  x: number[];
  y: number[];
}

interface AcertosItem {
  n: number;
  mean: number;
  sd: number;
  median: number;
  trimmed: number;
  mad: number;
  min: number;
  max: number;
  range: number;
  skew: number;
  kurtosis: number;
  se: number;
  density: AcertosDensityItem;
}

export type AcertosDataType = Record<string, AcertosItem>;

export type AcertosDataCacheType = {
  area: string;
  dataset: AcertosDataType;
  versao: string;
};

interface ImpactoItem {
  posicao: number[];
  valor: number[];
}

export type EAPDataType = {
  theta: number[];
  posterior: number[];
  eap: number[];
  theta_eap: number[];
  impacto_individual: Record<string, ImpactoItem>;
};

export type ProbInfoDataType = {
  infoData: InfoProbDataType | null;
  probData: InfoProbDataType | null;
  probLabels: InfoProbLabelType | null;
  infoLabels: InfoProbLabelType | null;
};

export type TableDataItem = {
  acerto: string;
  id: string;
  metric: string;
  nota: string;
};

export type TableDataType = TableDataItem[];

export type DescribeRowDataType = {
  data: TableDataType;
  n: number;
  raw: {
    notas: DescribeItem;
    acertos: DescribeItem;
  };
  cod_min_ref: number;
  cod_max_ref: number;
  cor_min_ref: string;
  cor_max_ref: string;
};

interface Top2000Item {
  ranking: number;
  media: number;
}

export type Top2000Type = Top2000Item[];

export type dificuldadeDoExameAuxType = {
  describeRowData: DescribeRowDataType;
  activeSelectedRow: TableDataItem;
};

export type CandidateDataType = {
  RANKING: number;
  SCORE_LC: string;
  SCORE_CH: string;
  SCORE_CN: string;
  SCORE_MT: string;
  CO_PROVA_CN: number;
  CO_PROVA_CH: number;
  CO_PROVA_LC: number;
  CO_PROVA_MT: number;
  NU_NOTA_CN: number;
  NU_NOTA_CH: number;
  NU_NOTA_LC: number;
  NU_NOTA_MT: number;
  NU_NOTA_COMP1: number;
  NU_NOTA_COMP2: number;
  NU_NOTA_COMP3: number;
  NU_NOTA_COMP4: number;
  NU_NOTA_COMP5: number;
  NU_NOTA_REDACAO: number;
  TP_LINGUA: number | null;
  MEDIA_GERAL: number;
};

export type MeanDataType = {
  activeRanking: number;
  top2000Data: Top2000Type;
  candidateData: CandidateDataType;
};

export type FormatValueType = (
  key: string,
  val: number | null,
  type: "nota" | "acerto",
) => string;

export type GetCodeByLabelType = (num: number, label: string) => number | null;

export type GetParamByLabelType = (
  num: number,
  label: string,
  type: string,
) => number | null;

export type HandleToggleType = (num: number, isAbandoned: boolean) => void;

interface AreaItemMap {
  pos: number;
  status: "abandoned" | "correct" | "wrong";
  co_item: number;
}

// 2. Tipo da Função (A assinatura completa do contrato)
export type GetAreaMapType = (
  codProva: number,
  tpLingua: number,
  score: string,
) => AreaItemMap[];

export type ViolinDataType = {
  0: number[];
  1: number[];
  labels: string[];
};

export type YearContextType = {
  lastItemActivate: number;
  selectedItems: SelectedItemsType | object;
  acertosNum: number;
  sampleEAP: string;
  fixedPalette: Record<number, string>;

  //Updatings
  isInitialRender: boolean;
  needUpdateEAP: boolean;

  // Carga estática no server
  constantesData: ConstantesType;

  // Carga dinamenica no server (bundle inicial)
  itensData: ItensDataType | null;
  overviewData: OverviewType;
  respostaAoItemData: RespostaAoItemType;
  redacaoData: RedacaoType;
  dificuldadeDoExame: DificuldadeDoExameType;

  // Carga solicitada pelo cliente (API)
  probInfoData: ProbInfoDataType;
  itemGraphData: ItemGraphType | null;
  acertosData: AcertosDataType | null;
  meanData: MeanDataType;

  // Carga solicitada pelo cliente (API externa: Render)
  EAPData: EAPDataType | null;
  isFetchingEAP: boolean;

  // Transformação de dados
  abandonadosCodes: Set<number>;
  activeCodes: number[];
  dificuldadeDoExameAux: dificuldadeDoExameAuxType;
  lastItemActivateNum: number;
  intervalData: string;
  violinData: ViolinDataType;

  // Funções
  getCodeByLabel: GetCodeByLabelType;
  getParamByLabel: GetParamByLabelType;
  handleToggle: HandleToggleType;
  getAreaMap: GetAreaMapType;
  setNeedUpdateEAP: React.Dispatch<React.SetStateAction<boolean>>;
  setIsFetchingEAP: React.Dispatch<React.SetStateAction<boolean>>;
  setIsInitialRender: React.Dispatch<React.SetStateAction<boolean>>;
  setSampleEAP: React.Dispatch<React.SetStateAction<string>>;
  setAcertosNum: React.Dispatch<React.SetStateAction<number | null>>;
  setLastItemActivateNum: React.Dispatch<React.SetStateAction<number>>;
  setActiveRanking: React.Dispatch<React.SetStateAction<number | null>>;
  setLastItemActivate: React.Dispatch<React.SetStateAction<number>>;
  handleTabChange: (id: string) => void;
  setItemGraphData: React.Dispatch<React.SetStateAction<ItemGraphType | null>>;
  setAcertosData: React.Dispatch<React.SetStateAction<AcertosDataType | null>>;
};
