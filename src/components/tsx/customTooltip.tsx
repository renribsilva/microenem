interface TooltipProps {
  label: string;
  value: number | string;
  absolute?: number;
}

export default function customTooltip ({ label, value, absolute }: TooltipProps) {

  const safeAbsolut = absolute ? absolute : 0

  return `
    <div style="background: rgba(30, 30, 30, 0.95); border: 1px solid #444; color: #fff; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.5); min-width: 150px;">
      <div style="background: rgba(0, 0, 0, 0.7); padding: 8px 12px; border-bottom: 1px solid #444; font-weight: bold; font-size: 13px;">
        ${label}
      </div>
      <div style="padding: 10px; font-size: 12px; line-height: 1.6;">
        <span style="color: #ccc;">Porcentagem:</span> <strong>${value}%</strong><br/>
        <span style="color: #ccc;">Total:</span> <strong>${safeAbsolut.toLocaleString('pt-BR')}</strong>
      </div>
    </div>
  `;
};