// app/api/probtrace/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year');
  const rank = searchParams.get('rank');

  if (!year) {
    return NextResponse.json({ error: "year obrigatório" }, { status: 400 });
  }

  if (!rank) {
    return NextResponse.json({ error: "rank obrigatório" }, { status: 400 });
  }

  try {
    const filePath = path.join(process.cwd(), `src/app/(home)/JSON/${year}/media-simples/mean_table.json`);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const fullJson = JSON.parse(fileContent);

    const targetRank = Number(rank);
    const result = fullJson.find((item: any) => item.RANKING === targetRank);

    if (!result) {
      return NextResponse.json({ error: "Ranking não encontrado" }, { status: 404 });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error("Erro na API Probtrace:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}