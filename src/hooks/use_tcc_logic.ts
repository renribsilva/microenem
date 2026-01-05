import { useState, useMemo, useEffect } from 'react';
import dic from "../app/(home)/2019/json/dic_2019.json"; 
import { useChartTheme } from './chart_theme'; 

export function useTccLogic(allDatasets: any[], area: string) {
  
  const { colorMap } = useChartTheme();

  // 1. Filtra os datasets da área
  const availableDatasets = useMemo(() => {
    return allDatasets.filter(ds => ds.metadata?.area === area);
  }, [allDatasets, area]);

  // Sincroniza o label selecionado quando a área muda
  const [selectedLabel, setSelectedLabel] = useState<string>(availableDatasets[0]?.label);
  
  useEffect(() => {
    if (availableDatasets.length > 0) {
      setSelectedLabel(availableDatasets[0].label);
    }
  }, [area, availableDatasets]);

  // 2. Define o dataset ativo
  const activeDataset = useMemo(() => {
    return availableDatasets.find(d => d.label === selectedLabel) || availableDatasets[0];
  }, [selectedLabel, availableDatasets]);

  // 3. Lógica do Índice Inicial (Slider deve nascer no b_medio)
  const initialIndex = useMemo(() => {
    if (!activeDataset || !activeDataset.labels_x) return 0;
    const target = activeDataset.metadata.b_medio_enem;
    
    // Encontra o índice cuja nota x é mais próxima do b_medio_enem
    return activeDataset.labels_x.reduce((prev, curr, idx) => {
      return Math.abs(curr - target) < Math.abs(activeDataset.labels_x[prev] - target) ? idx : prev;
    }, 0);
  }, [activeDataset]);

  // Estado do Slider inicializado em 0 e atualizado pelo useEffect
  const [pointIndex, setPointIndex] = useState<number>(0);

  useEffect(() => {
    setPointIndex(initialIndex);
  }, [initialIndex]);

  // 1. Defina a função primeiro (o motor lógico)
  const getInfoCaderno = (codigo: number, lingua?: any) => {
    const idx = dic.codigo.indexOf(codigo);
    if (idx === -1) return { fullText: `Caderno ${codigo}`, corNome: "" };    
    const corNome = dic.cor[idx];
    const aplicacao = dic.aplicacao[idx];
    let textoBase = corNome;    
    if (area === 'LC' && (lingua === 0 || lingua === 1)) {
      textoBase += lingua === 0 ? " (Inglês)" : " (Espanhol)";
    }
    return { fullText: `${textoBase} - ${aplicacao}`, corNome: corNome };
  };

  // 2. Use a função para pegar os dados do dataset ATIVO
  const currentInfo = useMemo(() => {
    if (!activeDataset?.metadata) return { fullText: "", corNome: "" };
    return getInfoCaderno(activeDataset.metadata.codigo, activeDataset.metadata.lingua);
  }, [activeDataset, area]); // Se o dataset mudar, o currentInfo atualiza automático

  const chartColor = colorMap[currentInfo.corNome] || "#3b82f6";

  // 5. Valores de saída para o gráfico e para o InputShell
  const proficienciaAtual = activeDataset?.labels_x?.[pointIndex] || 0;
  const acertosEsperados = activeDataset?.data?.[pointIndex] || 0;
  
  const xMin = Math.floor((activeDataset?.metadata?.min) / 100) * 100;
  const xMax = Math.ceil((activeDataset?.metadata?.max) / 100) * 100;

  return {
    availableDatasets,
    selectedLabel,
    setSelectedLabel,
    activeDataset,
    pointIndex,
    setPointIndex,
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