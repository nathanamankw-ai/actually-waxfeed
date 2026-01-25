import { NextRequest } from 'next/server'
import { successResponse, errorResponse, requireAuth } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'

// GET /api/first-spin/badges - Get user's First Spin badges
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    const badges = await prisma.firstSpinBadge.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    // Enrich with album data
    const albumIds = badges.map(b => b.albumId)
    const albums = await prisma.album.findMany({
      where: { id: { in: albumIds } },
      select: {
        id: true,
        title: true,
        artistName: true,
        coverArtUrl: true,
        spotifyId: true,
      }
    })

    const albumMap = new Map(albums.map(a => [a.id, a]))

    const enrichedBadges = badges.map(badge => ({
      ...badge,
      album: albumMap.get(badge.albumId) || null,
    }))

    return successResponse(enrichedBadges)

  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401)
    }
    console.error('Error getting badges:', error)
    return errorResponse('Failed to get badges', 500)
  }
}
