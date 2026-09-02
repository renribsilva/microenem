import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "JSON",
      year,
      "resposta-ao-item",
      "score_table.json",
    );
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return NextResponse.json(data);
  } catch (error) {
    console.error("ERRO NA ROTA DE API:", error);
    return NextResponse.json(
      { error: "Erro ao buscar resposta ao item" },
      { status: 500 },
    );
  }
}
