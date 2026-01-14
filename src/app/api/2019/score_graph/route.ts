// app/api/probtrace/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: "code obrigatório" }, { status: 400 });
  }

  try {
    const filePath = path.join(process.cwd(), 'src/app/(home)/2019/resposta-ao-item/json/score_graph.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const fullJson = JSON.parse(fileContent);

    // Retornamos apenas a fatia necessária
    return NextResponse.json({
      dataset: fullJson[code] || null
    });

  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}