import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://microenemapi.onrender.com/health", {
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Erro na API R" },
        { status: res.status },
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro no keep-alive do R Plumber:", error);
    return NextResponse.json({ error: "API indisponível" }, { status: 500 });
  }
}
