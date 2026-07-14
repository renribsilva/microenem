import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ENEMmicro: No bullshit, just data.";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  // URL fixa que você determinou
  const targetUrl = "https://microenem.vercel.app/";

  // API do Microlink para tirar o print da URL fixa
  const screenshotServiceUrl = `https://api.microlink.io/?url=${encodeURIComponent(
    targetUrl,
  )}&screenshot=true&embed=screenshot.url&viewport.width=1200&viewport.height=630&viewport.deviceScaleFactor=2`;

  try {
    const response = await fetch(screenshotServiceUrl);
    if (!response.ok) throw new Error("Falha ao capturar screenshot");

    const arrayBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");
    const imageSrc = `data:image/png;base64,${base64Image}`;

    return new ImageResponse(
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "black",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt="Page Screenshot"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>,
      { ...size },
    );
  } catch (error) {
    // Fallback de segurança se o Microlink falhar
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
        }}
      >
        <p style={{ fontSize: 60, fontWeight: "900" }}>ENEMmicro</p>
      </div>,
      { ...size },
    );
  }
}
