import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET /api/channels/[slug] - Get channel details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const session = await auth()

    const channel = await prisma.channel.findUnique({
      where: { slug },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },
        members: {
          take: 10,
          orderBy: { joinedAt: 'asc' },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            messages: true,
          },
        },
      },
    })

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
    }

    // Check if user is a member (for private channels)
    let isMember = false
    let membership = null
    if (session?.user?.id) {
      membership = await prisma.channelMember.findUnique({
        where: {
          channelId_userId: {
            channelId: channel.id,
            userId: session.user.id,
          },
        },
      })
      isMember = !!membership
    }

    // Don't show private channel details to non-members
    if (channel.type === 'private' && !isMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({
      ...channel,
      isMember,
      membership,
    })
  } catch (error) {
    console.error('Error fetching channel:', error)
    return NextResponse.json({ error: 'Failed to fetch channel' }, { status: 500 })
  }
}
