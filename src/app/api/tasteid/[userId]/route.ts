import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { getArchetypeInfo } from '@/lib/tasteid'

/**
 * GET /api/tasteid/[userId]
 * Get a user's public TasteID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    const tasteId = await prisma.tasteID.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
      },
    })

    if (!tasteId) {
      return errorResponse('TasteID not found for this user', 404)
    }

    const archetypeInfo = getArchetypeInfo(tasteId.primaryArchetype)
    const secondaryArchetypeInfo = tasteId.secondaryArchetype
      ? getArchetypeInfo(tasteId.secondaryArchetype)
      : null

    // Return public view (less detailed than /me)
    return successResponse({
      tasteId: {
        id: tasteId.id,
        user: tasteId.user,

        // Archetype
        primaryArchetype: {
          ...archetypeInfo,
        },
        secondaryArchetype: secondaryArchetypeInfo
          ? { ...secondaryArchetypeInfo }
          : null,

        // Public display data
        topGenres: tasteId.topGenres,
        topArtists: tasteId.topArtists,

        // Public metrics
        adventurenessScore: tasteId.adventurenessScore,
        polarityScore: tasteId.polarityScore,
        ratingSkew: tasteId.ratingSkew,
        reviewDepth: tasteId.reviewDepth,
        averageRating: tasteId.averageRating,
        reviewCount: tasteId.reviewCount,

        lastComputedAt: tasteId.lastComputedAt,
      },
    })
  } catch (error) {
    console.error('Error fetching user TasteID:', error)
    return errorResponse('Failed to fetch TasteID', 500)
  }
}
