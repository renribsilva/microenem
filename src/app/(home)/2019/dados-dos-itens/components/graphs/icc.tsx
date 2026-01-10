"use client";

import { useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import probtraceData from "../../../json/probtrace_2019.json";
import constantes from "../../../../json/constantes.json";
import { useChartTheme } from "../../../../../../hooks/chart_theme";
import ItensData from "../../../json/itens_2019.json";
import styles from "./graphs.module.css";
import InputShell2 from "../../../../../../components/tsx/input_shell2";

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
  
  const { gridColor, axisColor } = useChartTheme();
  const [activeCodes, setActiveCodes] = useState<number[]> ([]);
  
  // Paleta fixa para manter consistência entre re-renderizações
  const FIXED_PALETTE = useMemo(() => 
    Array.from({ length: 45 }, (_, i) => `hsl(${(i * 360) / 45}, 70%, 50%)`), 
  []);

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

  const { selectedLabel, chartColor, proficienciaAtual, setPointIndex } = logic;
  const [co_p_selected] = selectedLabel.split('_');
  const areaIdx = constantes.area.indexOf(area || "LC");
  const d = constantes.d[areaIdx];
  const k = constantes.k[areaIdx];

  const transformTheta = (theta: number) => ((theta * k) + d);

  const provaData = (probtraceData.datasets as any)[co_p_selected];

  // --- PROCESSAMENTO DE DADOS PARA APEXCHARTS ---
  const { series, hasAbandonedItem } = useMemo(() => {
    let abandonedFound = false;
    const codes = Object.keys(itemSelection).map(Number);
    const allItemsInProva = Object.keys(provaData || {});
    const chartSeries = codes
      .map((code) => {
        const itemKey = String(code);
        const isAbandoned = abandonadosCodes.has(code); 
        if (isAbandoned) {
          if (code === lastItemActive) abandonedFound = true;
          return null; // Remove o item abandonado da série do gráfico
        }
        const status = itemSelection[code];
        const rawPoints = provaData?.[itemKey] as (number | null)[];
        if (!rawPoints) return null;
        const colorIndex = allItemsInProva.indexOf(itemKey);
        return {
          item: code,
          name: `Item ${code}`, // Nomeclatura para o motor do gráfico
          data: rawPoints.map((yValue, idx) => ({
            x: transformTheta(probtraceData.theta_labels[idx]),
            y: parseFloat((status === 'erro' ? 1 - (yValue || 0) : (yValue || 0)).toFixed(3))
          })),
          color: colorIndex !== -1 ? FIXED_PALETTE[colorIndex % 45] : "#999",
          strokeDashArray: status === 'erro' ? 4 : 0,
        };
      })
      .filter(Boolean); // Remove os nulls (itens abandonados ou sem dados)

    return { series: chartSeries, hasAbandonedItem: abandonedFound};
  }, [itemSelection, provaData, area, abandonadosCodes, lastItemActive]);
  
  const xMin = Math.floor(transformTheta(-6) / 100) * 100;
  const xMax = Math.ceil(transformTheta(6) / 100) * 100;
  
  // --- CONFIGURAÇÕES DO APEXCHARTS ---
  const options: ApexCharts.ApexOptions = useMemo(() => {
    return {
      chart: {
        id: "icc-chart",
        type: 'line',
        toolbar: { show: true },
        zoom: {
          enabled: false
        },
        animations: {
          enabled: false, 
          dynamicAnimation: {
            enabled: false 
          }
        },
        events: {
          // EVENTO DE CLIQUE PARA ATUALIZAR PROFICIÊNCIA
          click: function(event, chartContext, config) {
            // Se o elemento clicado (ou o pai dele) tiver classes da toolbar, ignore.
            const isToolbar = event.target.closest('.apexcharts-toolbar');
            if (isToolbar) return;
            const clickedIndex = config.dataPointIndex;
            if (clickedIndex !== undefined && clickedIndex > -1) {
              setPointIndex(clickedIndex);
            }
          }
        },
      },
      stroke: {
        curve: 'monotoneCubic', 
        width: 2, 
        lineCap: 'round',
        dashArray: series.map((s: any) => s.strokeDashArray)
      },
      colors: series.map((s: any) => s.color),
      xaxis: {
        type: 'numeric',
        min: xMin,
        max: xMax,
        labels: { 
          style: { colors: axisColor },
          formatter: (val: any) => parseFloat(val).toFixed(0)
        },
        title: { text: `Notas do Enem (${area})`, style: { color: axisColor } },
        axisBorder: { show: false },
        tooltip: {
          enabled: true,
        },
        crosshairs: {
          show: true,
          width: 1,
          position: 'back',
          opacity: 0.9,
          stroke: {
            color: axisColor,
            width: 1,
            dashArray: 3,
          },
        },
      },
      tooltip: {
        enabled: true,       
        shared: true,        
        custom: function() { 
          return ''; 
        },
        marker: {
          show: false
        }
      },
      yaxis: {
        min: 0,
        max: 1,
        tickAmount: 5,
        labels: { 
          style: { colors: axisColor },
          formatter: (val) => val.toFixed(1)
        },
        title: { text: 'Probabilidade', style: { color: axisColor } }
      },
      grid: { borderColor: gridColor },
      legend: { show: false },
      annotations: {
        xaxis: [
          {
            x: proficienciaAtual,
            borderColor: chartColor || '#ff0000',
            strokeDashArray: 0,
            label: {
              text: `Traço de prob. da nota ${Math.round(proficienciaAtual)}`,
              style: { color: '#fff', background: chartColor || '#ff0000' },
              borderWidth: 0,
            }
          }
        ],
        points: hasAbandonedItem
          ? [{
              x: (xMin + xMax) / 2,
              y: 0.5,
              label: {
                text: '⚠️ Item abandonado na TRI (sem parâmetros)',
                style: { color: '#fff', background: '#d32f2f' }
              }
            }] 
          : []
      }
    };
  }, [series, xMin, xMax, hasAbandonedItem, area, itemSelection, provaData, area, abandonadosCodes, lastItemActive, FIXED_PALETTE, proficienciaAtual, chartColor, axisColor, gridColor]);
  
  useEffect(() => {
    const allSelectedCodes = Object.keys(itemSelection).map(Number);
    if (provaData && onFilterChange) {
      const filtrados = allSelectedCodes.filter(code => String(code) in provaData);
      onFilterChange(filtrados);
      setActiveCodes(filtrados)
    }
  }, [area, itemSelection, provaData]);
  
  return (
    <div className={styles.icc_container}>
      <Chart 
        options={options} 
        series={series as any} 
        type="line" 
        height="100%" 
        width="100%" 
      />
      {/* <div className={styles.icc_slider}>
        <InputShell2 logic={logic} activeCodes={activeCodes}/>
      </div> */}
    </div>
  );
}