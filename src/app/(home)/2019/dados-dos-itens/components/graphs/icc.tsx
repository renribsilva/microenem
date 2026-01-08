"use client";

import { 
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineController, 
  LineElement,
  PointElement,
  Tooltip,
  Legend
} from "chart.js";
import annotationPlugin from 'chartjs-plugin-annotation';
import probtraceData from "../../../json/probtrace_2019.json";
import { Line } from "react-chartjs-2";
import constantes from "../../../../json/constantes.json";
import { useChartTheme } from "../../../../../../hooks/chart_theme";
import ItensData from "../../../json/itens_2019.json"
import { useEffect, useMemo } from "react";
import styles from "./graphs.module.css"
import InputShell2 from "../../../../../../components/tsx/input_shell2";

ChartJS.register(
  LineController, 
  LineElement, 
  PointElement, 
  CategoryScale, 
  LinearScale, 
  Tooltip, 
  Legend,
  annotationPlugin
);

interface ICCChartProps {
  itemSelection: Record<number, 'acerto' | 'erro'>;
  logic: any;
  area: string;
  lastItemActive: number;
  onFilterChange?: (filtered: number[]) => void;
}

export default function ICCChart({ 
  itemSelection, 
  logic, 
  area, 
  lastItemActive,
  onFilterChange
}: ICCChartProps) {
  
  const FIXED_PALETTE = Array.from({ length: 45 }, (_, i) => `hsl(${(i * 360) / 45}, 70%, 50%)`);
  const { gridColor } = useChartTheme();
  
  const abandonadosCodes = useMemo(() => {
    const codes = new Set<number>();
    const data = ItensData as any;
    if (data?.CO_ITEM && data?.IN_ITEM_ABAN) {
      data.CO_ITEM.forEach((code: number, index: number) => {
        if (data.IN_ITEM_ABAN[index] === 1) codes.add(code);
      });
    }
    return codes;
  }, []);

  if (!logic) return null;

  const { selectedLabel, chartColor, proficienciaAtual } = logic;
  const [co_p_selected] = selectedLabel.split('_');
  const areaIdx = constantes.area.indexOf(area || "LC");
  const d = constantes.d[areaIdx];
  const k = constantes.k[areaIdx];

  const transformTheta = (theta: number) => (area === "MT" ? theta : (theta * k) + d);

  const provaData = (probtraceData.datasets as any)[co_p_selected];
  const codes = Object.keys(itemSelection).map(Number);
  let hasAbandonedItem = false;

  const chartDatasets = codes.map((code) => {
    const itemKey = String(code);
    const status = itemSelection[code];
    const rawPoints = provaData?.[itemKey] as (number | null)[];

    if (!rawPoints) return null; 

    const isAbandoned = abandonadosCodes.has(lastItemActive) && rawPoints.every(p => p === null);
    if (isAbandoned) {
      hasAbandonedItem = true;
      return null;
    }

    const allItemsInProva = Object.keys(provaData || {});
    const colorIndex = allItemsInProva.indexOf(itemKey);

    return {
      label: `Item ${code}`,
      data: rawPoints.map((yValue, idx) => ({
        x: transformTheta(probtraceData.theta_labels[idx]),
        y: status === 'erro' ? 1 - (yValue || 0) : (yValue || 0)
      })),
      borderColor: colorIndex !== -1 ? FIXED_PALETTE[colorIndex % 45] : "#999",
      backgroundColor: 'transparent',
      tension: 0.3,
      pointRadius: 0,
      borderWidth: 2,
      borderDash: status === 'erro' ? [4, 2] : [], 
    };
  }).filter(Boolean);

  const xMin = area === "MT" ? -4 : Math.floor(transformTheta(-4) / 100) * 100;
  const xMax = area === "MT" ? 6 : Math.ceil(transformTheta(5) / 100) * 100;

  const codesFiltrados = useMemo(() => {
    const allSelectedCodes = Object.keys(itemSelection).map(Number);
    if (!provaData) return [];
    
    // Retorna apenas os códigos que existem nas chaves do JSON da prova atual
    return allSelectedCodes.filter(code => String(code) in provaData);
  }, [itemSelection, provaData]);

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(codesFiltrados);
    }
  }, [area, codesFiltrados]);

  const options: any = { // O 'any' aqui resolve o erro de atribuição do TS
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { min: 0, max: 1, grid: { color: gridColor }, title: { display: true, text: 'Probabilidade' },},
      x: {
        type: 'linear',
        min: xMin,
        max: xMax,
        grid: { color: gridColor },
        ticks: {
          callback: (val: number) => (area === "MT" ? val : (val % 100 === 0 ? val : null))
        },
        title: { display: true, text: `Notas do Enem (${area})` }
      }
    },
    plugins: {
      legend: { display: false },
      datalabels: {display: false},
      annotation: {
        annotations: {
          ...(codesFiltrados.length > 0 ? {
            proficienciaLinha: {
              type: 'line',
              xMin: proficienciaAtual,
              xMax: proficienciaAtual,
              borderColor: chartColor || '#ff0000',
              borderWidth: 2,
              label: {
                display: true,
                content: `Posição da nota: ${Math.round(proficienciaAtual)}`,
                position: 'end',
                backgroundColor: chartColor || '#ff0000',
                color: '#fff'
              }
            }
          } : {}),
          ...(hasAbandonedItem ? {
            aviso: {
              type: 'label',
              xValue: (xMin + xMax) / 2,
              yValue: 0.5,
              content: ['⚠️ Item abandonado na TRI', 'Sem parâmetros'],
              color: '#d32f2f',
              backgroundColor: 'rgba(255, 255, 255, 0.9)'
            }
          } : {})
        }
      }
    }
  };

  return (
    <div className={styles.icc_container}>
      <Line data={{ datasets: chartDatasets as any }} options={options} />
      <div className={styles.icc_slider}>
        <InputShell2 logic={logic} />
      </div>
    </div>
  );
}