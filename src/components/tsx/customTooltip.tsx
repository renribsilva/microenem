interface TooltipProps {
  label: string;
  value: number | string;
  absolute?: number;
}

export default function customTooltip({
  label,
  value,
  absolute,
}: TooltipProps) {
  const safeAbsolute = absolute ?? 0;

  // 1. Definição clara dos estilos (fácil de editar)
  const css = {
    wrapper: [
      "background: rgba(30, 30, 30, 0.95)",
      "color: #fff",
      "border-radius: 4px",
      "overflow: hidden",
      "box-shadow: 0 1px 10px rgba(0,0,0,0.5)",
      "min-width: 150px",
    ].join("; "),

    header: [
      "background: rgba(0, 0, 0, 0.7)",
      "padding: 8px 12px",
      "font-weight: bold",
      "font-size: 13px",
    ].join("; "),

    content: "padding: 10px; font-size: 12px; line-height: 1.6;",
    dimmed: "color: #ccc;",
  };

  return `
    <div style="${css.wrapper}">
      <div style="${css.header}">
        ${label}
      </div>
      <div style="${css.content}">
        <span style="${css.dimmed}">Porcentagem:</span> 
        <strong>${value}%</strong>
        <br/>
        <span style="${css.dimmed}">Total:</span> 
        <strong>${safeAbsolute.toLocaleString("pt-BR")}</strong>
      </div>
    </div>
  `.trim();
}

