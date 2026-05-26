import { ParamValue } from "next/dist/server/request/params";
import { Dispatch, SetStateAction } from "react";

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

export type PointIndexType = {
  pointIndex: number;
  setPointIndex: Dispatch<SetStateAction<number | null>>;
};

interface MetadataResult {
  fullText: string;
  corNome: string;
}

export type GetMetadataType = (
  codigo: number,
  lingua?: number | string,
) => MetadataResult;

export type chartPropsType = {
  chartColor: string;
  proficienciaAtual: number;
  resultadoAtual: number;
  xMin: number;
  xMax: number;
  bMedio: number;
};

export type HomeContextType = {
  // Definições iniciais
  currentYear: ParamValue;
  activeArea: SelectionsByAreaType["LC"];
  deferredArea: SelectionsByAreaType["LC"];
  selectedLabel: SelectionsByAreaType["LC"];
  selectedRowId: string;
  isUpdating: boolean;

  // Carga dinâmica do dicionário no server (bundle inicial)
  dicData: DicDataType;

  //Carga dinâmica do TCC solicitada pelo cliente (API)
  activeTCC: ActiveTCCType;
  availableTCC: AvailableTCCType;

  // Chart props
  pointIndexStuff: PointIndexType;
  chartProps: chartPropsType;

  // Funções
  setSelectedRowId: React.Dispatch<React.SetStateAction<string | null>>;
  handleTabChange: React.Dispatch<React.SetStateAction<string | null>>;
  getMetadata: GetMetadataType;
  setSelectedLabel: React.Dispatch<React.SetStateAction<string | null>>;
};
