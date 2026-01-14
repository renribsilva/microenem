"use client";

import { useState, useEffect } from 'react';

export function useDescribe(area: string) {
  // Iniciamos como null para saber que está carregando
  const [describeData, setDescribeData] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDescribeData = async () => {
      try {
        let data;
        // O import dinâmico faz o Next.js separar esses JSONs em arquivos diferentes
        switch (area) {
          case 'CH':
            data = await import("../app/(home)/2019/dificuldade-do-exame/json/CH/describe.json");
            break;
          case 'CN':
            data = await import("../app/(home)/2019/dificuldade-do-exame/json/CN/describe.json");
            break;
          case 'MT':
            data = await import("../app/(home)/2019/dificuldade-do-exame/json/MT/describe.json");
            break;
          default:
            data = await import("../app/(home)/2019/dificuldade-do-exame/json/LC/describe.json");
        }

        if (isMounted) {
          // No import dinâmico de JSON, os dados ficam na propriedade .default
          setDescribeData(data.default);
        }
      } catch (error) {
        console.error("Erro ao carregar describe.json dinamicamente:", error);
      }
    };

    loadDescribeData();

    return () => {
      isMounted = false;
    };
  }, [area]);

  return { describeData };
}