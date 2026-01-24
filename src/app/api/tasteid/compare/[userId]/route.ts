import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { computeTasteMatch, getArchetypeInfo } from '@/lib/tasteid'

/**
 * GET /api/tasteid/compare/[userId]
 * Compare current user's taste with another user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return errorResponse('Authentication required', 401)
    }

    const { userId: otherUserId } = await params
    const currentUserId = session.user.id

    if (currentUserId === otherUserId) {
      return errorResponse('Cannot compare with yourself', 400)
    }

    // Get both TasteIDs with user info
    const [currentTaste, otherTaste] = await Promise.all([
      prisma.tasteID.findUnique({
        where: { userId: currentUserId },
        include: {
          user: {
            select: { id: true, username: true, name: true, image: true },
          },
        },
      }),
      prisma.tasteID.findUnique({
        where: { userId: otherUserId },
        include: {
          user: {
            select: { id: true, username: true, name: true, image: true },
          },
        },
      }),
    ])

    if (!currentTaste) {
      return errorResponse('Generate your TasteID first to compare', 400)
    }

    if (!otherTaste) {
      return errorResponse('This user has not generated their TasteID yet', 404)
    }

    // Compute or get cached match
    let match = await prisma.tasteMatch.findFirst({
      where: {
        OR: [
          { user1Id: currentUserId, user2Id: otherUserId },
          { user1Id: otherUserId, user2Id: currentUserId },
        ],
      },
    })

    // If match is stale (older than 24 hours) or doesn't exist, recompute
    const isStale = match && Date.now() - match.updatedAt.getTime() > 24 * 60 * 60 * 1000

    if (!match || isStale) {
      const computed = await computeTasteMatch(currentUserId, otherUserId)
      if (!computed) {
        return errorResponse('Could not compute taste match', 500)
      }

      match = await prisma.tasteMatch.upsert({
        where: {
          user1Id_user2Id: {
            user1Id: currentUserId,
            user2Id: otherUserId,
          },
        },
        create: {
          user1Id: currentUserId,
          user2Id: otherUserId,
          overallScore: computed.overallScore,
          genreOverlap: computed.genreOverlap,
          artistOverlap: computed.artistOverlap,
          ratingAlignment: computed.ratingAlignment,
          sharedGenres: computed.sharedGenres,
          sharedArtists: computed.sharedArtists,
          sharedAlbums: computed.sharedAlbums,
          matchType: computed.matchType,
        },
        update: {
          overallScore: computed.overallScore,
          genreOverlap: computed.genreOverlap,
          artistOverlap: computed.artistOverlap,
          ratingAlignment: computed.ratingAlignment,
          sharedGenres: computed.sharedGenres,
          sharedArtists: computed.sharedArtists,
          sharedAlbums: computed.sharedAlbums,
          matchType: computed.matchType,
        },
      })
    }

    // Get shared albums with details
    const sharedAlbumDetails = await prisma.album.findMany({
      where: { id: { in: match.sharedAlbums } },
      select: {
        id: true,
        title: true,
        artistName: true,
        coverArtUrlMedium: true,
      },
      take: 5,
    })

    const matchTypeDescriptions: Record<string, string> = {
      taste_twin: 'You two are taste twins! Almost identical preferences.',
      complementary: 'Complementary tastes - you could introduce each other to new music.',
      explorer_guide: 'One of you explores more - perfect for music recommendations.',
      genre_buddy: 'You share key genre interests.',
    }

    return successResponse({
      comparison: {
        overallScore: match.overallScore,
        matchType: match.matchType,
        matchDescription: matchTypeDescriptions[match.matchType] || 'You share musical interests.',

        breakdown: {
          genreOverlap: match.genreOverlap,
          artistOverlap: match.artistOverlap,
          ratingAlignment: match.ratingAlignment,
        },

        sharedGenres: match.sharedGenres,
        sharedArtists: match.sharedArtists,
        sharedAlbums: sharedAlbumDetails,

        users: {
          you: {
            id: currentTaste.user.id,
            username: currentTaste.user.username,
            name: currentTaste.user.name,
            image: currentTaste.user.image,
            archetype: getArchetypeInfo(currentTaste.primaryArchetype),
            topGenres: currentTaste.topGenres.slice(0, 5),
            adventurenessScore: currentTaste.adventurenessScore,
          },
          them: {
            id: otherTaste.user.id,
            username: otherTaste.user.username,
            name: otherTaste.user.name,
            image: otherTaste.user.image,
            archetype: getArchetypeInfo(otherTaste.primaryArchetype),
            topGenres: otherTaste.topGenres.slice(0, 5),
            adventurenessScore: otherTaste.adventurenessScore,
          },
        },
      },
    })
  } catch (error) {
    console.error('Error comparing TasteIDs:', error)
    return errorResponse('Failed to compare tastes', 500)
  }
}
