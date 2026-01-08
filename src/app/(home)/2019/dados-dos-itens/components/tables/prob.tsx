import Probtrace from "../../../json/probtrace_2019.json";
import constantes from "../../../../json/constantes.json"; // Importando constantes para destransformar

interface ProbsTableProps {
  logic: any;
  activeCodes: number[];
  area: string; // Adicionei a área para saber qual constante usar
}

export default function ProbsTable({ logic, activeCodes, area }: ProbsTableProps) {
  if (!logic || !activeCodes || activeCodes.length === 0) {
    return (
      <section style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        Selecione itens no gráfico para ver as probabilidades.
      </section>
    );
  }

  const { proficienciaAtual, selectedLabel } = logic;
  const [co_p_selected] = selectedLabel.split('_');
  const provaData = (Probtrace.datasets as any)[co_p_selected];

  // 1. Achar o Theta Correspondente (Destransformação)
  const areaIdx = constantes.area.indexOf(area || "LC");
  const d = constantes.d[areaIdx];
  const k = constantes.k[areaIdx];

  // Regra: Nota = (Theta * k) + d  =>  Theta = (Nota - d) / k
  // Se for Matemática (MT), geralmente a escala já é o próprio Theta ou tem regra própria
  const thetaAlvo = area === "MT" ? proficienciaAtual : (proficienciaAtual - d) / k;

  // 2. Encontrar o índice da quadratura mais próxima (dentre as 40 ou 101 disponíveis)
  // Usamos o array de labels do JSON original
  const thetaLabels = Probtrace.theta_labels; 
  
  const closestIndex = thetaLabels.reduce((prevIdx, currVal, currIdx) => {
    return Math.abs(currVal - thetaAlvo) < Math.abs(thetaLabels[prevIdx] - thetaAlvo) 
      ? currIdx 
      : prevIdx;
  }, 0);

  return (
    <section>
      <div style={{ marginBottom: '15px', fontSize: '0.9rem' }}>
        <strong>Proficiência:</strong> {Math.round(proficienciaAtual)} 
        <small style={{ marginLeft: '10px', color: '#888' }}>
          (θ ≈ {thetaAlvo.toFixed(2)})
        </small>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #eee', fontSize: '0.8rem', color: '#666' }}>
            <th style={{ textAlign: 'left', padding: '8px' }}>ITEM</th>
            <th style={{ textAlign: 'right', padding: '8px' }}>PROB. ACERTO</th>
          </tr>
        </thead>
        <tbody>
          {activeCodes.map((code) => {
            const itemKey = String(code);
            const quadraturas = provaData?.[itemKey];
            const probabilidade = quadraturas ? quadraturas[closestIndex] : null;

            return (
              <tr key={code} style={{ borderBottom: '1px solid #f9f9f9' }}>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>{code}</td>
                <td style={{ textAlign: 'right', padding: '8px' }}>
                  {probabilidade !== null 
                    ? `${(probabilidade * 100).toFixed(1)}%` 
                    : "N/A"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}