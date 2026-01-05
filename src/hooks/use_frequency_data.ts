import { useMemo } from 'react';
import frequencyLC from "../app/(home)/2019/dados-do-exame/json/LC/frequency_acertos.json";
import frequencyCH from "../app/(home)/2019/dados-do-exame/json/CH/frequency_acertos.json";
import frequencyCN from "../app/(home)/2019/dados-do-exame/json/CN/frequency_acertos.json";
import frequencyMT from "../app/(home)/2019/dados-do-exame/json/MT/frequency_acertos.json";

const frequencyMap: Record<string, any> = {
  LC: frequencyLC,
  CH: frequencyCH,
  CN: frequencyCN,
  MT: frequencyMT,
};

export function useFrequency(area: string) {
  // Retorna os dados da área selecionada ou LC como padrão
  const frequencyData = useMemo(() => {
    return frequencyMap[area] || frequencyLC;
  }, [area]);

  return {
    frequencyData
  };
}