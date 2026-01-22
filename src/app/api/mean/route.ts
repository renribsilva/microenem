// app/api/probtrace/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year');

  if (!year) {
    return NextResponse.json({ error: "year obrigatório" }, { status: 400 });
  }

  try {
    const filePath = path.join(process.cwd(), `src/app/(home)/JSON/${year}/media-simples/mean_table.json`);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const fullJson = JSON.parse(fileContent);

    // Mapeia para retornar um objeto com Ranking e Média
    // Como o R já ordenou e você adicionou a coluna RANKING, 
    // apenas limpamos os dados extras (scores, notas por área, etc)
    const result = fullJson.map((item: any) => ({
      ranking: item.RANKING,
      media: item.MEDIA_GERAL
    }));

    // Caso queira garantir a ordenação por ranking (1 ao 2500)
    result.sort((a: any, b: any) => a.ranking - b.ranking);

    return NextResponse.json(result);

  } catch (error) {
    console.error("Erro na API Probtrace:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}