"use client";

import { useState, useEffect } from "react";

export function useChartTheme() {
  const [isDark, setIsDark] = useState(false);
  const [textColor, setTextColor] = useState(null);
  const [panelColor, setPanelColor] = useState(null);
  const [gridColor, setGridColor] = useState(null);
  const [tickColor, setTickColor] = useState(null);
  const [axisColor, setAxisColor] = useState(null);

  const colors: Record<string, string> = {
    azul: "#3284eb",
    amarela: "#eab308",
    branca: "#94a3b8",
    cinza: "#475569",
    laranja: "#f97316",
    verde: "#22c55e",
    roxa: "#8b5cf6",
    rosa: "#db2777",
  };

  const colorMap: Record<string, string> = {
    Azul: colors.azul,
    Amarela: colors.amarela,
    Branca: colors.branca,
    Cinza: colors.cinza,
    "Laranja - Adaptada Ledor": colors.laranja,
    "Verde - Videoprova - Libras": colors.verde,
    "Roxa - Videoprova - Libras": colors.roxa,
    Verde: colors.verde,
    "Verde (Ampliada)": colors.verde,
    "Verde (Superampliada)": colors.verde,
    Rosa: colors.rosa,
    "Rosa (Ampliada)": colors.rosa,
    "Rosa (Superampliada)": colors.rosa,
  };

  useEffect(() => {
    const updateThemeValues = () => {
      // Acessa o estilo de um determinado elemento HTML
      const htmlElement = document.documentElement;
      setIsDark(htmlElement.classList.contains("dark"));
      const style = getComputedStyle(htmlElement);

      // Extrai as cores definidas de acordo com o tema
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
    tickColor,
    axisColor,
  };
}
