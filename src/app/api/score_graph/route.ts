import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const year = searchParams.get("year");

  if (!code || !year) {
    return NextResponse.json(
      { error: "Informe os parâmetros obrigatórios: code, year" },
      { status: 400 },
    );
  }

  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "JSON",
      year,
      "resposta-ao-item",
      "score_graph.json",
    );

    const fileContent = fs.readFileSync(filePath, "utf8");
    const fullJson = JSON.parse(fileContent);

    return NextResponse.json({
      code: Number(code),
      dataset: fullJson[code] || null,
    });
  } catch (error) {
    console.error("ERRO NA ROTA DE API:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados da API" },
      { status: 500 },
    );
  }
}
