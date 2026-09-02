import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");

  if (!year) {
    return NextResponse.json({ error: "Ano não informado" }, { status: 400 });
  }

  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "JSON",
      year,
      `dic_${year}.json`,
    );
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro na API Probtrace:", error);
    return NextResponse.json(
      { error: "Erro ao carregar dados do dicionário" },
      { status: 500 },
    );
  }
}
