import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'

const MIN_REVIEWS_REQUIRED = 10

// GET /api/albums/random - Get a genre-weighted random album for the user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // If no user, return error - feature requires login
    if (!userId) {
      return errorResponse('Sign in to use Spin the Wheel', 401)
    }

    // Get user's reviews to check eligibility and extract genre preferences
    const userReviews = await prisma.review.findMany({
      where: { userId },
      include: {
        album: {
          select: {
            id: true,
            genres: true,
          },
        },
      },
    })

    // Check if user has enough reviews
    if (userReviews.length < MIN_REVIEWS_REQUIRED) {
      return errorResponse(
        `You need at least ${MIN_REVIEWS_REQUIRED} reviews to unlock Spin the Wheel. You have ${userReviews.length}.`,
        403
      )
    }

    // Extract user's genre preferences from their reviews
    const genreCount: Record<string, number> = {}
    const reviewedAlbumIds = userReviews.map(r => r.album.id)

    for (const review of userReviews) {
      for (const genre of review.album.genres) {
        genreCount[genre] = (genreCount[genre] || 0) + 1
      }
    }

    // Sort genres by frequency
    const sortedGenres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .map(([genre]) => genre)

    // Get top 5 genres for weighted selection
    const topGenres = sortedGenres.slice(0, 5)

    // Build where clause - NEVER show singles
    const baseWhere: Record<string, unknown> = {
      albumType: { not: 'single' },
      coverArtUrl: { not: null },
      id: { notIn: reviewedAlbumIds },
    }

    // 70% chance to pick from user's preferred genres, 30% chance for discovery
    const useGenreWeighting = Math.random() < 0.7 && topGenres.length > 0

    let album = null

    if (useGenreWeighting) {
      // Pick a random genre from user's top genres (weighted by frequency)
      const totalWeight = topGenres.reduce((sum, g) => sum + (genreCount[g] || 0), 0)
      let random = Math.random() * totalWeight
      let selectedGenre = topGenres[0]

      for (const genre of topGenres) {
        random -= genreCount[genre] || 0
        if (random <= 0) {
          selectedGenre = genre
          break
        }
      }

      // Try to find an album in the selected genre
      const genreWhere = {
        ...baseWhere,
        genres: { has: selectedGenre },
      }

      const genreCount_2 = await prisma.album.count({ where: genreWhere })

      if (genreCount_2 > 0) {
        const randomOffset = Math.floor(Math.random() * genreCount_2)
        album = await prisma.album.findFirst({
          where: genreWhere,
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
      }
    }

    // Fallback to any random album if genre-weighted search failed
    if (!album) {
      const count = await prisma.album.count({ where: baseWhere })

      if (count === 0) {
        return errorResponse('No albums available to discover', 404)
      }

      const randomOffset = Math.floor(Math.random() * count)
      album = await prisma.album.findFirst({
        where: baseWhere,
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
    }

    if (!album) {
      return errorResponse('No album found', 404)
    }

    return successResponse({
      album,
      genreWeighted: useGenreWeighting,
      userReviewCount: userReviews.length,
      topGenres: topGenres.slice(0, 3),
    })
  } catch (error) {
    console.error('Error fetching random album:', error)
    return errorResponse('Failed to fetch random album', 500)
  }
}
