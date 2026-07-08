export type CropArea = {
  cropHeight: number;
  cropWidth: number;
  offsetX: number;
  offsetY: number;
};

export type QuestaoCoordenadas = {
  codigo: number;
  pagina: number;
  scale: number;
  crops?: CropArea[];
  direction?: "row" | "column";
};
