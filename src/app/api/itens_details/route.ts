import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  const codigo = searchParams.get("codigo");
  const coItem = searchParams.get("coItem");

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

    const fileContent = fs.readFileSync(filePath, "utf8");
    const p = JSON.parse(fileContent);

    if (!codigo || !coItem) {
      return NextResponse.json(p);
    }

    if (!p.CO_PROVA || !p.CO_ITEM) {
      return NextResponse.json(null);
    }

    const idx = p.CO_PROVA.findIndex(
      (pVal: number | string, i: number) =>
        Number(pVal) === Number(codigo) &&
        Number(p.CO_ITEM[i]) === Number(coItem),
    );

    if (idx === -1) {
      return NextResponse.json(null);
    }

    const itemDetails = {
      CO_POSICAO: p.CO_POSICAO[idx],
      SG_AREA: p.SG_AREA[idx],
      TX_GABARITO: p.TX_GABARITO[idx],
      CO_HABILIDADE: p.CO_HABILIDADE[idx],
      IN_ITEM_ABAN: p.IN_ITEM_ABAN[idx],
      TX_MOTIVO_ABAN: p.TX_MOTIVO_ABAN[idx],
      TX_COR: p.TX_COR[idx],
    };

    return NextResponse.json(itemDetails);
  } catch (error) {
    console.error("ERRO NA ROTA DE API:", error);
    return NextResponse.json(
      { error: "Erro ao buscar itens" },
      { status: 500 },
    );
  }
}
