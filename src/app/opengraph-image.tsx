// app/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Metadados da imagem - AJUSTADO PARA QUADRADO (1:1)
export const alt = 'No bullshit, just data.';
export const size = {
  width: 600,
  height: 600,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60, // Diminuí um pouco a fonte para caber no quadrado
          background: 'black',
          color: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
        <p style={{ margin: 0 }}>just data.</p>
      </div>
    ),
    { ...size }
  );
}