import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const createConversationSchema = z.object({
  participantIds: z.array(z.string()).min(1).max(24), // Max 25 including creator
  name: z.string().max(100).optional(), // For group chats
  initialMessage: z.string().min(1).max(2000).optional(),
})

// GET /api/messages - List user's conversations
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get user's conversations
    const participations = await prisma.dMParticipant.findMany({
      where: {
        userId: session.user.id,
        leftAt: null, // Not left
      },
      include: {
        conversation: {
          include: {
            participants: {
              where: { userId: { not: session.user.id } },
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
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: {
                id: true,
                content: true,
                createdAt: true,
                userId: true,
              },
            },
          },
        },
      },
      orderBy: {
        conversation: {
          updatedAt: 'desc',
        },
      },
      skip: offset,
      take: limit,
    })

    // Count unread messages for each conversation
    const conversations = await Promise.all(
      participations.map(async (p) => {
        const unreadCount = await prisma.directMessage.count({
          where: {
            conversationId: p.conversationId,
            createdAt: { gt: p.lastReadAt || new Date(0) },
            userId: { not: session.user.id },
          },
        })

        return {
          id: p.conversation.id,
          type: p.conversation.type,
          name: p.conversation.name,
          imageUrl: p.conversation.imageUrl,
          participants: p.conversation.participants.map((pp) => pp.user),
          lastMessage: p.conversation.messages[0] || null,
          unreadCount,
          isMuted: p.isMuted,
          updatedAt: p.conversation.updatedAt,
        }
      })
    )

    const total = await prisma.dMParticipant.count({
      where: {
        userId: session.user.id,
        leftAt: null,
      },
    })

    return NextResponse.json({
      conversations,
      pagination: {
        total,
        offset,
        limit,
        hasMore: offset + conversations.length < total,
      },
    })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}

// POST /api/messages - Create a new conversation or get existing one
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const validation = createConversationSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }

    const { participantIds, name, initialMessage } = validation.data

    // Add current user to participants
    const allParticipantIds = [...new Set([session.user.id, ...participantIds])]

    // Check if all participants exist
    const users = await prisma.user.findMany({
      where: { id: { in: allParticipantIds } },
      select: { id: true },
    })

    if (users.length !== allParticipantIds.length) {
      return NextResponse.json({ error: 'One or more users not found' }, { status: 404 })
    }

    // For 1:1 conversations, check if one already exists
    if (allParticipantIds.length === 2) {
      const existingConversation = await prisma.dMConversation.findFirst({
        where: {
          type: 'direct',
          AND: allParticipantIds.map((id) => ({
            participants: {
              some: { userId: id, leftAt: null },
            },
          })),
        },
        include: {
          participants: {
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
        },
      })

      if (existingConversation) {
        // If initial message provided, send it
        if (initialMessage) {
          await prisma.directMessage.create({
            data: {
              conversationId: existingConversation.id,
              userId: session.user.id,
              content: initialMessage,
            },
          })
          await prisma.dMConversation.update({
            where: { id: existingConversation.id },
            data: { updatedAt: new Date() },
          })
        }

        return NextResponse.json({
          conversation: existingConversation,
          isNew: false,
        })
      }
    }

    // Create new conversation
    const conversation = await prisma.dMConversation.create({
      data: {
        type: allParticipantIds.length === 2 ? 'direct' : 'group',
        name: allParticipantIds.length > 2 ? name : null,
        participants: {
          create: allParticipantIds.map((userId) => ({
            userId,
          })),
        },
      },
      include: {
        participants: {
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
      },
    })

    // Send initial message if provided
    if (initialMessage) {
      await prisma.directMessage.create({
        data: {
          conversationId: conversation.id,
          userId: session.user.id,
          content: initialMessage,
        },
      })
    }

    return NextResponse.json({
      conversation,
      isNew: true,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
  }
}
