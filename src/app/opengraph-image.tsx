import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ENEMmicro: No bullshit, just data.";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "black",
        width: "100%",
        height: "100%",
        fontFamily: "sans-serif",
        color: "white",
        padding: "40px",
      }}
    >
      {/* Texto Principal */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "40px",
        }}
      >
        <p
          style={{
            fontSize: 90,
            margin: 0,
            fontWeight: "900",
            letterSpacing: "-0.05em",
            color: "white",
          }}
        >
          ENEMmicro.
        </p>
        <p
          style={{
            fontSize: 12,
            margin: 0,
            fontWeight: "900",
            letterSpacing: "-0.05em",
            color: "white",
          }}
        >
          No bullshit, just data.
        </p>
      </div>
    </div>,
    { ...size },
  );
}
