import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const sendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  type: z.enum(['text', 'album', 'album_share', 'review_share', 'list_share', 'image']).default('text'),
  metadata: z.record(z.unknown()).optional(),
  replyToId: z.string().optional(),
})

// GET /api/messages/[conversationId] - Get conversation messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { conversationId } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const before = searchParams.get('before')

    // Check if user is a participant
    const participation = await prisma.dMParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.user.id,
        },
      },
    })

    if (!participation || participation.leftAt) {
      return NextResponse.json({ error: 'Not a participant in this conversation' }, { status: 403 })
    }

    // Get conversation details
    const conversation = await prisma.dMConversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          where: { leftAt: null },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                image: true,
                isVerified: true,
              },
            },
          },
        },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Get messages
    const where: Record<string, unknown> = {
      conversationId,
      isDeleted: false,
    }

    if (before) {
      where.createdAt = { lt: new Date(before) }
    }

    const messages = await prisma.directMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        replyTo: {
          select: {
            id: true,
            content: true,
            userId: true,
          },
        },
        reactions: {
          select: {
            emoji: true,
            userId: true,
          },
        },
      },
    })

    // Get user info for message authors
    const userIds = [...new Set(messages.map(m => m.userId))]
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        username: true,
        image: true,
        isVerified: true,
      },
    })
    const userMap = new Map(users.map(u => [u.id, u]))

    // Get user info for reply authors
    const replyUserIds = messages.filter(m => m.replyTo).map(m => m.replyTo!.userId)
    const replyUsers = replyUserIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: replyUserIds } },
          select: { id: true, username: true },
        })
      : []
    const replyUserMap = new Map(replyUsers.map(u => [u.id, u]))

    // Process messages with reactions grouped
    const processedMessages = messages.map(m => {
      const reactionGroups = m.reactions.reduce((acc, r) => {
        if (!acc[r.emoji]) {
          acc[r.emoji] = { emoji: r.emoji, count: 0, userReacted: false }
        }
        acc[r.emoji].count++
        if (r.userId === session.user.id) {
          acc[r.emoji].userReacted = true
        }
        return acc
      }, {} as Record<string, { emoji: string; count: number; userReacted: boolean }>)

      return {
        id: m.id,
        content: m.content,
        type: m.type,
        metadata: m.metadata,
        isEdited: m.isEdited,
        createdAt: m.createdAt,
        user: userMap.get(m.userId) || { id: m.userId, username: 'Unknown', image: null, isVerified: false },
        replyToId: m.replyToId,
        replyTo: m.replyTo ? {
          id: m.replyTo.id,
          content: m.replyTo.content,
          user: replyUserMap.get(m.replyTo.userId) || { username: 'Unknown' },
        } : undefined,
        reactions: Object.values(reactionGroups),
      }
    })

    // Update last read time
    await prisma.dMParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.user.id,
        },
      },
      data: { lastReadAt: new Date() },
    })

    return NextResponse.json({
      conversation: {
        ...conversation,
        participants: conversation.participants.map((p) => p.user),
      },
      messages: processedMessages.reverse(), // Chronological order
      hasMore: messages.length === limit,
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// POST /api/messages/[conversationId] - Send a message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { conversationId } = await params
    const body = await request.json()

    const validation = sendMessageSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }

    const { content, type, metadata, replyToId } = validation.data

    // Check if user is a participant
    const participation = await prisma.dMParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.user.id,
        },
      },
    })

    if (!participation || participation.leftAt) {
      return NextResponse.json({ error: 'Not a participant in this conversation' }, { status: 403 })
    }

    // Create message
    const message = await prisma.directMessage.create({
      data: {
        conversationId,
        userId: session.user.id,
        content,
        type,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
        replyToId: replyToId || undefined,
      },
      include: {
        replyTo: {
          select: {
            id: true,
            content: true,
            userId: true,
          },
        },
      },
    })

    // Get the user info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        image: true,
        isVerified: true,
      },
    })

    // Get reply user info if needed
    let replyUser = null
    if (message.replyTo) {
      replyUser = await prisma.user.findUnique({
        where: { id: message.replyTo.userId },
        select: { id: true, username: true },
      })
    }

    const responseMessage = {
      id: message.id,
      content: message.content,
      type: message.type,
      metadata: message.metadata,
      isEdited: message.isEdited,
      createdAt: message.createdAt,
      user: user || { id: session.user.id, username: 'Unknown', image: null, isVerified: false },
      replyToId: message.replyToId,
      replyTo: message.replyTo ? {
        id: message.replyTo.id,
        content: message.replyTo.content,
        user: replyUser || { username: 'Unknown' },
      } : undefined,
      reactions: [],
    }

    // Update conversation timestamp
    await prisma.dMConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })

    // Update sender's last read time
    await prisma.dMParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.user.id,
        },
      },
      data: { lastReadAt: new Date() },
    })

    // TODO: Send push notifications to other participants

    return NextResponse.json(responseMessage, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
