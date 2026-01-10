import { useState, useEffect } from 'react';

export function useDensity(area: string) {
  const [densityData, setDensityData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      let data;
      switch (area) {
        case 'CH':
          data = await import("../app/(home)/2019/dados-do-exame/json/CH/density.json");
          break;
        case 'CN':
          data = await import("../app/(home)/2019/dados-do-exame/json/CN/density.json");
          break;
        case 'MT':
          data = await import("../app/(home)/2019/dados-do-exame/json/MT/density.json");
          break;
        default:
          data = await import("../app/(home)/2019/dados-do-exame/json/LC/density.json");
      }
      setDensityData(data.default);
    };

    loadData();
  }, [area]);

  return { densityData };
}