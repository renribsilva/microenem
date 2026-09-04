"use client";

import { useEffect } from "react";

export default function RenderKeepAlive() {
  useEffect(() => {
    const isDev = process.env.NODE_ENV === "development";
    const pingAPI = async () => {
      try {
        if (isDev) {
          console.log("⏰ [Keep-Alive] Acordando/mantendo o Render ativo...");
        }
        const res = await fetch("/api/keep-alive", { cache: "no-store" });
        if (res.ok && isDev) {
          console.log("✅ [Keep-Alive] O Render está acordado!");
        }
      } catch (error) {
        console.error("Erro no ping de keep-alive:", error);
      }
    };
    // Chamada inicial imediata ao carregar a página
    pingAPI();
    // Loop a cada 10 minutos (600.000 ms)
    const intervalId = setInterval(pingAPI, 10 * 60 * 1000);
    // Limpeza de memória ao desmontar o componente
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);
  return null;
}
