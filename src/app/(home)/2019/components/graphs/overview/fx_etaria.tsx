'use client'

import { 
  BarController, 
  BarElement, 
  CategoryScale, 
  Chart as ChartJS, 
  Legend, 
  LinearScale, 
  Tooltip } from "chart.js"
import { Bar } from 'react-chartjs-2';
import chartData from "../../json/overview/faixa_etaria.json";
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  BarController, 
  BarElement, 
  CategoryScale, 
  LinearScale,
  Tooltip, 
  Legend,
  ChartDataLabels
)

const data = chartData

const options = {
  indexAxis: 'y' as const,
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    tooltip: {
      displayColors: false,
      callbacks: {
        // Exemplo: Adicionando o sufixo '%' no valor que aparece no mouse
        label: (context: any) => {
          return `Porcentagem: ${context.parsed.y}%`;
        }
      }
    },
    datalabels: { // 3. Configuração dos rótulos nas barras
      anchor: 'end' as const, // Gruda no fim da barra
      align: 'right' as const, // Posiciona à direita do ponto de ancoragem
      formatter: (value: any) => `${value}%`, // Formata o texto
      color: '#475569', // Cor do texto (ex: Slate-600)
      font: {
        // weight: 'bold' as const,
        size: 10
      }
    },
    legend: {
      display: false,
    },  
  },
  layout: {
    padding: {
      right: 40 // Adiciona espaço à direita para o texto não ser cortado
    }
  },
};

export default function FX_ETARIA() {
  return <Bar options={options} data={data} />
}