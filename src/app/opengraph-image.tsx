import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ENEMmicro: No bullshit, just data.";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  const targetUrl = "https://microenem.vercel.app/";

  const params = new URLSearchParams({
    url: targetUrl,
    screenshot: "true",
    embed: "screenshot.url",
    "viewport.width": "1200",
    "viewport.height": "630",
    "viewport.deviceScaleFactor": "2",
  });

  const screenshotServiceUrl = `https://api.microlink.io/?${params.toString()}`;

  try {
    const res = await fetch(screenshotServiceUrl, {
      signal: AbortSignal.timeout(2500),
    });

    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();

      return new Response(arrayBuffer, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }
  } catch (error) {
    console.error("Falha ao buscar imagem do Microlink", error);
  }

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
          ENEMmicro
        </p>
        <p
          style={{
            fontSize: 26,
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
