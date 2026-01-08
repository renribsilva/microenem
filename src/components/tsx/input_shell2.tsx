export default function InputShell2 ({ logic, activeCodes }: { logic: any, activeCodes: number[] }) {
  if (!logic) return null;

  const { 
    activeDataset, 
    pointIndex, 
    setPointIndex, 
    chartColor,
  } = logic;

  const safeIndex = activeCodes.length > 0 ? pointIndex : 0
  
  return (
    <div>     
      <input 
        type="range" 
        min="0"
        max={activeDataset.data.length - 1} 
        value={safeIndex}
        onChange={(e) => setPointIndex(Number(e.target.value))}
        style={{ width: '100%', cursor: 'pointer', accentColor: chartColor }}
      />
    </div>
  );
}