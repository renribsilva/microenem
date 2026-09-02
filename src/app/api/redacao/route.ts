import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  try {
    const baseDir = path.join(process.cwd(), "public", "JSON", year, "redacao");

    const data = {
      competencia: JSON.parse(
        fs.readFileSync(
          path.join(baseDir, "estatisticas_redacao_completa.json"),
          "utf8",
        ),
      ),
      status: JSON.parse(
        fs.readFileSync(path.join(baseDir, "status_redacao.json"), "utf8"),
      ),
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("ERRO NA ROTA DE API:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados de redação" },
      { status: 500 },
    );
  }
}
