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

export type YearContextType = {
  lastItemActivate: number;
  selectedItems: SelectedItemsType | object;
  itensData: ItensDataType | null;
  overviewData: OverviewType;
  respostaAoItemData: RespostaAoItemType;
  redacaoData: RedacaoType;
  dificuldadeDoExame: DificuldadeDoExameType;

  densityDifData: FreqDensityType["regular"] | null;
  describeDifData: DescribeType["regular"] | null;
  frequencyDifData: FreqDensityType["regular"] | null;
  describeRowData: any;
  activeSelectedRow: any;
  abandonadosCodes: any;
  FIXED_PALETTE: any;
  d: any;
  k: any;
  probData: any;
  probLabels: any;
  infoData: any;
  infoLabels: any;
  setLastItemActivate: any;
  lastItemActivateNum: any;
  setLastItemActivateNum: any;
  handleToggle: any;
  getCodeByLabel: any;
  getParamByLabel: any;
  activeCodes: any;
  acertosData: any;
  acertosNum: any;
  setAcertosNum: any;
  itemGraphData: any;
  EAPData: any;
  sampleEAP: any;
  setSampleEAP: any;
  setUpdateTrigger: any;
  updateTrigger: any;
  intervalData: any;
  top2000Data: any;
  activeRanking: any;
  setActiveRanking: any;
  candidateData: any;
  getAreaMap: any;
  currentYear: any;
};
