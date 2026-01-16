import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'

// GET /api/albums/random - Get a random album (optionally excluding user's reviewed albums)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Build where clause - NEVER show singles
    const where: Record<string, unknown> = {
      albumType: { not: 'single' },
      coverArtUrl: { not: null }, // Only albums with cover art
    }

    // If user is logged in, exclude albums they've already reviewed
    if (userId) {
      const reviewedAlbumIds = await prisma.review.findMany({
        where: { userId },
        select: { albumId: true },
      })

      if (reviewedAlbumIds.length > 0) {
        where.id = { notIn: reviewedAlbumIds.map(r => r.albumId) }
      }
    }

    // Get total count for random selection
    const count = await prisma.album.count({ where })

    if (count === 0) {
      return errorResponse('No albums available', 404)
    }

    // Pick a random offset
    const randomOffset = Math.floor(Math.random() * count)

    // Get the random album
    const album = await prisma.album.findFirst({
      where,
      skip: randomOffset,
      select: {
        id: true,
        spotifyId: true,
        title: true,
        artistName: true,
        releaseDate: true,
        coverArtUrl: true,
        coverArtUrlMedium: true,
        genres: true,
        albumType: true,
        averageRating: true,
        totalReviews: true,
      },
    })

    if (!album) {
      return errorResponse('No album found', 404)
    }

    return successResponse({ album })
  } catch (error) {
    console.error('Error fetching random album:', error)
    return errorResponse('Failed to fetch random album', 500)
  }
}
