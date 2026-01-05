import { useMemo } from 'react';
import describeLC from "../app/(home)/2019/dados-do-exame/json/LC/describe.json";
import describeCH from "../app/(home)/2019/dados-do-exame/json/CH/describe.json";
import describeCN from "../app/(home)/2019/dados-do-exame/json/CN/describe.json";
import describeMT from "../app/(home)/2019/dados-do-exame/json/MT/describe.json";

const describeMap: Record<string, any> = {
  LC: describeLC,
  CH: describeCH,
  CN: describeCN,
  MT: describeMT,
};

export function useDescribe(area: string) {
  // Retorna os dados da área selecionada ou LC como padrão
  const describeData = useMemo(() => {
    return describeMap[area] || describeLC;
  }, [area]);

  return {
    describeData
  };
}