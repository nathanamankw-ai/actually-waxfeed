import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { computeTasteID, saveTasteID, createTasteIDSnapshot } from '@/lib/tasteid'

/**
 * POST /api/tasteid/compute
 * Compute or recompute the current user's TasteID
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return errorResponse('Authentication required', 401)
    }

    const userId = session.user.id

    // Check if user has enough reviews
    const reviewCount = await prisma.review.count({ where: { userId } })
    if (reviewCount < 3) {
      return errorResponse('Review at least 3 albums to generate your TasteID', 400)
    }

    // Compute TasteID
    const computation = await computeTasteID(userId)
    if (!computation) {
      return errorResponse('Could not compute TasteID', 500)
    }

    // Save to database
    const tasteId = await saveTasteID(userId, computation)

    // Create monthly snapshot if this is a new computation
    await createTasteIDSnapshot(tasteId.id)

    return successResponse({
      tasteId: {
        id: tasteId.id,
        primaryArchetype: tasteId.primaryArchetype,
        secondaryArchetype: tasteId.secondaryArchetype,
        archetypeConfidence: tasteId.archetypeConfidence,
        adventurenessScore: tasteId.adventurenessScore,
        polarityScore: tasteId.polarityScore,
        topGenres: tasteId.topGenres,
        topArtists: tasteId.topArtists,
        ratingSkew: tasteId.ratingSkew,
        reviewDepth: tasteId.reviewDepth,
        reviewCount: tasteId.reviewCount,
        averageRating: tasteId.averageRating,
      },
      message: 'TasteID computed successfully',
    })
  } catch (error) {
    console.error('Error computing TasteID:', error)
    return errorResponse('Failed to compute TasteID', 500)
  }
}
