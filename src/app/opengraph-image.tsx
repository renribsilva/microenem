// app/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'ENEMmicro: No bullshit, just data.';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'black',
          width: '100%',
          height: '100%',
          fontFamily: 'sans-serif',
          color: 'white',
          padding: '40px',
        }}
      >
        {/* Texto Principal */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
          <p style={{ fontSize: 90, margin: 0, fontWeight: '900', letterSpacing: '-0.05em', color: '#3b82f6' }}>
            just data.
          </p>
        </div>

        {/* Call to Action (Botão Simulado) */}
        <div
          style={{
            display: 'flex',
            background: 'rgb(31, 28, 28)',
            color: 'black',
            padding: '15px 40px',
            borderRadius: '10px',
            fontSize: 32,
            fontWeight: 'bold',
            marginTop: '20px',
          }}
        >
          microenem.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}