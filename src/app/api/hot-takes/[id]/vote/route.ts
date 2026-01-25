import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, requireAuth } from '@/lib/api-utils'
import { z } from 'zod'

const voteSchema = z.object({
  vote: z.enum(['agree', 'disagree']),
})

// POST /api/hot-takes/[id]/vote - Vote on a hot take
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await requireAuth()
    const body = await request.json()

    const parsed = voteSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 400)
    }

    const { vote } = parsed.data

    // Verify hot take exists
    const hotTake = await prisma.hotTake.findUnique({
      where: { id },
    })

    if (!hotTake) {
      return errorResponse('Hot take not found', 404)
    }

    // Check existing vote
    const existingVote = await prisma.hotTakeVote.findUnique({
      where: { hotTakeId_userId: { hotTakeId: id, userId: user.id } },
    })

    if (existingVote) {
      if (existingVote.vote === vote) {
        // Remove vote (toggle off)
        await prisma.hotTakeVote.delete({
          where: { id: existingVote.id },
        })

        // Update cached vote count
        await prisma.hotTake.update({
          where: { id },
          data: { voteCount: { decrement: 1 } },
        })

        return successResponse({ voted: false, vote: null })
      } else {
        // Change vote
        await prisma.hotTakeVote.update({
          where: { id: existingVote.id },
          data: { vote },
        })

        return successResponse({ voted: true, vote })
      }
    } else {
      // Create new vote
      await prisma.hotTakeVote.create({
        data: {
          hotTakeId: id,
          userId: user.id,
          vote,
        },
      })

      // Update cached vote count
      await prisma.hotTake.update({
        where: { id },
        data: { voteCount: { increment: 1 } },
      })

      return successResponse({ voted: true, vote })
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return errorResponse('Sign in to vote', 401)
    }
    console.error('Error voting on hot take:', error)
    return errorResponse('Failed to vote', 500)
  }
}
