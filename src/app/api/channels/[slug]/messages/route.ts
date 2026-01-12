import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import { checkRateLimit, getClientIp, rateLimits, rateLimitResponse } from '@/lib/rate-limit'

const createMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  type: z.enum(['text', 'album_share', 'review_share', 'list_share', 'image']).default('text'),
  metadata: z.record(z.unknown()).optional(),
  replyToId: z.string().optional(),
})

// GET /api/channels/[slug]/messages - Get channel messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const before = searchParams.get('before') // cursor for pagination

    // Get channel
    const channel = await prisma.channel.findUnique({
      where: { slug },
      select: { id: true, type: true },
    })

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
    }

    // Check membership for private channels
    if (channel.type === 'private') {
      const session = await auth()
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }

      const membership = await prisma.channelMember.findUnique({
        where: {
          channelId_userId: {
            channelId: channel.id,
            userId: session.user.id,
          },
        },
      })

      if (!membership) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    const where: Record<string, unknown> = {
      channelId: channel.id,
      isDeleted: false,
    }

    if (before) {
      where.createdAt = { lt: new Date(before) }
    }

    const messages = await prisma.channelMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            image: true,
            isVerified: true,
          },
        },
        replyTo: {
          select: {
            id: true,
            content: true,
            user: {
              select: {
                username: true,
              },
            },
          },
        },
        reactions: {
          select: {
            emoji: true,
            userId: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    })

    // Group reactions by emoji
    const messagesWithGroupedReactions = messages.map(msg => ({
      ...msg,
      reactionCounts: msg.reactions.reduce((acc, r) => {
        acc[r.emoji] = (acc[r.emoji] || 0) + 1
        return acc
      }, {} as Record<string, number>),
    }))

    return NextResponse.json({
      messages: messagesWithGroupedReactions.reverse(), // Return in chronological order
      hasMore: messages.length === limit,
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// POST /api/channels/[slug]/messages - Send a message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Rate limit: 30 messages per minute per user
    const rateLimit = checkRateLimit(session.user.id, { name: 'chat-messages', ...rateLimits.chat })
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetAt)
    }

    const { slug } = await params
    const body = await request.json()
    
    const validation = createMessageSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }

    const { content, type, metadata, replyToId } = validation.data

    // Get channel
    const channel = await prisma.channel.findUnique({
      where: { slug },
      select: { id: true, type: true },
    })

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
    }

    // Check if user is a member
    const membership = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId: channel.id,
          userId: session.user.id,
        },
      },
    })

    // For public channels, auto-join if not a member
    if (!membership && channel.type === 'public') {
      await prisma.$transaction([
        prisma.channelMember.create({
          data: {
            channelId: channel.id,
            userId: session.user.id,
            role: 'member',
          },
        }),
        prisma.channel.update({
          where: { id: channel.id },
          data: { memberCount: { increment: 1 } },
        }),
      ])
    } else if (!membership) {
      return NextResponse.json({ error: 'You must be a member to send messages' }, { status: 403 })
    }

    // Check if user is muted
    if (membership?.mutedUntil && new Date(membership.mutedUntil) > new Date()) {
      return NextResponse.json({ error: 'You are muted in this channel' }, { status: 403 })
    }

    // Create message
    const message = await prisma.channelMessage.create({
      data: {
        channelId: channel.id,
        userId: session.user.id,
        content,
        type,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
        replyToId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            image: true,
            isVerified: true,
          },
        },
        replyTo: {
          select: {
            id: true,
            content: true,
            user: {
              select: {
                username: true,
              },
            },
          },
        },
      },
    })

    // Update channel message count
    await prisma.channel.update({
      where: { id: channel.id },
      data: { messageCount: { increment: 1 } },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
