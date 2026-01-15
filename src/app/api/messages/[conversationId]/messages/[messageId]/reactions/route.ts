import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const reactionSchema = z.object({
  emoji: z.string().min(1).max(10),
})

// POST /api/messages/[conversationId]/messages/[messageId]/reactions - Toggle reaction
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string; messageId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { conversationId, messageId } = await params
    const body = await request.json()

    const validation = reactionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }

    const { emoji } = validation.data

    // Find the message
    const message = await prisma.directMessage.findUnique({
      where: { id: messageId },
    })

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    if (message.conversationId !== conversationId) {
      return NextResponse.json({ error: 'Message not in this conversation' }, { status: 400 })
    }

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

    // Check if reaction already exists
    const existingReaction = await prisma.directMessageReaction.findUnique({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId: session.user.id,
          emoji,
        },
      },
    })

    if (existingReaction) {
      // Remove reaction (toggle off)
      await prisma.directMessageReaction.delete({
        where: { id: existingReaction.id },
      })
      return NextResponse.json({ action: 'removed', emoji })
    } else {
      // Add reaction (toggle on)
      await prisma.directMessageReaction.create({
        data: {
          messageId,
          userId: session.user.id,
          emoji,
        },
      })
      return NextResponse.json({ action: 'added', emoji })
    }
  } catch (error) {
    console.error('Error toggling reaction:', error)
    return NextResponse.json({ error: 'Failed to toggle reaction' }, { status: 500 })
  }
}

// GET /api/messages/[conversationId]/messages/[messageId]/reactions - Get reactions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string; messageId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { messageId } = await params

    const reactions = await prisma.directMessageReaction.findMany({
      where: { messageId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },
      },
    })

    // Group by emoji
    const grouped = reactions.reduce((acc, r) => {
      if (!acc[r.emoji]) {
        acc[r.emoji] = {
          emoji: r.emoji,
          count: 0,
          users: [],
          userReacted: false,
        }
      }
      acc[r.emoji].count++
      acc[r.emoji].users.push(r.user)
      if (r.userId === session.user.id) {
        acc[r.emoji].userReacted = true
      }
      return acc
    }, {} as Record<string, { emoji: string; count: number; users: any[]; userReacted: boolean }>)

    return NextResponse.json(Object.values(grouped))
  } catch (error) {
    console.error('Error fetching reactions:', error)
    return NextResponse.json({ error: 'Failed to fetch reactions' }, { status: 500 })
  }
}
