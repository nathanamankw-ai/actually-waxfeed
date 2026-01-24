import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { findSimilarTasters, getArchetypeInfo } from '@/lib/tasteid'

/**
 * GET /api/tasteid/similar
 * Find users with similar taste to the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return errorResponse('Authentication required', 401)
    }

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)

    // Check if user has a TasteID
    const userTaste = await prisma.tasteID.findUnique({
      where: { userId },
    })

    if (!userTaste) {
      return errorResponse('Generate your TasteID first to find similar tasters', 400)
    }

    // Find similar tasters
    const similarTasters = await findSimilarTasters(userId, limit)

    // Enhance with archetype info
    const enhanced = similarTasters.map(taster => ({
      ...taster,
      archetype: getArchetypeInfo(taster.archetype),
    }))

    return successResponse({
      similarTasters: enhanced,
      total: enhanced.length,
    })
  } catch (error) {
    console.error('Error finding similar tasters:', error)
    return errorResponse('Failed to find similar tasters', 500)
  }
}
