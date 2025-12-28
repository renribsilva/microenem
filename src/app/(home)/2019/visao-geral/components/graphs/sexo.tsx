'use client'

import { ArcElement, Chart as ChartJS, DoughnutController, SubTitle, Title, Tooltip, Legend } from "chart.js"
import { Doughnut } from "react-chartjs-2"
import ChartDataLabels from 'chartjs-plugin-datalabels'; // 1. Importar o plugin
import sexo_data from "../../json/socials/sexo.json"
import presence_data from "../../json/overview/presenca.json"
import { useChartTheme } from "../../../../../../hooks/chart_theme";

ChartJS.register(
  DoughnutController,
  ArcElement,
  Tooltip,
  Title,
  SubTitle,
  Legend,
  ChartDataLabels // 2. Registrar o plugin
)

export default function SEXO() {
  
  const { textColor, panelColor } = useChartTheme();
  const doughnutColor = ["rgba(60, 245, 188, 0.7)", "rgba(245, 99, 59, 0.7)",]

  const data = {
    ...sexo_data,
    datasets: sexo_data.datasets.map((dataset) => ({
      ...dataset,
      backgroundColor: doughnutColor,
      borderColor: panelColor,
      borderWidth: 2
    })),
  };

  const n = (presence_data[0].subRows[0].total).toLocaleString('pt-BR')

  const options = {
    cutout: '35%', 
    radius: '90%', 
    plugins: {
      title: { 
        display: true,
        text: 'Sexo',
        color: textColor, 
        font: { size: 16, weight: 'bold' as const },
      },
      subtitle: {
        display: true,
        text: `*n = ${n}`,
        color: textColor,
        font: { size: 13, style: 'italic' as const },
        position: 'bottom' as const,
        align: 'center' as const,
        padding: 10
      },
      tooltip: {
        displayColors: false,
        callbacks: {
          label: (context: any) => {
            const percentual = context.parsed;
            const absoluto = context.dataset.abs_values[context.dataIndex];            
            return [
              `Porcentagem: ${percentual}%`,
              `Total: ${absoluto.toLocaleString('pt-BR')}`
            ];
          }
        }
      },
      // 3. Configuração dos DataLabels
      datalabels: { 
        color: textColor,
        anchor: 'center' as const,
        align: 'center' as const,
        font: {
          // weight: 'bold' as const,
          size: 14
        },
        formatter: (value: any) => {
          return `${value}%`; // Exibe o valor do dado seguido de %
        }
      },
      legend: {
        display: true,
        labels: { color: textColor }
      }
    },
  };
  
  return <Doughnut data={data} options={options} />
}