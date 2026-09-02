import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  const area = searchParams.get("area");

  if (!year) {
    return NextResponse.json({ error: "Ano não informado" }, { status: 400 });
  }

  // Lógica da pasta da área no servidor
  let areaFolder = "LC";
  switch (area) {
    case "CH":
    case "CN":
    case "MT":
      areaFolder = area;
      break;
    default:
      areaFolder = "LC";
  }

  try {
    const baseDir = path.join(
      process.cwd(),
      "public",
      "JSON",
      year,
      "dificuldade-do-exame",
      areaFolder,
    );

    const readJson = (fileName: string) =>
      JSON.parse(fs.readFileSync(path.join(baseDir, fileName), "utf8"));

    const data = {
      density: readJson("density.json"),
      describe: readJson("describe.json"),
      frequency: readJson("frequency_acertos.json"),
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro na API Probtrace:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados de dificuldade" },
      { status: 500 },
    );
  }
}
