import { NextRequest } from 'next/server'
import { successResponse, errorResponse, requireAuth } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'

// Minimum reviews to show in radar (approaching trend)
const RADAR_MIN = 50
const TRENDING_THRESHOLD = 100

// GET /api/trending-radar - Get albums approaching trending status
// SUBSCRIBERS ONLY
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    // Check subscription - only WAX_PLUS and WAX_PRO get access
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { subscriptionTier: true }
    })

    if (!userData || userData.subscriptionTier === 'FREE') {
      return errorResponse('Trending Radar requires Wax+ or Pro subscription', 403)
    }

    // Get albums between 50-99 reviews (approaching trending)
    const approachingTrend = await prisma.album.findMany({
      where: {
        totalReviews: {
          gte: RADAR_MIN,
          lt: TRENDING_THRESHOLD,
        },
        isTrending: false,
      },
      orderBy: { totalReviews: 'desc' },
      take: 30,
      select: {
        id: true,
        spotifyId: true,
        title: true,
        artistName: true,
        coverArtUrl: true,
        totalReviews: true,
        averageRating: true,
        releaseDate: true,
      }
    })

    // Check which albums the user has already reviewed
    const userReviews = await prisma.review.findMany({
      where: {
        userId: user.id,
        albumId: { in: approachingTrend.map(a => a.id) }
      },
      select: {
        albumId: true,
        reviewPosition: true,
      }
    })

    const reviewedMap = new Map(userReviews.map(r => [r.albumId, r.reviewPosition]))

    // Calculate opportunity for each album
    const radarAlbums = approachingTrend.map(album => {
      const userPosition = reviewedMap.get(album.id)
      const reviewsToTrend = TRENDING_THRESHOLD - album.totalReviews
      const nextPosition = album.totalReviews + 1
      
      // Determine what badge they'd get if they reviewed now
      let potentialBadge: 'GOLD' | 'SILVER' | 'BRONZE' | null = null
      if (nextPosition <= 10) potentialBadge = 'GOLD'
      else if (nextPosition <= 50) potentialBadge = 'SILVER'
      else if (nextPosition <= 100) potentialBadge = 'BRONZE'

      return {
        ...album,
        reviewsToTrend,
        progress: Math.round((album.totalReviews / TRENDING_THRESHOLD) * 100),
        userReviewed: !!userPosition,
        userPosition,
        nextPosition,
        potentialBadge,
        // Urgency scoring
        urgency: album.totalReviews >= 90 ? 'critical' : 
                 album.totalReviews >= 75 ? 'high' : 
                 album.totalReviews >= 60 ? 'medium' : 'low'
      }
    })

    // Sort by urgency (closest to trending first)
    radarAlbums.sort((a, b) => b.totalReviews - a.totalReviews)

    // Also get recently trended (for context)
    const recentlyTrended = await prisma.album.findMany({
      where: { 
        isTrending: true,
        trendedAt: { not: null }
      },
      orderBy: { trendedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        spotifyId: true,
        title: true,
        artistName: true,
        coverArtUrl: true,
        totalReviews: true,
        trendedAt: true,
      }
    })

    return successResponse({
      radar: radarAlbums,
      recentlyTrended,
      threshold: TRENDING_THRESHOLD,
    })

  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401)
    }
    console.error('Error getting trending radar:', error)
    return errorResponse('Failed to get trending radar', 500)
  }
}
