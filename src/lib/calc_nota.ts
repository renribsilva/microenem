'use client'

import path from "path";

// --- INTERFACES ---
interface ItensColuna {
  CO_POSICAO: number[];
  SG_AREA: string[];
  CO_ITEM: number[];
  IN_ITEM_ABAN: number[];
  NU_PARAM_A: number[];
  NU_PARAM_B: number[];
  NU_PARAM_C: number[];
  CO_PROVA: (string | number)[];
  TP_LINGUA: number[] | null;
  TX_GABARITO: string[];
}

interface Constantes {
  area: string;
  k: number;
  d: number;
}

const cci3PL = (theta: number, a: number, b: number, c: number): number => 
  c + (1 - c) / (1 + Math.exp(-a * (theta - b)));

const dnorm = (x: number): number => 
  (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);

export const calcNota = async (
  resp: number[], 
  codProva: string | number,
  area: string,
  ano: number,
  tpLingua: number 
) => {
  console.log(`\n🚀 INICIANDO TRI - PROVA: ${codProva} | ANO: ${ano}`);

  let db: ItensColuna;
  let constantes: Constantes[];

  try {
    // IMPORT DINÂMICO CORRETO
    // O path.resolve garante que ele ache a pasta independente de onde você chame o script
    const itensPath = path.resolve(process.cwd(), `src/app/(home)/2019/json/itens_${ano}.json`);
    const constPath = path.resolve(process.cwd(), `src/app/(home)/json/constantes.json`);

    const dbModule = await import(itensPath);
    const constModule = await import(constPath);

    db = dbModule.default;
    constantes = constModule.default;

    console.log("✅ JSONs carregados com sucesso.");
  } catch (error: any) {
    console.error("❌ ERRO NO IMPORT!");
    console.error("Caminho absoluto tentado:", path.resolve(process.cwd(), `src/app/(home)/2019/json/itens_${ano}.json`));
    console.error("Erro:", error.message);
    return;
  }

  const thetaGrid = Array.from({ length: 40 }, (_, i) => -4 + (i * 8) / 39);
  const pTheta = thetaGrid.map(t => dnorm(t));

  // 1. FILTRAR ÍNDICES
  let indices = db.CO_PROVA
    .map((cp, idx) => (cp == codProva ? idx : -1))
    .filter(idx => idx !== -1);

  if (area === "LC" && indices.length > 45) {
    if (tpLingua === 1) {
      indices = indices.filter(idx => !(db.TP_LINGUA?.[idx] === 0 && db.CO_POSICAO[idx] <= 5));
    } else {
      indices = indices.filter(idx => !(db.TP_LINGUA?.[idx] === 1 && db.CO_POSICAO[idx] <= 5));
    }
  }

  indices.sort((a, b) => db.CO_POSICAO[a] - db.CO_POSICAO[b]);

  let likelihood = new Array(thetaGrid.length).fill(1);

  console.log("------------------------------------------------------------");
  console.log("ITEM | POS | ID_ITEM | SCORE | PARAMS (a, b, c)");

  indices.forEach((dbIdx, i) => {
    const pos = db.CO_POSICAO[dbIdx];
    const itemID = db.CO_ITEM[dbIdx];
    const isAnulado = db.IN_ITEM_ABAN[dbIdx] === 1;
    const acerto = resp[i];
    const a = db.NU_PARAM_A[dbIdx];
    const b = db.NU_PARAM_B[dbIdx];
    const c = db.NU_PARAM_C[dbIdx];

    if (isAnulado || isNaN(a)) {
      console.log(`[${String(i+1).padStart(2, '0')}] | P${String(pos).padStart(2, '0')} | ${itemID} | 🚫 | ---`);
      return; 
    }

    console.log(`[${String(i+1).padStart(2, '0')}] | P${String(pos).padStart(2, '0')} | ${itemID} | ${acerto === 1 ? '✅' : '❌'} | (${a.toFixed(2)}, ${b.toFixed(2)}, ${c.toFixed(2)})`);

    for (let t = 0; t < thetaGrid.length; t++) {
      const p1 = cci3PL(thetaGrid[t], a, b, c);
      likelihood[t] *= (acerto === 1 ? p1 : (1 - p1));
    }
  });

  let sumNum = 0;
  let sumDen = 0;
  for (let t = 0; t < thetaGrid.length; t++) {
    const posterior = likelihood[t] * pTheta[t];
    sumNum += thetaGrid[t] * posterior;
    sumDen += posterior;
  }

  const thetaEAP = sumNum / sumDen;

  // 6. APLICAÇÃO DAS CONSTANTES (Tratando como Objeto Colunar se necessário)
  let constArea;
  
  if (Array.isArray(constantes)) {
    // Se for Array: [{area: 'MT', k: 500...}]
    constArea = constantes.find(ct => ct.area === area);
  } else {
    // Se for Objeto Colunar: { area: ['MT', 'LC'], k: [100, 500], d: [500, 500] }
    const idx = (constantes as any).area.indexOf(area);
    if (idx !== -1) {
      constArea = {
        k: (constantes as any).k[idx],
        d: (constantes as any).d[idx]
      };
    }
  }

  const notaFinal = constArea 
    ? Math.round((thetaEAP * constArea.k + constArea.d) * 10) / 10 
    : thetaEAP; // Se não achar constante, retorna o Theta bruto

  console.log("------------------------------------------------------------");
  console.log(`🎯 RESULTADO FINAL:`);
  console.log(`Theta EAP: ${thetaEAP.toFixed(4)}`);
  console.log(`Nota ENEM: ${notaFinal}`);
  console.log("------------------------------------------------------------\n");
};

// EXECUÇÃO IMEDIATA
const mockResp = Array(45).fill(0).map((_, i) => (i < 20 ? 1 : 0));
calcNota(mockResp, 511, "LC", 2019, 0);
