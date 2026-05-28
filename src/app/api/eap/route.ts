import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Capturando os parâmetros da URL
  const area = searchParams.get("area");
  const ano = searchParams.get("ano");
  const sample = searchParams.get("sample");
  const codigo = searchParams.get("codigo");
  const lingua = searchParams.get("lingua");

  if (!area || !sample) {
    return NextResponse.json(
      { error: "Parâmetros insuficientes" },
      { status: 400 },
    );
  }

  try {
    // 1. Fazemos o fetch para a API externa (o servidor não tem trava de CORS)
    const externalApiUrl = `https://microenemapi.onrender.com/calc?sample=${sample}&area=${area}&ano=${ano}&codigo=${codigo}&lingua=${lingua}`;

    const res = await fetch(externalApiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Erro na API externa" },
        { status: res.status },
      );
    }

    const data = await res.json();

    // 2. Retornamos os dados para o seu front-end
    return NextResponse.json(data);
  } catch (error) {
    console.error("ERRO NA ROTA DE API:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados da API" },
      { status: 500 },
    );
  }
}

