import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          backgroundImage: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        }}
      >
        {/* Logo/Icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 120,
            height: 120,
            backgroundColor: '#ffffff',
            marginBottom: 40,
          }}
        >
          <svg
            width="60"
            height="60"
            viewBox="0 0 24 24"
            fill="none"
            style={{ color: '#0a0a0a' }}
          >
            <path
              d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: '#ffffff',
            marginBottom: 20,
            fontFamily: 'sans-serif',
          }}
        >
          MEMOROS
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: 'flex',
            fontSize: 32,
            color: '#888888',
            marginBottom: 40,
            fontFamily: 'sans-serif',
          }}
        >
          Best Free Ebook Reader App
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: 30,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 24,
              color: '#cccccc',
              backgroundColor: '#1a1a1a',
              padding: '12px 24px',
              border: '1px solid #333',
            }}
          >
            📚 EPUB
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 24,
              color: '#cccccc',
              backgroundColor: '#1a1a1a',
              padding: '12px 24px',
              border: '1px solid #333',
            }}
          >
            📄 PDF
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 24,
              color: '#cccccc',
              backgroundColor: '#1a1a1a',
              padding: '12px 24px',
              border: '1px solid #333',
            }}
          >
            📖 MOBI
          </div>
        </div>

        {/* Footer tagline */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            fontSize: 20,
            color: '#666666',
            fontFamily: 'sans-serif',
          }}
        >
          Read Anywhere • Sync Everywhere • Free Forever
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
