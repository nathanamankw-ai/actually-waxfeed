import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, requireAuth } from '@/lib/api-utils'

// GET /api/users/me - Get current user's profile and stats
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        country: true,
        socialLinks: true,
        waxBalance: true,
        waxScore: true,
        premiumWaxScore: true,
        lifetimeWaxEarned: true,
        isPremium: true,
        isVerified: true,
        role: true,
        currentStreak: true,
        longestStreak: true,
        lastReviewDate: true,
        createdAt: true,
        _count: {
          select: {
            reviews: true,
            lists: true,
            friendshipsAsUser1: true,
            friendshipsAsUser2: true,
          }
        }
      }
    })

    if (!userData) {
      return errorResponse('User not found', 404)
    }

    return successResponse({
      ...userData,
      // Combine friendship counts for total friends
      friendCount: (userData._count.friendshipsAsUser1 || 0) + (userData._count.friendshipsAsUser2 || 0),
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401)
    }
    console.error('Error fetching current user:', error)
    return errorResponse('Failed to fetch user data', 500)
  }
}
