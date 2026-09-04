import { NextResponse } from "next/server";

export const revalidate = 0; // Garante execução dinâmica sem cache

export async function GET() {
  try {
    const res = await fetch("https://microenemapi.onrender.com/health", {
      method: "GET",
      headers: {
        "User-Agent": "NextJS-KeepAlive/1.0",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Erro na API R Plumber", status: res.status },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json({ ok: true, renderData: data });
  } catch (error) {
    console.error("Erro no keep-alive do R Plumber:", error);
    return NextResponse.json(
      { error: "API R Plumber indisponível" },
      { status: 500 },
    );
  }
}
