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
        {/* Share Icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 100,
            height: 100,
            backgroundColor: '#ffffff',
            marginBottom: 30,
          }}
        >
          <svg
            width="50"
            height="50"
            viewBox="0 0 24 24"
            fill="none"
            style={{ color: '#0a0a0a' }}
          >
            <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2" />
            <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
            <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2" />
            <path
              d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: '#ffffff',
            marginBottom: 16,
            fontFamily: 'sans-serif',
          }}
        >
          Book Shared With You
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            color: '#888888',
            marginBottom: 40,
            textAlign: 'center',
            fontFamily: 'sans-serif',
          }}
        >
          View and save to your library on MEMOROS
        </div>

        {/* CTA */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 24,
            color: '#0a0a0a',
            backgroundColor: '#ffffff',
            padding: '16px 32px',
            fontWeight: 600,
          }}
        >
          Open in MEMOROS →
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 24,
              fontWeight: 700,
              color: '#ffffff',
              fontFamily: 'sans-serif',
            }}
          >
            MEMOROS
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 18,
              color: '#666666',
              fontFamily: 'sans-serif',
            }}
          >
            Free Ebook Reader • EPUB • PDF • MOBI
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
