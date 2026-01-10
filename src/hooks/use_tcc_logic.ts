"use client";

import { useState, useMemo } from 'react';
import dic from "../app/(home)/2019/json/dic_2019.json"; 
import { useChartTheme } from './chart_theme'; 

// OTIMIZAÇÃO: Criar um mapa de busca fora do hook para não processar o JSON toda hora
// Isso transforma uma busca lenta (indexOf) em uma busca instantânea (get)
const dicMap = new Map(
  dic.codigo.map((cod, i) => [
    cod, 
    { cor: dic.cor[i], aplicacao: dic.aplicacao[i] }
  ])
);

export function useTccLogic(allDatasets: any[], area: string) {
  const { colorMap } = useChartTheme();

  // 1. Filtra os datasets da área (Memorizado)
  const availableDatasets = useMemo(() => {
    return allDatasets.filter(ds => ds.metadata?.area === area);
  }, [allDatasets, area]);

  // 2. Estado do Label selecionado
  // Iniciamos com undefined para saber quando o usuário ainda não interagiu com a nova aba
  const [internalSelectedLabel, setInternalSelectedLabel] = useState<string | null>(null);

  // Fallback lógico: se não houver seleção manual, usa o primeiro da lista da aba atual
  const selectedLabel = internalSelectedLabel && availableDatasets.some(d => d.label === internalSelectedLabel)
    ? internalSelectedLabel 
    : availableDatasets[0]?.label;

  const setSelectedLabel = (label: string) => setInternalSelectedLabel(label);

  // 3. Define o dataset ativo
  const activeDataset = useMemo(() => {
    return availableDatasets.find(d => d.label === selectedLabel) || availableDatasets[0];
  }, [selectedLabel, availableDatasets]);

  // 4. Lógica do Índice Inicial (Cálculo puro, sem useEffect)
  const initialIndex = useMemo(() => {
    if (!activeDataset || !activeDataset.labels_x) return 0;
    const target = activeDataset.metadata.b_medio_enem;
    
    let closestIdx = 0;
    let minDiff = Math.abs(activeDataset.labels_x[0] - target);

    for (let i = 1; i < activeDataset.labels_x.length; i++) {
      const diff = Math.abs(activeDataset.labels_x[i] - target);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }
    return closestIdx;
  }, [activeDataset]);

  // 5. Estado do Slider
  const [userPointIndex, setUserPointIndex] = useState<number | null>(null);

  // Se o usuário não mexeu no slider nesta aba, usamos o initialIndex (b_medio)
  // Ao mudar a 'area', resetamos o userPointIndex para null no handleTabChange do pai
  // Ou simplesmente deixamos a lógica de memo limpar aqui:
  const pointIndex = userPointIndex !== null ? userPointIndex : initialIndex;

  // 6. Busca de informações do caderno OTIMIZADA com Map
  const currentInfo = useMemo(() => {
    if (!activeDataset?.metadata) return { fullText: "", corNome: "" };
    
    const { codigo, lingua } = activeDataset.metadata;
    const info = dicMap.get(codigo);

    if (!info) return { fullText: `Caderno ${codigo}`, corNome: "" };    
    
    let textoBase = info.cor;    
    if (area === 'LC' && (lingua === 0 || lingua === 1)) {
      textoBase += lingua === 0 ? " (Inglês)" : " (Espanhol)";
    }
    return { fullText: `${textoBase} - ${info.aplicacao}`, corNome: info.cor };
  }, [activeDataset, area]);

  const chartColor = colorMap[currentInfo.corNome] || "#3b82f6";

  // 7. Valores de saída
  const proficienciaAtual = activeDataset?.labels_x?.[pointIndex] || 0;
  const acertosEsperados = activeDataset?.data?.[pointIndex] || 0;
  
  const xMin = activeDataset?.metadata?.min ? Math.floor(activeDataset.metadata.min / 100) * 100 : 0;
  const xMax = activeDataset?.metadata?.max ? Math.ceil(activeDataset.metadata.max / 100) * 100 : 1000;

  // Função mantida para compatibilidade, mas agora usa o Map interno
  const getInfoCaderno = (codigo: number, lingua?: any) => {
    const info = dicMap.get(codigo);
    if (!info) return { fullText: `Caderno ${codigo}`, corNome: "" };
    let textoBase = info.cor;
    if (area === 'LC' && (lingua === 0 || lingua === 1)) {
      textoBase += lingua === 0 ? " (Inglês)" : " (Espanhol)";
    }
    return { fullText: `${textoBase} - ${info.aplicacao}`, corNome: info.cor };
  };

  return {
    availableDatasets,
    selectedLabel,
    setSelectedLabel,
    activeDataset,
    pointIndex,
    setPointIndex: setUserPointIndex,
    chartColor,
    currentInfo,
    proficienciaAtual,
    resultadoAtual: acertosEsperados,
    xMax,
    xMin,
    bMedio: activeDataset?.metadata?.b_medio_enem || 0,
    getInfoCaderno
  };
}