"use client";

import { useEffect, useRef } from "react";
import { useHomeData } from "../../context/home_context";
import { useYearData } from "../../context/year_context";

export default function RenderKeepAlive() {
  const { deferredArea, currentYear, selectedLabel } = useHomeData();
  const { sampleEAP } = useYearData();

  const stateRef = useRef({
    deferredArea,
    currentYear,
    selectedLabel,
    sampleEAP,
  });

  useEffect(() => {
    stateRef.current = { deferredArea, currentYear, selectedLabel, sampleEAP };
  }, [deferredArea, currentYear, selectedLabel, sampleEAP]);

  useEffect(() => {
    async function fetchEAPData() {
      const { deferredArea, currentYear, selectedLabel, sampleEAP } =
        stateRef.current;
      const [codigo, lingua] = (selectedLabel || "").split("_");
      try {
        const isDev = process.env.NODE_ENV === "development";
        if (isDev) {
          console.log("⏰ [Keep-Alive] Acordando/mantendo o Render ativo...");
        }
        const params = new URLSearchParams({
          sample: String(sampleEAP),
          area: String(deferredArea),
          ano: String(currentYear),
          codigo: String(codigo),
          lingua: String(lingua),
        });
        const res = await fetch(`/api/eap?${params.toString()}`);
        if (res.ok && isDev) {
          console.log("✅ [Keep-Alive] O Render está acordado!");
        }
      } catch (err) {
        console.error("Erro ao carregar EAPdata:", err);
      }
    }
    // Chamada inicial no mount
    fetchEAPData();
    // Adiciona uma variação aleatória de 0 a 30s
    // para dispersar os pings de múltiplos usuários
    const randomJitter = Math.floor(Math.random() * 30000);
    const intervalTime = 10 * 60 * 1000 + randomJitter;
    const intervalId = setInterval(fetchEAPData, intervalTime);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return null;
}
