import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'BILLi&BoBA NAILS handmade press-on nail studio';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #fff8fc 0%, #fff0f7 48%, #eee6ff 100%)',
          color: '#2a1d31',
          fontFamily: 'Arial, Helvetica, sans-serif',
          padding: 64,
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 54,
            border: '2px solid rgba(74, 49, 78, 0.12)',
            background: 'rgba(255, 255, 255, 0.58)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 64,
            boxShadow: '0 28px 90px rgba(126, 91, 183, 0.18)',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: '0.18em',
              color: '#8c6fe8',
            }}
          >
            HANDMADE PRESS-ON NAILS
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: 104,
                lineHeight: 0.92,
                fontWeight: 900,
                letterSpacing: '-0.08em',
              }}
            >
              BILLi&BoBA
            </div>
            <div
              style={{
                marginTop: 14,
                fontSize: 72,
                lineHeight: 0.95,
                fontWeight: 900,
                letterSpacing: '-0.06em',
                color: '#b04e79',
              }}
            >
              NAILS
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: 30,
              lineHeight: 1.4,
              color: '#756778',
              maxWidth: 820,
              fontWeight: 700,
            }}
          >
            Studio designs, guided hand photos, secure checkout and order tracking.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}