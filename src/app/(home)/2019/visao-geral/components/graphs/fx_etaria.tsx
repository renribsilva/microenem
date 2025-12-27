'use client'

import { 
  BarController, 
  BarElement, 
  CategoryScale, 
  Chart as ChartJS, 
  Legend, 
  LinearScale, 
  SubTitle, 
  Title, 
  Tooltip } from "chart.js"
import { Bar } from 'react-chartjs-2';
import fx_etaria_data from "../../json/socials/faixa_etaria.json"
import presence_data from "../../json/overview/presenca.json"
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useChartTheme } from "../../../../../../hooks/chart_theme";

  ChartJS.register(
    BarController, 
    BarElement, 
    CategoryScale, 
    LinearScale,
    Tooltip, 
    Legend,
    ChartDataLabels,
    Title,
    SubTitle
  )

  export default function FX_ETARIA() {

    const { textColor, gridColor } = useChartTheme();

    const barColor = "rgba(255, 208, 53, 1)"
    const borderColor = "rgba(255, 163, 110, 1)"

    const data = {
      ...fx_etaria_data,
      datasets: fx_etaria_data.datasets.map((dataset) => ({
        ...dataset,
        backgroundColor: barColor,
        borderColor: borderColor,
        borderWidth: 1
      })),
    };

    const n = (presence_data[0].subRows[0].total).toLocaleString('pt-BR')
    // console.log(n) 

    const options = {
      indexAxis: 'y' as const,
      maintainAspectRatio: false,
      responsive: true,
      interaction: {
        mode: 'index' as const,    
        intersect: false,          
        axis: 'y' as const,        
      },
      plugins: {
        title: { 
          display: true,
          text: 'Faixa Etária',
          color: textColor, 
          font: {
            size: 16,
            weight: 'bold' as const
          },
        },
        subtitle: {
          display: true,
          text: `*n = ${n}`,
          color: textColor,
          font: {
            size: 13,
            style: 'italic' as const
          },
          position: 'bottom' as const,
          align: 'center' as const,
          padding: 10
        },
        tooltip: {
          displayColors: false,
          callbacks: {
            label: (context: any) => {
              const percentual = context.parsed.x;
              const absoluto = context.dataset.abs_values[context.dataIndex];
              const absolutoFormatado = absoluto.toLocaleString('pt-BR');
              return [
                `Porcentagem: ${percentual}%`,
                `Total: ${absolutoFormatado}`
              ];
            }
          }
        },
        datalabels: { 
          anchor: 'end' as const,
          align: 'right' as const, 
          formatter: (value: any) => `${value}%`, 
          color: textColor,
          font: {
            size: 10
          }
        },
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          grace: '10%',
          grid: {
            color: gridColor,
          },
          ticks: {
            color: textColor,
          }
        },
        y: {
          grid: {
            color: gridColor,
          },
          ticks: {
            color: textColor,
          }
        }
      },
    };

    return <Bar options={options} data={data} />
  }