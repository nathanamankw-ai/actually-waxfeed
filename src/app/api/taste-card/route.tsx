import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getArchetypeInfo } from '@/lib/tasteid'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username) {
      return new Response('Username required', { status: 400 })
    }

    // Get user and TasteID
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        username: true,
        image: true,
        tasteId: {
          select: {
            primaryArchetype: true,
            topGenres: true,
            topArtists: true,
            adventurenessScore: true,
            polarityScore: true,
            averageRating: true,
            reviewCount: true,
          },
        },
      },
    })

    if (!user || !user.tasteId) {
      return new Response('TasteID not found', { status: 404 })
    }

    const archetype = getArchetypeInfo(user.tasteId.primaryArchetype)

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            backgroundColor: '#000',
            color: '#fff',
            fontFamily: 'Helvetica, Arial, sans-serif',
            padding: '48px',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '32px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: '14px',
                  color: '#666',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                }}
              >
                TASTEID
              </span>
              <span style={{ fontSize: '32px', fontWeight: 'bold' }}>
                @{user.username}
              </span>
            </div>
            <span
              style={{
                fontSize: '14px',
                color: '#666',
                letterSpacing: '0.1em',
              }}
            >
              WAXFEED
            </span>
          </div>

          {/* Archetype */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '32px',
              padding: '24px',
              border: '2px solid #fff',
            }}
          >
            <span style={{ fontSize: '48px' }}>{archetype.icon}</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {archetype.name}
              </span>
              <span style={{ fontSize: '16px', color: '#888' }}>
                {archetype.description}
              </span>
            </div>
          </div>

          {/* Top Genres */}
          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '24px' }}>
            <span
              style={{
                fontSize: '12px',
                color: '#666',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}
            >
              TOP GENRES
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {user.tasteId.topGenres.slice(0, 5).map((genre, i) => (
                <span
                  key={i}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #555',
                    fontSize: '14px',
                    textTransform: 'uppercase',
                  }}
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div
            style={{
              display: 'flex',
              gap: '24px',
              marginTop: 'auto',
              paddingTop: '24px',
              borderTop: '1px solid #333',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {Math.round(user.tasteId.adventurenessScore * 100)}%
              </span>
              <span style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>
                ADVENTUROUS
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {user.tasteId.averageRating.toFixed(1)}
              </span>
              <span style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>
                AVG RATING
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {user.tasteId.reviewCount}
              </span>
              <span style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>
                REVIEWS
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('Error generating taste card:', error)
    return new Response('Failed to generate taste card', { status: 500 })
  }
}
