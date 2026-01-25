import { NextRequest } from 'next/server'
import { successResponse, errorResponse, requireAuth } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'

// GET /api/albums/swipe - Get random unrated albums for swipe mode
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

    // Get IDs of albums the user has already reviewed
    const reviewedAlbumIds = await prisma.review.findMany({
      where: { userId: user.id },
      select: { albumId: true },
    })

    const reviewedIds = new Set(reviewedAlbumIds.map(r => r.albumId))

    // Get random albums the user hasn't reviewed
    // Using a subquery approach for better performance
    const totalUnrated = await prisma.album.count({
      where: {
        id: { notIn: Array.from(reviewedIds) },
        coverArtUrl: { not: null }, // Only albums with cover art
      },
    })

    if (totalUnrated === 0) {
      return successResponse([])
    }

    // Get random offset for variety
    const maxOffset = Math.max(0, totalUnrated - limit)
    const randomOffset = Math.floor(Math.random() * (maxOffset + 1))

    const albums = await prisma.album.findMany({
      where: {
        id: { notIn: Array.from(reviewedIds) },
        coverArtUrl: { not: null },
      },
      select: {
        id: true,
        title: true,
        artistName: true,
        coverArtUrl: true,
        coverArtUrlLarge: true,
        releaseDate: true,
        genres: true,
      },
      skip: randomOffset,
      take: limit,
      orderBy: {
        // Mix of popularity and randomness
        totalReviews: 'desc',
      },
    })

    // Shuffle the results for more randomness
    const shuffled = albums.sort(() => Math.random() - 0.5)

    return successResponse(shuffled)

  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401)
    }
    console.error('Error getting swipe albums:', error)
    return errorResponse('Failed to get albums', 500)
  }
}
