import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, requireAuth } from '@/lib/api-utils'

const VALID_REACTIONS = ['fire', 'insightful', 'funny', 'controversial'] as const
type ReactionType = typeof VALID_REACTIONS[number]

const REACTION_COUNT_FIELDS: Record<ReactionType, string> = {
  fire: 'fireCount',
  insightful: 'insightfulCount',
  funny: 'funnyCount',
  controversial: 'controversialCount',
}

// POST /api/reviews/[id]/reactions - Add a reaction
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params
    const user = await requireAuth()
    const { type } = await request.json()

    if (!VALID_REACTIONS.includes(type)) {
      return errorResponse('Invalid reaction type', 400)
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    })

    if (!review) {
      return errorResponse('Review not found', 404)
    }

    // Check if already reacted with this type
    const existing = await prisma.reviewReaction.findUnique({
      where: { reviewId_userId_type: { reviewId, userId: user.id, type } }
    })

    if (existing) {
      return errorResponse('Already reacted', 409)
    }

    // Create reaction
    await prisma.reviewReaction.create({
      data: { reviewId, userId: user.id, type }
    })

    // Increment reaction count
    await prisma.review.update({
      where: { id: reviewId },
      data: { [REACTION_COUNT_FIELDS[type as ReactionType]]: { increment: 1 } }
    })

    return successResponse({ reacted: true, type })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401)
    }
    console.error('Error adding reaction:', error)
    return errorResponse('Failed to add reaction', 500)
  }
}

// DELETE /api/reviews/[id]/reactions - Remove a reaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params
    const user = await requireAuth()
    const { type } = await request.json()

    if (!VALID_REACTIONS.includes(type)) {
      return errorResponse('Invalid reaction type', 400)
    }

    const existing = await prisma.reviewReaction.findUnique({
      where: { reviewId_userId_type: { reviewId, userId: user.id, type } }
    })

    if (!existing) {
      return errorResponse('Reaction not found', 404)
    }

    await prisma.reviewReaction.delete({
      where: { reviewId_userId_type: { reviewId, userId: user.id, type } }
    })

    await prisma.review.update({
      where: { id: reviewId },
      data: { [REACTION_COUNT_FIELDS[type as ReactionType]]: { decrement: 1 } }
    })

    return successResponse({ reacted: false, type })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401)
    }
    console.error('Error removing reaction:', error)
    return errorResponse('Failed to remove reaction', 500)
  }
}

// GET /api/reviews/[id]/reactions - Get user's reactions for a review
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params
    const user = await requireAuth()

    const reactions = await prisma.reviewReaction.findMany({
      where: { reviewId, userId: user.id },
      select: { type: true }
    })

    return successResponse({
      reactions: reactions.map(r => r.type)
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return successResponse({ reactions: [] })
    }
    console.error('Error fetching reactions:', error)
    return errorResponse('Failed to fetch reactions', 500)
  }
}
