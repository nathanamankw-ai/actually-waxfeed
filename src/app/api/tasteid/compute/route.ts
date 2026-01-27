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
  console.log('\n========================================')
  console.log('[TasteID API] Starting computation...')
  console.log('========================================\n')
  
  try {
    const session = await auth()
    if (!session?.user?.id) {
      console.log('[TasteID API] ERROR: No authenticated user')
      return errorResponse('Authentication required', 401)
    }

    const userId = session.user.id
    console.log('[TasteID API] User ID:', userId)

    // Check if user has enough reviews
    const reviewCount = await prisma.review.count({ where: { userId } })
    console.log('[TasteID API] Review count:', reviewCount)
    
    if (reviewCount < 3) {
      return errorResponse('Review at least 3 albums to generate your TasteID', 400)
    }

    // Compute TasteID
    console.log('[TasteID API] Computing TasteID...')
    const computation = await computeTasteID(userId)
    if (!computation) {
      console.log('[TasteID API] ERROR: computeTasteID returned null')
      return errorResponse('Could not compute TasteID', 500)
    }

    console.log('\n========================================')
    console.log('[TasteID API] COMPUTATION RESULT:')
    console.log('  Primary Archetype:', computation.primaryArchetype)
    console.log('  Secondary Archetype:', computation.secondaryArchetype)
    console.log('  Confidence:', (computation.archetypeConfidence * 100).toFixed(1) + '%')
    console.log('  Adventureness:', (computation.adventurenessScore * 100).toFixed(1) + '%')
    console.log('  Top Genres:', computation.topGenres.slice(0, 5).join(', '))
    console.log('========================================\n')

    // Save to database
    console.log('[TasteID API] Saving to database...')
    const tasteId = await saveTasteID(userId, computation)
    console.log('[TasteID API] Saved! TasteID:', tasteId.id)

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
    console.error('[TasteID API] ERROR:', error)
    return errorResponse('Failed to compute TasteID', 500)
  }
}
