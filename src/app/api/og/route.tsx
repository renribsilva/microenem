import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export async function GET() {
  try {
    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0d0d0d",
          fontFamily: "sans-serif",
          padding: "80px 90px",
        }}
      >
        {/* Linha superior minimalista */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <span
            style={{
              fontSize: 16,
              color: "#737373",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            INEP / Microdados
          </span>
          <div
            style={{
              width: "48px",
              height: "3px",
              backgroundColor: "#2563eb",
            }}
          />
        </div>

        {/* Bloco central construtivista: E + Títulos */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "56px",
            width: "100%",
          }}
        >
          {/* Bloco tipográfico puro do E */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#2563eb",
              width: "140px",
              height: "140px",
            }}
          >
            <span
              style={{
                fontSize: "92px",
                fontWeight: 900,
                color: "#0d0d0d",
                lineHeight: 1,
              }}
            >
              E
            </span>
          </div>

          {/* Tipografia */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <h1
              style={{
                fontSize: 68,
                fontWeight: 900,
                color: "#fafafa",
                margin: "0 0 14px 0",
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              ENEMmicro
            </h1>

            <p
              style={{
                fontSize: 24,
                color: "#a3a3a3",
                margin: 0,
                lineHeight: 1.4,
                maxWidth: "640px",
              }}
            >
              Visualização gráfica dos microdados do ENEM.
            </p>
          </div>
        </div>

        {/* Rodapé cru */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span
            style={{
              fontSize: 14,
              color: "#2563eb",
              fontWeight: 900,
            }}
          ></span>
          <span
            style={{
              fontSize: 15,
              color: "#737373",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            microenem.vercel.app
          </span>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(`Failed to generate the image: ${message}`, {
      status: 500,
    });
  }
}
