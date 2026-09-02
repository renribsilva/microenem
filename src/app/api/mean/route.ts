import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { CandidateDataType } from "../../../types/year_types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");

  if (!year) {
    return NextResponse.json(
      { error: "Informe o parâmetro: year" },
      { status: 400 },
    );
  }

  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "JSON",
      year,
      "media-simples",
      "mean_table.json",
    );

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Arquivo não encontrado" },
        { status: 404 },
      );
    }

    const fileContent = fs.readFileSync(filePath, "utf8");
    const fullJson = JSON.parse(fileContent);

    // Mapeia para retornar um objeto com Ranking e Média
    const result = fullJson.map((item: CandidateDataType) => ({
      ranking: item.RANKING,
      media: item.MEDIA_GERAL,
    }));

    result.sort(
      (a: { ranking: number }, b: { ranking: number }) => a.ranking - b.ranking,
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("ERRO NA ROTA DE API:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados da API" },
      { status: 500 },
    );
  }
}
