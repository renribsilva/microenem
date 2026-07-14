import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ENEMmicro: No bullshit, just data.";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;

  const path = "/" + (slug?.join("/") ?? "");
  const targetUrl = `https://microenem.vercel.app${path}`;

  const searchParams = new URLSearchParams({
    url: targetUrl,
    screenshot: "true",
    embed: "screenshot.url",
    "viewport.width": "1200",
    "viewport.height": "630",
    "viewport.deviceScaleFactor": "2",
  });

  const screenshotServiceUrl = `https://api.microlink.io/?${searchParams.toString()}`;

  const imageSrc = await fetch(screenshotServiceUrl)
    .then(async (res) => {
      if (!res.ok) return null;

      const arrayBuffer = await res.arrayBuffer();

      // Compatível com Edge Runtime
      const base64Image = btoa(
        String.fromCharCode(...new Uint8Array(arrayBuffer)),
      );

      return `data:image/png;base64,${base64Image}`;
    })
    .catch(() => null);

  if (!imageSrc) {
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
      size,
    );
  }

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: "black",
      }}
    >
      <img
        src={imageSrc}
        alt={targetUrl}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>,
    size,
  );
}
