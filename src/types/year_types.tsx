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

export type inscritosItem = {
  grupo: string;
  total: number;
  freq: number;
  subRows?: inscritosItem[];
};

export type inscritosType = inscritosItem[];

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
  inscritos: inscritosType | null;
  abstencaoDia1: AbstencaoType | null;
  abstencaoDia2: AbstencaoType | null;
  corRacaData: CorRacaDataType | null;
  sexoData: FxSexoType | null;
  fxEtariaData: FxSexoType | null;
};

export type YearContextType = {
  lastItemActivate: number;
  selectedItems: SelectedItemsType | object;
  itensData: ItensDataType | null;
  overviewData: OverviewType;
  inscritos: inscritosType | null;
  abstencaoDia1: AbstencaoType | null;
  abstencaoDia2: AbstencaoType | null;
  corRacaData: CorRacaDataType | null;
  sexoData: FxSexoType | null;
  fxEtariaData: FxSexoType | null;
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
  scoreData: any;
  handleToggle: any;
  getCodeByLabel: any;
  getParamByLabel: any;
  activeCodes: any;
  acertosData: any;
  acertosNum: any;
  setAcertosNum: any;
  itemGraphData: any;
  densityDifData: any;
  describeDifData: any;
  frequencyDifData: any;
  competenciaRowData: any;
  statusData: any;
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
  isDigital: any;
};
