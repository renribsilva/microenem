'use client'

import dynamic from 'next/dynamic';
import cor_raca_data from "../../json/socials/cor_raca.json";
import presence_data from "../../json/overview/presenca.json";
import { useChartTheme } from "../../../../../hooks/chart_theme";

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

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

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'treemap',
      toolbar: { show: false },
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
      custom: function({ series, seriesIndex, dataPointIndex, w }: any) {
        // Recuperamos os dados diretamente do objeto de configuração
        const data = w.config.series[seriesIndex].data[dataPointIndex];
        const label = data.x;
        const value = data.y;
        const absolute = data.abs;
        return `
          <div style="padding: 10px; background: rgba(34, 34, 34, 0.70); border: 1px solid #444; color: #fff; font-size: 12px; line-height: 1.5;">
            <div>
              <strong>${label}</strong>
            </div>
            <div>
              <span>Porcentagem: ${value}%</span><br/>
              <span>Total: ${absolute.toLocaleString('pt-BR')}</span>
            </div>
          </div>
        `;
      }
    }
  };

  return (
    <div style={{ minWidth: '300px', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Container do Gráfico */}
      <div style={{ flex: 1 }}>
        <Chart
          options={options}
          series={series}
          type="treemap"
          height="100%"
        />
      </div>
      
      {/* Subtítulo HTML (Livre de erros de TS e fora do gráfico) */}
      <p style={{ 
        color: textColor, 
        fontSize: '13px', 
        fontStyle: 'italic', 
        textAlign: 'center',
        marginTop: '15px',
        fontWeight: 400,
      }}>
        *n = {n}
      </p>
    </div>
  );
}