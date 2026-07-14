import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const size = {
  width: 1200,
  height: 630,
};

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") || "";

  // Garante que não teremos barras duplicadas na URL
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const targetUrl = `https://microenem.vercel.app/${cleanPath}`;

  const microlinkParams = new URLSearchParams({
    url: targetUrl,
    screenshot: "true",
    embed: "screenshot.url",
    "viewport.width": "1200",
    "viewport.height": "630",
    "viewport.deviceScaleFactor": "2",
  });

  const screenshotServiceUrl = `https://api.microlink.io/?${microlinkParams.toString()}`;

  const imageSrc = await fetch(screenshotServiceUrl)
    .then(async (res) => {
      if (!res.ok) return null;
      const arrayBuffer = await res.arrayBuffer();
      const base64Image = arrayBufferToBase64(arrayBuffer);
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
      { ...size },
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
}
