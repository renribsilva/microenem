import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const area = searchParams.get("area");
  const label = searchParams.get("co_p");
  const year = searchParams.get("year");

  if (!area || !label || !year) {
    return NextResponse.json(
      { error: "Informe os parâmetros: area, label, year" },
      { status: 400 },
    );
  }

  try {
    const filePath = path.join(
      process.cwd(),
      `src/app/(home)/JSON/${year}/tcc_${year}.json`,
    );

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `Arquivo não encontrado` },
        { status: 404 },
      );
    }

    const fileContent = fs.readFileSync(filePath, "utf8");
    const fullJson = JSON.parse(fileContent);

    const keysDaArea = Object.keys(fullJson).filter(
      (key) => fullJson[key].area === area,
    );

    if (keysDaArea.length === 0) {
      return NextResponse.json(
        { error: `Nenhum dado para a área: ${area}` },
        { status: 404 },
      );
    }

    const selectedKey =
      label && fullJson[label] && fullJson[label].area === area
        ? label
        : keysDaArea[0]; // Fallback para o primeiro da lista daquela área

    const activeDataset = fullJson[selectedKey];

    const availableDatasets = keysDaArea.map((key) => ({
      label: key,
      metadata: fullJson[key].metadata,
    }));

    return NextResponse.json({
      resLabel: selectedKey,
      activeDataset: activeDataset,
      availableDatasets: availableDatasets,
    });
  } catch (error) {
    console.error("ERRO NA API:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 },
    );
  }
}
