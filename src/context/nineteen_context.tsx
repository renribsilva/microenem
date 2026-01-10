"use client";

import { createContext, useContext, useMemo, ReactNode } from "react";
import { useHomeData } from "./home_context";
import { useDescribe } from "../hooks/use_describe_data"; // Ajuste o caminho se necessário

const NineteenContext = createContext<any>(null);

// Mapeamentos e Helpers movidos para fora para evitar re-declaração
const labelMap: Record<string, string> = {
  mean: "Média", median: "Mediana", mode: "Moda", sd: "Desvio Padrão",
  min: "Mínima", max: "Máxima", skew: "Assimetria", kurtosis: "Curtose",
  q1: "1º quartil", q3: "3º quartil", p99: "Percentil 99"
};

const rowOrder = ["mean", "median", "mode", "min", "max", "sd", "q1", "q3", "p99", "skew", "kurtosis"];

const formatValue = (key: string, val: any, type: 'nota' | 'acerto') => {
  if (typeof val !== "number") return val;
  const isSpecial = key === 'skew' || key === 'kurtosis';
  return val.toLocaleString('pt-BR', { 
    maximumFractionDigits: isSpecial ? 2 : (type === 'nota' ? 1 : 0), 
    minimumFractionDigits: 0 
  });
};

export function NineteenProvider({ children }: { children: ReactNode }) {
  const { deferredArea, selectedRowId } = useHomeData();
  const { describeData } = useDescribe(deferredArea);

  // 1. Gera o array de linhas para a tabela
  const tableData = useMemo(() => {
    if (!describeData?.notas) return [];
    return rowOrder
      .filter(key => describeData.notas[key] !== undefined)
      .map((key) => ({
        id: key, 
        metric: labelMap[key] || key,
        nota: formatValue(key, describeData.notas[key], 'nota'),
        acerto: formatValue(key, describeData.acertos?.[key], 'acerto')
      }));
  }, [describeData, deferredArea]);

  // 2. Monta o objeto de retorno solicitado
  // Inclui o describeData bruto caso o gráfico precise de valores não formatados
  const describeRowData = useMemo(() => ({
    data: tableData,
    n: describeData?.notas?.n || 0,
    raw: describeData // Útil para os gráficos acessarem valores numéricos puros
  }), [tableData, describeData]);

  // 3. Helper para encontrar a linha selecionada persistente
  // Isso evita que cada gráfico tenha que procurar no array
  const activeSelectedRow = useMemo(() => {
    return tableData.find(row => row.id === selectedRowId) || null;
  }, [tableData, selectedRowId]);

  return (
    <NineteenContext.Provider value={{ 
      describeRowData, 
      activeSelectedRow,
      describeData // Dados brutos para hooks como useDensity que dependem dele
    }}>
      {children}
    </NineteenContext.Provider>
  );
}

export const useNineteenData = () => {
  const context = useContext(NineteenContext);
  if (!context) {
    throw new Error("useNineteenData deve ser usado dentro de um NineteenProvider");
  }
  return context;
};