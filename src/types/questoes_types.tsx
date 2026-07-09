export type CropArea = {
  pagina: number;
  cropHeight: number;
  cropWidth: number;
  offsetX: number;
  offsetY: number;
};

export type QuestaoCoordenadas = {
  codigo: number;
  scale: number;
  crops?: CropArea[];
  direction?: "row" | "column";
};
