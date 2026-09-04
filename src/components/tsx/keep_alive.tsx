"use client";

import { useEffect, useRef } from "react";

export default function RenderKeepAlive() {
  const isPinging = useRef(false);

  useEffect(() => {
    const isDev = process.env.NODE_ENV === "development";

    const pingAPI = async () => {
      // Evita chamadas simultâneas se um ping já estiver em andamento
      if (isPinging.current) return;
      isPinging.current = true;

      try {
        if (isDev) {
          console.log("⏰ [Keep-Alive] Mantendo o Render ativo...");
        }

        await fetch("/api/keep-alive", { cache: "no-store" });

        if (isDev) {
          console.log("✅ [Keep-Alive] O Render está acordado!");
        }
      } catch (error) {
        console.error("Erro no ping de keep-alive:", error);
      } finally {
        isPinging.current = false;
      }
    };

    // Chamada inicial para acordar a API assim que a página carrega
    pingAPI();

    // Ping a cada 12 minutos (720.000 ms) — antes do limite de 15 min do Render
    const intervalId = setInterval(pingAPI, 12 * 60 * 1000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return null;
}
