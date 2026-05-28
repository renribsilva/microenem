import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Capturando os parâmetros da URL
  const area = searchParams.get("area");
  const ano = searchParams.get("ano");
  const sample = searchParams.get("sample");
  const codigo = searchParams.get("codigo");
  const lingua = searchParams.get("lingua");

  if (!area || !ano || !sample || !codigo || !lingua) {
    return NextResponse.json(
      {
        error: "Informe os parâmetros: area, ano, sample, codigo, lingua",
      },
      { status: 400 },
    );
  }

  try {
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
    return NextResponse.json(data);
  } catch (error) {
    console.error("ERRO NA ROTA DE API:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados da API" },
      { status: 500 },
    );
  }
}
