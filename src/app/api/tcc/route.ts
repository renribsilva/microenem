// app/api/probtrace/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const area = searchParams.get('area');

  if (!area) {
    return NextResponse.json({ error: "Área obrigatório" }, { status: 400 });
  }

  try {
    const filePath = path.join(process.cwd(), 'src/app/(home)/2019/json/tcc_2019.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const fullJson = JSON.parse(fileContent);
    return NextResponse.json({
      datasets: fullJson.datasets.filter(ds => ds.metadata?.area === String(area)) 
      || fullJson.datasets.find(ds => ds.metadata?.area === "LC")
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}