import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const area = searchParams.get('area');
  const label = searchParams.get('co_p'); // Código da prova, ex: "501"
  const year = searchParams.get('year')

  if (!area) {
    return NextResponse.json({ error: "Área é obrigatória" }, { status: 400 });
  }

  try {
    // Tente construir o caminho de forma mais robusta
    const filePath = path.join(process.cwd(), 'src', 'app', '(home)', 'JSON', year, `tcc_${year}.json`);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: `Arquivo não encontrado` }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const fullJson = JSON.parse(fileContent);

    // 1. Pega apenas as chaves (ex: ["501", "502"]) que pertencem à área (ex: "LC")
    const keysDaArea = Object.keys(fullJson).filter(key => 
      fullJson[key].area === area
    );

    if (keysDaArea.length === 0) {
      return NextResponse.json({ error: `Nenhum dado para a área: ${area}` }, { status: 404 });
    }

    // 2. CORREÇÃO AQUI: 
    // Para o dataset, precisamos acessar o objeto original 'fullJson' usando a chave 'label'
    // Verificamos se o label existe E se ele pertence àquela área
    const selectedKey = (label && fullJson[label] && fullJson[label].area === area) 
      ? label 
      : keysDaArea[0]; // Fallback para o primeiro da lista daquela área

    const dataset = fullJson[selectedKey];

    // 3. Monta a lista de opções para o frontend
    const availableDatasets = keysDaArea.map(key => ({
      label: key,
      metadata: fullJson[key].metadata
    }));
    
    return NextResponse.json({
      dataset: dataset,
      label: selectedKey, // Retornamos a chave real selecionada
      availableDatasets: availableDatasets
    });

  } catch (error: any) {
    console.error("ERRO NA API:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}