"use client";

import { useMemo } from "react";
import Chart from "react-apexcharts";
import { useChartTheme } from "../../../../../../hooks/use_chart_theme";
import { useNineteenData } from "../../../../../../context/nineteen_context";
import { useHomeData } from "../../../../../../context/home_context";
import styles from "./graphs.module.css"

export default function ICCChart() {
  
  const { chartLogic, deferredArea } = useHomeData();
  const { chartColor, proficienciaAtual, xMin, xMax } = chartLogic;
  const { gridColor, axisColor, textColor } = useChartTheme();
  const { 
    abandonadosCodes, 
    FIXED_PALETTE, 
    k, 
    d, 
    probData,
    probLabels,
    selectedItems,  
    lastItemActivate
  } = useNineteenData();

  const transformTheta = (theta: number) => ((theta * k) + d);

  // --- PROCESSAMENTO DE DADOS PARA APEXCHARTS ---
  const { series, hasAbandonedItem } = useMemo(() => {
    let abandonedFound = false;
    const codes = Object.keys(selectedItems).map(Number);
    const allItemsInProva = Object.keys(probData || {});
    const chartSeries = codes
      .map((code) => {
        const itemKey = String(code);
        const isAbandoned = abandonadosCodes.has(code); 
        if (isAbandoned) {
          if (code === lastItemActivate) abandonedFound = true;
          return null;
        }
        const status = selectedItems[code]?.status;
        const rawPoints = probData?.[itemKey] as (number | null)[];
        if (!rawPoints) return null;
        const colorIndex = allItemsInProva.indexOf(itemKey);
        return {
          item: code,
          name: `Item ${code}`, // Nomeclatura para o motor do gráfico
          data: rawPoints.map((yValue, idx) => ({
            x: transformTheta(probLabels[idx]),
            y: parseFloat((status === 'erro' ? 1 - (yValue || 0) : (yValue || 0)).toFixed(3))
          })),
          color: colorIndex !== -1 ? FIXED_PALETTE[colorIndex % 45] : "#999",
          strokeDashArray: status === 'erro' ? 4 : 0,
        };
      })
      .filter(Boolean);

    return { series: chartSeries, hasAbandonedItem: abandonedFound};
  }, [selectedItems, probData, deferredArea, abandonadosCodes, lastItemActivate]);
  
  // const xMin = Math.floor(transformTheta(-6) / 100) * 100;
  // const xMax = Math.ceil(transformTheta(6) / 100) * 100;
  
  // --- CONFIGURAÇÕES DO APEXCHARTS ---
  const options: ApexCharts.ApexOptions = useMemo(() => {
    return {
      chart: {
        id: "icc-chart",
        type: 'line',
        toolbar: { show: true, offsetX: 0, offsetY: 0 },
        zoom: {
          enabled: false
        },
        animations: {
          enabled: false, 
          dynamicAnimation: {
            enabled: false 
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
        title: { text: `Notas na escala do Enem (${deferredArea})`, style: { color: axisColor } },
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
          formatter: (val) => Number(val).toFixed(1)
        },
        title: { text: 'Probabilidade', style: { color: axisColor } }
      },
      grid: { borderColor: gridColor },
      legend: { show: false },
      // title: {
      //   text: 'Curva característica do item',
      //   style: { color: textColor, fontSize: '16px', fontWeight: 'bold'},
      // },
      // subtitle: {
      //   text: ['Modelagem da probabilidade de acerto em', 'função da proficiência estimada.'] as any,
      //   style: { color: textColor, fontSize: '13px' },
      // },
      annotations: {
        xaxis: [
          {
            x: proficienciaAtual,
            borderColor: chartColor || '#ff0000',
            strokeDashArray: 0,
            label: {
              text: `Traço de prob. da nota ${proficienciaAtual.toFixed(0)}`,
              style: { color: '#fff', background: chartColor || '#ff0000' },
              borderWidth: 0,
              orientation: 'horizontal',
              offsetY: -15
            }
          }
        ],
      }
    };
  }, [series, xMin, xMax, hasAbandonedItem, deferredArea, selectedItems, probData, abandonadosCodes, lastItemActivate, FIXED_PALETTE, proficienciaAtual, chartColor, axisColor, gridColor]);
  
  return (
    <div style={{minHeight: '350px', minWidth: '0', flex: '1 1 50%'}}>
      <div className={styles.tcc_cabecalho}>      
        <div className={styles.tcc_title}>
          <h3 className={styles.tcc_title_h3}>Curva característica do item</h3>
          <p className={styles.tcc_subtitle_p}>
            Modelagem da probabilidade de acerto em função da proficiência estimada.  
          </p>
        </div>
      </div>
      <Chart 
        options={options} 
        series={series as any} 
        type="line" 
        height="100%" 
        // width="100%" 
      />
    </div>
  );
}