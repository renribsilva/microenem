import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  try {
    const baseDir = path.join(
      process.cwd(),
      "public",
      "JSON",
      year,
      "visao-geral",
    );

    const readJson = (subPath: string) =>
      JSON.parse(fs.readFileSync(path.join(baseDir, subPath), "utf8"));

    const data = {
      inscritos: readJson("overview/inscritos.json"),
      abstencao1: readJson("overview/presenca_dia1.json"),
      abstencao2: readJson("overview/presenca_dia2.json"),
      cor_raca: readJson("socials/cor_raca.json"),
      sexo: readJson("socials/sexo.json"),
      fx_etaria: readJson("socials/faixa_etaria.json"),
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("ERRO NA ROTA DE API:", error);
    return NextResponse.json(
      { error: "Erro ao buscar visão geral" },
      { status: 500 },
    );
  }
}
