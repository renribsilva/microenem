import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const area = searchParams.get('area');
  const label = searchParams.get('co_p');

  if (!area) {
    return NextResponse.json({ error: "Área é obrigatória" }, { status: 400 });
  }

  try {
    const filePath = path.join(process.cwd(), 'src', 'app', '(home)', '2019', 'json', `tcc_${area}_2019.json`);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: `Arquivo não encontrado: tcc_${area}_2019.json` }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const fullJson = JSON.parse(fileContent);
    const foundDataset = fullJson.datasets.find((ds: any) => ds.label === label);
    const availableDatasets = fullJson.datasets.map((ds: any) => ({
      label: ds.label,
      metadata: ds.metadata
    }));
    
    return NextResponse.json({
      dataset: foundDataset || fullJson.datasets[0],
      label: label || (foundDataset ? foundDataset.label : fullJson.datasets[0].label),
      availableDatasets: availableDatasets
    });

  } catch (error: any) {
    console.error("ERRO NA API:", error);
    return NextResponse.json({ error: "Erro interno no servidor", details: error.message }, { status: 500 });
  }
}