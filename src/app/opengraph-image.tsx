import { ImageResponse } from "next/og";
import { headers } from "next/headers";

export const runtime = "edge";
export const alt = "ENEMmicro: No bullshit, just data.";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  // 1. Pega os headers para descobrir o domínio e o protocolo dinamicamente
  const headersList = await headers();
  const host =
    headersList.get("x-forwarded-host") ||
    headersList.get("host") ||
    "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") || "http";

  // 2. Reconstrói a URL exata da página atual
  // Remove o "/opengraph-image" do final da URL se o Next estiver batendo direto na rota da imagem
  const currentUrl = `${proto}://${host}`.replace(/\/opengraph-image$/, "");

  // 3. API do Microlink para tirar o print da URL detectada
  const screenshotServiceUrl = `https://api.microlink.io/?url=${encodeURIComponent(
    currentUrl,
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
    // Fallback de segurança caso dê merda na API de print
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
