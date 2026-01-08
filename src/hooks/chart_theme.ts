import { useState, useEffect } from 'react';

export function useChartTheme() {

  const [isDark, setIsDark] = useState(false);
  const [textColor, setTextColor] = useState(null);
  const [panelColor, setPanelColor] = useState(null);
  const [gridColor, setGridColor] = useState(null);
  const [tickColor, setTickColor] = useState(null);
  const [axisColor, setAxisColor] = useState(null);

  const colorMap: Record<string, string> = {
      "Azul": "#2563eb", "Amarela": "#eab308", "Rosa": "#db2777",
    "Branca": "#94a3b8", "Cinza": "#475569", "Laranja - Adaptada Ledor": "#f97316",
    "Verde - Videoprova - Libras": "#22c55e",
  };

  const colorExame: Record<string, string> = {
    "curve": '#6366f1',           
    "curve_fill": 'rgba(99, 102, 241, 0.1)', 
    "line": '#f97316',           
    "fill": 'rgba(25, 27, 134, 0.45)', 
    "border": 'rgba(249, 115, 22, 0.5)'
  }

  useEffect(() => {      
    const updateThemeValues = () => {
      const htmlElement = document.documentElement;
      setIsDark(htmlElement.classList.contains('dark'));
      
      const style = getComputedStyle(htmlElement);
      const txt_color = style.getPropertyValue('--foreground').trim();
      const panel_color = style.getPropertyValue('--panel').trim();
      const grid_color = style.getPropertyValue('--grid').trim();
      const tick_color = style.getPropertyValue('--tick').trim();
      const axis_color = style.getPropertyValue('--tick').trim();
      
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
      attributeFilter: ['class'] 
    });     

    return () => observer.disconnect();
  }, []);

  return { isDark, textColor, panelColor, gridColor, colorMap, colorExame, tickColor, axisColor };
}