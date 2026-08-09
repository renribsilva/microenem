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
    const basePath = "/home/renato/Área de trabalho/DEV/NEXT/microenem";
    const outputDir = path.join(
      basePath,
      "src",
      "questoes",
      currentYear.toString(),
    );
    const outputPath = path.join(outputDir, `${area}.json`);

    if (fs.existsSync(outputPath)) {
      console.log(
        `[Aviso] O arquivo já existe e NÃO foi sobrescrito: ${outputPath}`,
      );
      return;
    }

    const modulo = await import(
      `../src/app/(home)/JSON/${currentYear}/itens_${currentYear}.json`
    );
    const data: ItensDataType = modulo.default || modulo;
    const itensFiltrados: { coItem: number; coPosicao: number }[] = [];

    for (let i = 0; i < data.CO_ITEM.length; i++) {
      if (data.CO_PROVA[i] === targetCoProva) {
        itensFiltrados.push({
          coItem: data.CO_ITEM[i],
          coPosicao: data.CO_POSICAO[i],
        });
      }
    }

    itensFiltrados.sort((a, b) => a.coPosicao - b.coPosicao);

    const output: QuestaoCoordenadas[] = itensFiltrados.map((item) => ({
      codigo: item.coItem,
      crops: [
        {
          pagina: 1,
          offsetY: 100,
          offsetX: 32,
          cropHeight: 700,
          cropWidth: 30,
        },
      ],
      scale: 1.2,
    }));

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

    console.log(
      `Sucesso! ${output.length} questões ordenadas e salvas em: ${outputPath}`,
    );
  } catch (err) {
    console.error("Erro fatal ao processar o arquivo:", err);
  }
}

// 2025
generateCrops(2021, 899, "MT");
