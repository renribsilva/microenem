"use client";

import { useState, useEffect } from 'react';

export function useFrequency(area: string) {
  const [frequencyData, setFrequencyData] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    const loadFrequencyData = async () => {
      try {
        let data;
        // O Next.js separa cada um desses arquivos em um "chunk" diferente
        switch (area) {
          case 'CH':
            data = await import("../app/(home)/2019/dados-do-exame/json/CH/frequency_acertos.json");
            break;
          case 'CN':
            data = await import("../app/(home)/2019/dados-do-exame/json/CN/frequency_acertos.json");
            break;
          case 'MT':
            data = await import("../app/(home)/2019/dados-do-exame/json/MT/frequency_acertos.json");
            break;
          default:
            data = await import("../app/(home)/2019/dados-do-exame/json/LC/frequency_acertos.json");
        }

        if (isMounted) {
          setFrequencyData(data.default);
        }
      } catch (error) {
        console.error("Erro ao carregar frequency_acertos dinamicamente:", error);
      }
    };

    loadFrequencyData();

    return () => {
      isMounted = false;
    };
  }, [area]);

  return {
    frequencyData
  };
}