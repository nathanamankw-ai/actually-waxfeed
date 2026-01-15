import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

// Simple in-memory store for typing indicators
// In production, use Redis or a real-time service
const typingUsers = new Map<string, Map<string, { username: string; expiresAt: number }>>()

// Clean up expired typing indicators
function cleanupExpired(conversationId: string) {
  const convTyping = typingUsers.get(conversationId)
  if (!convTyping) return

  const now = Date.now()
  for (const [userId, data] of convTyping) {
    if (data.expiresAt < now) {
      convTyping.delete(userId)
    }
  }

  if (convTyping.size === 0) {
    typingUsers.delete(conversationId)
  }
}

// POST /api/messages/[conversationId]/typing - Set typing status
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session?.user?.name) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { conversationId } = await params

    // Get or create conversation typing map
    if (!typingUsers.has(conversationId)) {
      typingUsers.set(conversationId, new Map())
    }

    const convTyping = typingUsers.get(conversationId)!
    
    // Set typing with 4 second expiry
    convTyping.set(session.user.id, {
      username: session.user.name,
      expiresAt: Date.now() + 4000,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error setting typing status:', error)
    return NextResponse.json({ error: 'Failed to set typing status' }, { status: 500 })
  }
}

// GET /api/messages/[conversationId]/typing - Get users currently typing
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

    // Clean up expired typing indicators
    cleanupExpired(conversationId)

    const convTyping = typingUsers.get(conversationId)
    if (!convTyping) {
      return NextResponse.json({ typing: [] })
    }

    // Get usernames of currently typing users (excluding current user)
    const typing: string[] = []
    for (const [userId, data] of convTyping) {
      if (userId !== session.user.id) {
        typing.push(data.username)
      }
    }

    return NextResponse.json({ typing })
  } catch (error) {
    console.error('Error getting typing status:', error)
    return NextResponse.json({ error: 'Failed to get typing status' }, { status: 500 })
  }
}

// DELETE /api/messages/[conversationId]/typing - Clear typing status
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { conversationId } = await params

    const convTyping = typingUsers.get(conversationId)
    if (convTyping) {
      convTyping.delete(session.user.id)
      if (convTyping.size === 0) {
        typingUsers.delete(conversationId)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error clearing typing status:', error)
    return NextResponse.json({ error: 'Failed to clear typing status' }, { status: 500 })
  }
}
