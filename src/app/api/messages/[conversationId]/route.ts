import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const sendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  type: z.enum(['text', 'album_share', 'review_share', 'list_share', 'image']).default('text'),
  metadata: z.record(z.unknown()).optional(),
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
        user: {
          select: {
            id: true,
            username: true,
            image: true,
            isVerified: true,
          },
        },
      },
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
      messages: messages.reverse(), // Chronological order
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

    const { content, type, metadata } = validation.data

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
      },
    })

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

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
