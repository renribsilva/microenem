import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const codigo = searchParams.get("codigo");
  const year = searchParams.get("year");

  if (!codigo || !year) {
    return NextResponse.json(
      { error: "Informe os parâmetros obrigatórios: codigo, year" },
      { status: 400 },
    );
  }

  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "JSON",
      year,
      `iteminfo_${year}.json`,
    );

    const fileContent = fs.readFileSync(filePath, "utf8");
    const fullJson = JSON.parse(fileContent);

    return NextResponse.json({
      dataset: fullJson.datasets[codigo] || null,
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
