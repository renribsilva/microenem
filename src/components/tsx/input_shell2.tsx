export default function InputShell2 ({ logic }: { logic: any }) {
  if (!logic) return null;

  const { 
    activeDataset, 
    pointIndex, 
    setPointIndex, 
    chartColor,
  } = logic;

  return (
    <div>     
      <input 
        type="range" 
        min="0"
        max={activeDataset.data.length - 1} 
        value={pointIndex}
        onChange={(e) => setPointIndex(Number(e.target.value))}
        style={{ width: '100%', cursor: 'pointer', accentColor: chartColor }}
      />
    </div>
  );
}