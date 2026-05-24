export type DicDataType = {
  area: string[];
  ano: number[];
  codigo: number[];
  cor: string[];
  tipo: string[];
};

export type SelectionsByAreaType = {
  LC: string;
  CH: string;
  CN: string;
  MT: string;
};

interface TCCMetadata {
  codigo: number;
  area: string;
  cor: string;
  min: number;
  max: number;
  lingua: string | number;
  versao_digital: string | number;
  b_medio_enem: number;
}

export type ActiveTCCType = {
  area: string;
  labels_x: (number | null)[];
  metadata: TCCMetadata;
  data_teorico: (number | null)[];
  data_empirico: (number | null)[];
};

interface TCCAvailableItem {
  label: string;
  metadata: TCCMetadata;
}

export type AvailableTCCType = TCCAvailableItem[];

export type TCCCacheType = {
  year: number;
  resLabel: string;
  activeTCC: ActiveTCCType;
  availableTCC: AvailableTCCType;
};

export type HomeContextType = {
  activeTCC: ActiveTCCType;
  availableTCC: AvailableTCCType;
  selectedLabel: any;
  setSelectedLabel: any;
  activeArea: any;
  deferredArea: any;
  selectedRowId: any;
  setSelectedRowId: any;
  chartLogic: any;
  handleTabChange: any;
  isUpdating: any;
  dicData: any;
  hasDigital: any;
};
