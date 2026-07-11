import fs from "fs";
import path from "path";
import { ItensDataType } from "../src/types/year_types";
import { QuestaoCoordenadas } from "../src/types/questoes_types";

async function generateCrops(
  currentYear: number,
  targetCoProva: number,
  area: string,
) {
  try {
    const modulo = await import(
      `../src/app/(home)/JSON/${currentYear}/itens_${currentYear}.json`
    );
    const data: ItensDataType = modulo.default || modulo;
    const output: QuestaoCoordenadas[] = [];

    for (let i = 0; i < data.CO_ITEM.length; i++) {
      if (data.CO_PROVA[i] === targetCoProva) {
        output.push({
          codigo: data.CO_ITEM[i],
          crops: [
            { pagina: 0, offsetY: 0, offsetX: 0, cropHeight: 0, cropWidth: 0 },
          ],
          scale: 1.2,
        });
      }
    }

    // Ordena o array usando o índice correspondente no data original
    output.sort((a, b) => {
      const posA = data.CO_POSICAO[data.CO_ITEM.indexOf(a.codigo)];
      const posB = data.CO_POSICAO[data.CO_ITEM.indexOf(b.codigo)];
      return posA - posB;
    });

    const basePath = "/home/renato/Área de trabalho/DEV/NEXT/microenem";
    const outputDir = path.join(
      basePath,
      "src",
      "questoes",
      currentYear.toString(),
    );

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `${area}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

    console.log(`Sucesso! ${output.length} questões salvas em: ${outputPath}`);
  } catch (err) {
    console.error("Erro fatal ao processar o arquivo:", err);
  }
}

// 2025
generateCrops(2025, 1471, "MT");
