import { useMemo } from 'react';
import densityLC from "../app/(home)/2019/dados-do-exame/json/LC/density.json";
import densityCH from "../app/(home)/2019/dados-do-exame/json/CH/density.json";
import densityCN from "../app/(home)/2019/dados-do-exame/json/CN/density.json";
import densityMT from "../app/(home)/2019/dados-do-exame/json/MT/density.json";

const densityMap: Record<string, any> = {
  LC: densityLC,
  CH: densityCH,
  CN: densityCN,
  MT: densityMT,
};

export function useDensity(area: string) {
  // Retorna os dados da área selecionada ou LC como padrão
  const densityData = useMemo(() => {
    return densityMap[area] || densityLC;
  }, [area]);

  return {
    densityData
  };
}