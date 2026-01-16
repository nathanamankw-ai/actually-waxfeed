import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, requireAuth } from '@/lib/api-utils'
import { z } from 'zod'

const createHotTakeSchema = z.object({
  albumId: z.string().min(1),
  stance: z.enum(['OVERRATED', 'UNDERRATED', 'MASTERPIECE', 'TRASH', 'AHEAD_OF_TIME', 'DATED']),
  content: z.string().min(10).max(280),
})

// GET /api/hot-takes - List hot takes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sort = searchParams.get('sort') || 'trending'
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'))

    let orderBy: object
    switch (sort) {
      case 'recent':
        orderBy = { createdAt: 'desc' }
        break
      case 'heated':
        orderBy = { voteCount: 'desc' }
        break
      default: // trending
        orderBy = [
          { voteCount: 'desc' },
          { createdAt: 'desc' },
        ]
    }

    const hotTakes = await prisma.hotTake.findMany({
      orderBy,
      take: limit,
      include: {
        album: {
          select: {
            id: true,
            spotifyId: true,
            title: true,
            artistName: true,
            coverArtUrl: true,
          },
        },
        author: {
          select: {
            id: true,
            username: true,
          },
        },
        _count: {
          select: {
            votes: true,
            arguments: true,
          },
        },
      },
    })

    return successResponse({ hotTakes })
  } catch (error) {
    console.error('Error fetching hot takes:', error)
    return errorResponse('Failed to fetch hot takes', 500)
  }
}

// POST /api/hot-takes - Create a new hot take
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const parsed = createHotTakeSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 400)
    }

    const { albumId, stance, content } = parsed.data

    // Verify album exists
    const album = await prisma.album.findUnique({
      where: { id: albumId },
    })

    if (!album) {
      return errorResponse('Album not found', 404)
    }

    // Check if user already has a hot take for this album
    const existingTake = await prisma.hotTake.findFirst({
      where: {
        albumId,
        authorId: user.id,
      },
    })

    if (existingTake) {
      return errorResponse('You already have a hot take for this album', 400)
    }

    // Create the hot take
    const hotTake = await prisma.hotTake.create({
      data: {
        albumId,
        authorId: user.id,
        stance,
        content,
      },
      include: {
        album: {
          select: {
            id: true,
            spotifyId: true,
            title: true,
            artistName: true,
            coverArtUrl: true,
          },
        },
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    })

    return successResponse({ id: hotTake.id, hotTake }, 201)
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return errorResponse('Sign in to post a hot take', 401)
    }
    console.error('Error creating hot take:', error)
    return errorResponse('Failed to create hot take', 500)
  }
}
