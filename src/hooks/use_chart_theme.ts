"use client";

import { useState, useEffect } from "react";

export function useChartTheme() {
  const [isDark, setIsDark] = useState(false);
  const [textColor, setTextColor] = useState(null);
  const [panelColor, setPanelColor] = useState(null);
  const [gridColor, setGridColor] = useState(null);
  const [tickColor, setTickColor] = useState(null);
  const [axisColor, setAxisColor] = useState(null);

  const colorMap: Record<string, string> = {
    Azul: "#2563eb",
    Amarela: "#eab308",
    Branca: "#94a3b8",
    Cinza: "#475569",
    "Laranja - Adaptada Ledor": "#f97316",
    "Verde - Videoprova - Libras": "#22c55e",
    "Roxa - Videoprova - Libras": "#8b5cf6",
    Verde: "#22c55e",
    "Verde (Ampliada)": "#22c55e",
    "Verde (Superampliada)": "#22c55e",
    Rosa: "#db2777",
    "Rosa (Ampliada)": "#db2777",
    "Rosa (Superampliada)": "#db2777",
  };

  const densidadeColor: Record<string, string> = {
    curve: "#8b5cf6",
    curve_fill: "rgba(139, 92, 241, 0.1)",
    line: "#f97316",
    fill: "rgba(139, 92, 241, 0.45)",
    border: "rgba(139, 92, 241, 0.6)",
  };

  const acertosColor: Record<string, string> = {
    bar: "rgba(16, 185, 129, 0.2)",
    fill: "rgba(16, 185, 129, 0.8)",
    line: "#f43f5e",
  };

  useEffect(() => {
    const updateThemeValues = () => {
      const htmlElement = document.documentElement;
      setIsDark(htmlElement.classList.contains("dark"));

      const style = getComputedStyle(htmlElement);
      const txt_color = style.getPropertyValue("--foreground").trim();
      const panel_color = style.getPropertyValue("--panel").trim();
      const grid_color = style.getPropertyValue("--grid").trim();
      const tick_color = style.getPropertyValue("--tick").trim();
      const axis_color = style.getPropertyValue("--tick").trim();

      if (txt_color) {
        setTextColor(txt_color);
      }

      if (panel_color) {
        setPanelColor(panel_color);
      }

      if (grid_color) {
        setGridColor(grid_color);
      }

      if (tick_color) {
        setTickColor(tick_color);
      }

      if (axis_color) {
        setAxisColor(axis_color);
      }
    };

    updateThemeValues();

    const observer = new MutationObserver(updateThemeValues);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return {
    isDark,
    textColor,
    panelColor,
    gridColor,
    colorMap,
    densidadeColor,
    tickColor,
    axisColor,
    acertosColor,
  };
}
