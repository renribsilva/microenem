import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const year = searchParams.get("year");
  const codigo = searchParams.get("codigo");
  const area = searchParams.get("area") || "LC";
  const versao = searchParams.get("versao");
  const lingua = searchParams.get("lingua");

  if (!year) {
    return NextResponse.json({ error: "Ano não informado" }, { status: 400 });
  }

  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "JSON",
      year,
      `itens_${year}.json`,
    );
    const p = JSON.parse(fs.readFileSync(filePath, "utf8"));

    if (!codigo) {
      return NextResponse.json(p);
    }

    const ranges: Record<string, { start: number; end: number }> = {
      LC: { start: 1, end: 45 },
      CH: { start: 46, end: 90 },
      CN: { start: 91, end: 135 },
      MT: { start: 136, end: 180 },
    };

    const { start, end } = ranges[area] || { start: 1, end: 45 };
    const result: Record<
      number,
      { code: number; a: number | null; b: number | null; c: number | null }
    > = {};

    if (p && p.CO_POSICAO) {
      for (let num = start; num <= end; num++) {
        const idx = Object.keys(p.CO_POSICAO).find((i) => {
          const matchProva = Number(p.CO_PROVA[i]) === Number(codigo);
          const matchPos = Number(p.CO_POSICAO[i]) === num;
          if (!matchProva || !matchPos) return false;

          if (
            area === "LC" &&
            num <= 5 &&
            lingua !== null &&
            lingua !== "undefined"
          ) {
            return Number(p.TP_LINGUA[i]) === Number(lingua);
          }
          if (versao === "D" && p.TP_VERSAO_DIGITAL) {
            if (Number(versao) !== Number(p.TP_VERSAO_DIGITAL[i])) return false;
          }
          return true;
        });

        if (idx) {
          result[num] = {
            code: Number(p.CO_ITEM[idx]),
            a: p.NU_PARAM_A ? Number(p.NU_PARAM_A[idx]) : null,
            b: p.NU_PARAM_B ? Number(p.NU_PARAM_B[idx]) : null,
            c: p.NU_PARAM_C ? Number(p.NU_PARAM_C[idx]) : null,
          };
        }
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("ERRO NA ROTA DE API:", error);
    return NextResponse.json(
      { error: "Erro ao buscar itens" },
      { status: 500 },
    );
  }
}
