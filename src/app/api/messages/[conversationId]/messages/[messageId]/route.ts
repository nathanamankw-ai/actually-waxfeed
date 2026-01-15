import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const updateMessageSchema = z.object({
  content: z.string().min(1).max(2000),
})

// PATCH /api/messages/[conversationId]/messages/[messageId] - Edit a message
export async function PATCH(
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

    const validation = updateMessageSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }

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

    // Check if user owns this message
    if (message.userId !== session.user.id) {
      return NextResponse.json({ error: 'You can only edit your own messages' }, { status: 403 })
    }

    // Check if message is too old to edit (24 hours)
    const messageAge = Date.now() - new Date(message.createdAt).getTime()
    const maxEditAge = 24 * 60 * 60 * 1000 // 24 hours
    if (messageAge > maxEditAge) {
      return NextResponse.json({ error: 'Message is too old to edit' }, { status: 400 })
    }

    // Update the message
    const updated = await prisma.directMessage.update({
      where: { id: messageId },
      data: {
        content: validation.data.content,
        isEdited: true,
        updatedAt: new Date(),
      },
    })

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        image: true,
        isVerified: true,
      },
    })

    return NextResponse.json({
      id: updated.id,
      content: updated.content,
      type: updated.type,
      metadata: updated.metadata,
      isEdited: updated.isEdited,
      createdAt: updated.createdAt,
      user: user || { id: session.user.id, username: 'Unknown', image: null, isVerified: false },
      reactions: [],
    })
  } catch (error) {
    console.error('Error editing message:', error)
    return NextResponse.json({ error: 'Failed to edit message' }, { status: 500 })
  }
}

// DELETE /api/messages/[conversationId]/messages/[messageId] - Delete a message
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string; messageId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { conversationId, messageId } = await params

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

    // Check if user owns this message
    if (message.userId !== session.user.id) {
      return NextResponse.json({ error: 'You can only delete your own messages' }, { status: 403 })
    }

    // Soft delete the message
    await prisma.directMessage.update({
      where: { id: messageId },
      data: { isDeleted: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
  }
}
