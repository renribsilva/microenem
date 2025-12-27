import { useState, useEffect } from 'react';

export function useChartTheme() {

  const [isDark, setIsDark] = useState(false);
  const [textColor, setTextColor] = useState(null);
  const [panelColor, setPanelColor] = useState(null);
  const [gridColor, setGridColor] = useState(null);

  useEffect(() => {      
    const updateThemeValues = () => {
      const htmlElement = document.documentElement;
      setIsDark(htmlElement.classList.contains('dark'));
      
      const style = getComputedStyle(htmlElement);
      const txt_color = style.getPropertyValue('--foreground').trim();
      const panel_color = style.getPropertyValue('--panel').trim();
      const grid_color = style.getPropertyValue('--grid').trim();
      
      if (txt_color) {
        setTextColor(txt_color);
      }

      if (panel_color) {
        setPanelColor(panel_color);
      }

      if (grid_color) {
        setGridColor(grid_color);
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

  return { isDark, textColor, panelColor, gridColor };
}