import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const area = searchParams.get("area") || "LC";
  const year = searchParams.get("year");

  if (!area) {
    return NextResponse.json({ error: "Área é obrigatória" }, { status: 400 });
  }

  try {
    const filePath = path.join(
      process.cwd(),
      `src/app/(home)/JSON/${year}/notas-e-acertos/score_describe.json`,
    );

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `Arquivo não encontrado` },
        { status: 404 },
      );
    }

    const fileContent = fs.readFileSync(filePath, "utf8");
    const fullJson = JSON.parse(fileContent);
    const dataset = fullJson[area];

    return NextResponse.json({
      dataset: dataset,
    });
  } catch (error) {
    console.error("ERRO NA API:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 },
    );
  }
}

