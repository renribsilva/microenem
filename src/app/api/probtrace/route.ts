import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const codigo = searchParams.get("codigo");
  const year = searchParams.get("year");
  const codesParam = searchParams.get("codes");

  if (!codigo || !year || !codesParam) {
    return NextResponse.json(
      { error: "Informe os parâmtros obrigatórios: codigo, year" },
      { status: 400 },
    );
  }

  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "JSON",
      year,
      `probtrace_${year}.json`,
    );

    const fileContent = fs.readFileSync(filePath, "utf8");
    const fullJson = JSON.parse(fileContent);

    let dataset: Record<string, number[]> | null =
      fullJson.datasets[codigo] || null;

    if (dataset && codesParam) {
      const targetCodes = new Set(codesParam.split(","));
      const filteredDataset: Record<string, number[]> = {};

      for (const [codeKey, values] of Object.entries(dataset)) {
        if (targetCodes.has(codeKey)) {
          filteredDataset[codeKey] = values as number[];
        }
      }
      dataset = filteredDataset;
    }

    return NextResponse.json({
      dataset: dataset,
      theta_labels: fullJson.theta_labels,
    });
  } catch (error) {
    console.error("ERRO NA ROTA DE API:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados da API" },
      { status: 500 },
    );
  }
}
