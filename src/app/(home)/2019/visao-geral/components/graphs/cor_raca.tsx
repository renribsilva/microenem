'use client'

import Chart from 'react-apexcharts';
import cor_raca_data from "../../json/socials/cor_raca.json";
import presence_data from "../../json/overview/presenca.json";
import { useChartTheme } from "../../../../../../hooks/chart_theme";
import customTooltip from '../../../../../../components/tsx/customTooltip';
import { useMemo } from 'react';

export default function COR_RACA() {

  const { textColor, panelColor } = useChartTheme();  
  const n = (presence_data[0].subRows[0].total).toLocaleString('pt-BR');  

  const series = [{
    data: cor_raca_data.datasets[0].tree
      .map((item: any) => ({
        x: item.label,
        y: item.value,
        abs: item.abs 
      }))
      // Ordena do maior valor para o menor (Decrescente)
      .sort((a: any, b: any) => b.y - a.y)
  }];

  const options: ApexCharts.ApexOptions = useMemo(() => ({
    chart: {
      type: 'treemap',
      toolbar: { show: true },
      background: 'transparent'
    },
    stroke: {
      show: true,
      width: 2, // Aumente para separar mais os quadrados
      colors: [panelColor] // Aqui você define a cor da borda (ex: a cor do seu fundo)
    },
    title: {
      text: 'Cor ou raça',
      align: 'center',
      style: { 
        color: textColor, 
        fontSize: '16px', 
        fontWeight: 'bold' 
      }
    },
    subtitle: {
      text: `*n = ${n}`,
      align: 'center',
      style: {
        color: textColor,
        fontSize: '13px',
        fontWeight: 'normal',
      }
    },
    colors: ["#1D85B1", "#2D6B86", "#009BDB", "#2E4E5C", "#222E33", "#1B2429"],
    plotOptions: {
      treemap: {
        distributed: true,
        enableShades: false,
        borderRadius: 0
      }
    },
    dataLabels: {
      enabled: true,
      style: { 
        fontSize: '12px', 
        fontWeight: 'bold' 
      },
      textAnchor: 'middle',
      distributed: true,
      offsetY: -4,
      formatter: (val: any, op?: any) => {
        const label = String(val);
        // Se o texto for muito longo e a área for pequena, abrevia ou corta
        if (op.value < 8 && label.length > 10) {
          return [label.substring(0, 8) + "...", `${op.value}%`];
        }
        return [label, `${op.value}%`];
      }
    },
    tooltip: {
      theme: 'dark',
      custom: function({ seriesIndex, dataPointIndex, w }: any) {
        // Recuperamos os dados diretamente do objeto de configuração
        const data = w.config.series[seriesIndex].data[dataPointIndex];
        const label = data.x;
        const value = data.y;
        // const absolute = data.abs;
        return customTooltip({ label, value, });
      }
    }
  }), [textColor, panelColor, n, series]);

  return (
    <div style={{ flex: 1}}>
      <Chart
        options={options}
        series={series}
        type="treemap"
        height="100%"
        width="100%"
      />
    </div>
  );
}