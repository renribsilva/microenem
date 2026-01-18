// app/api/probtrace/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const co_p = searchParams.get('co_p');
  const year = searchParams.get('year');

  if (!co_p) {
    return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
  }

  try {
    const filePath = path.join(process.cwd(), `src/app/(home)/JSON/${year}/probtrace_${year}.json`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const fullJson = JSON.parse(fileContent);

    // Retornamos apenas a fatia necessária
    return NextResponse.json({
      dataset: fullJson.datasets[co_p] || null,
      theta_labels: fullJson.theta_labels
    });

  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}