import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  const codProva = searchParams.get("codProva");
  const tpLingua = searchParams.get("tpLingua");
  const score = searchParams.get("score");
  const coItem = searchParams.get("coItem");
  const codigo = searchParams.get("codigo");

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

    // Tratamento para getAreaMap
    if (codProva !== null && score !== null) {
      const parsedCodProva = Number(codProva);
      const parsedTpLingua =
        tpLingua !== null && tpLingua !== "" ? Number(tpLingua) : null;
      const bits = score.split("");
      const temVersaoDigital = "TP_VERSAO_DIGITAL" in p;

      const indicesFiltrados = Object.keys(p.CO_PROVA)
        .map(Number)
        .filter((i) => {
          const matchProva = Number(p.CO_PROVA[i]) === parsedCodProva;
          const matchLingua =
            p.TP_LINGUA[i] === null ||
            Number(p.TP_LINGUA[i]) === parsedTpLingua;
          let matchDigital = true;
          if (
            temVersaoDigital &&
            p.TP_VERSAO_DIGITAL &&
            p.TP_VERSAO_DIGITAL[i] !== null
          ) {
            matchDigital = Number(p.TP_VERSAO_DIGITAL[i]) === parsedTpLingua;
          }
          return matchProva && matchLingua && matchDigital;
        });

      indicesFiltrados.sort(
        (a, b) => Number(p.CO_POSICAO[a]) - Number(p.CO_POSICAO[b]),
      );

      if (indicesFiltrados.length !== 45) {
        console.error(
          [
            `Erro de integridade: Esperados 45 itens, `,
            `encontrados ${indicesFiltrados.length} para a prova ${codProva}.`,
          ].join(""),
        );
        return NextResponse.json([]);
      }

      const areaMapResult = indicesFiltrados.map((i, pointer) => {
        return {
          pos: p.CO_POSICAO[i],
          status:
            Number(p.IN_ITEM_ABAN[i]) === 1
              ? "abandoned"
              : bits[pointer] === "1"
                ? "correct"
                : "wrong",
          co_item: p.CO_ITEM[i],
        };
      });

      return NextResponse.json(areaMapResult);
    }

    // Tratamento anterior para getItemDetails (caso aplicável na mesma rota)
    if (codigo !== null && coItem !== null) {
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
    }

    return NextResponse.json(p);
  } catch (error) {
    console.error("ERRO NA ROTA DE API:", error);
    return NextResponse.json(
      { error: "Erro ao buscar itens" },
      { status: 500 },
    );
  }
}
