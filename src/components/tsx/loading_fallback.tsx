function LoadingFallback() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fdfdfd",
        color: "#8c8c8c",
        fontSize: "14px",
        zIndex: 10,
        width: "300px",
        height: "500px",
        animation: "pulse 1.5s infinite ease-in-out",
      }}
    >
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }
      `}</style>
      Carregando...
    </div>
  );
}

export default LoadingFallback;
