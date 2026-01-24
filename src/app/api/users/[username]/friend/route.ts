import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, requireAuth, createNotification, isBlocked } from '@/lib/api-utils'

// Helper to get sorted user IDs for friendship lookup
function getSortedIds(id1: string, id2: string): [string, string] {
  return id1 < id2 ? [id1, id2] : [id2, id1]
}

// GET /api/users/[username]/friend - Get relationship status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const currentUser = await requireAuth()

    const targetUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true }
    })

    if (!targetUser) {
      return errorResponse('User not found', 404)
    }

    if (targetUser.id === currentUser.id) {
      return successResponse({ isSelf: true })
    }

    const [id1, id2] = getSortedIds(currentUser.id, targetUser.id)

    // Check friendship
    const friendship = await prisma.friendship.findUnique({
      where: { user1Id_user2Id: { user1Id: id1, user2Id: id2 } }
    })

    if (friendship) {
      return successResponse({
        status: 'friends',
        isFriend: true,
        hasPendingRequest: false,
        pendingRequestSentByMe: false
      })
    }

    // Check pending requests (both directions)
    const pendingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: currentUser.id, receiverId: targetUser.id, status: 'pending' },
          { senderId: targetUser.id, receiverId: currentUser.id, status: 'pending' }
        ]
      }
    })

    if (pendingRequest) {
      return successResponse({
        status: 'pending',
        isFriend: false,
        hasPendingRequest: true,
        pendingRequestSentByMe: pendingRequest.senderId === currentUser.id
      })
    }

    return successResponse({
      status: 'none',
      isFriend: false,
      hasPendingRequest: false,
      pendingRequestSentByMe: false
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401)
    }
    console.error('Error getting friend status:', error)
    return errorResponse('Failed to get friend status', 500)
  }
}

// POST /api/users/[username]/friend - Send request, accept, or reject
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const currentUser = await requireAuth()
    const body = await request.json().catch(() => ({}))
    const { action } = body // 'send', 'accept', 'reject'

    const targetUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true }
    })

    if (!targetUser) {
      return errorResponse('User not found', 404)
    }

    if (targetUser.id === currentUser.id) {
      return errorResponse('Cannot friend yourself', 400)
    }

    // Check if blocked (either direction)
    const [blockedByTarget, blockedTarget] = await Promise.all([
      isBlocked(targetUser.id, currentUser.id),
      isBlocked(currentUser.id, targetUser.id)
    ])

    if (blockedByTarget || blockedTarget) {
      return errorResponse('Cannot send friend request', 403)
    }

    const [id1, id2] = getSortedIds(currentUser.id, targetUser.id)

    // Check if already friends
    const existingFriendship = await prisma.friendship.findUnique({
      where: { user1Id_user2Id: { user1Id: id1, user2Id: id2 } }
    })

    if (existingFriendship) {
      return errorResponse('Already friends', 409)
    }

    // Handle accept action
    if (action === 'accept') {
      const incomingRequest = await prisma.friendRequest.findUnique({
        where: {
          senderId_receiverId: {
            senderId: targetUser.id,
            receiverId: currentUser.id
          }
        }
      })

      if (!incomingRequest || incomingRequest.status !== 'pending') {
        return errorResponse('No pending friend request to accept', 404)
      }

      // Create friendship and update request in transaction
      await prisma.$transaction([
        prisma.friendship.create({
          data: { user1Id: id1, user2Id: id2 }
        }),
        prisma.friendRequest.update({
          where: { id: incomingRequest.id },
          data: { status: 'accepted', respondedAt: new Date() }
        })
      ])

      // Notify the original sender that their request was accepted
      await createNotification(targetUser.id, 'friend_accept', {
        actorId: currentUser.id,
        actorName: currentUser.username || currentUser.name,
      })

      return successResponse({
        status: 'friends',
        message: 'Friend request accepted'
      })
    }

    // Handle reject action
    if (action === 'reject') {
      const incomingRequest = await prisma.friendRequest.findUnique({
        where: {
          senderId_receiverId: {
            senderId: targetUser.id,
            receiverId: currentUser.id
          }
        }
      })

      if (!incomingRequest || incomingRequest.status !== 'pending') {
        return errorResponse('No pending friend request to reject', 404)
      }

      await prisma.friendRequest.update({
        where: { id: incomingRequest.id },
        data: { status: 'rejected', respondedAt: new Date() }
      })

      return successResponse({
        status: 'rejected',
        message: 'Friend request rejected'
      })
    }

    // Default action: send friend request
    // Check for existing requests
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: currentUser.id, receiverId: targetUser.id },
          { senderId: targetUser.id, receiverId: currentUser.id }
        ]
      }
    })

    if (existingRequest) {
      // If they already sent us a pending request, auto-accept (mutual add)
      if (existingRequest.senderId === targetUser.id && existingRequest.status === 'pending') {
        await prisma.$transaction([
          prisma.friendship.create({
            data: { user1Id: id1, user2Id: id2 }
          }),
          prisma.friendRequest.update({
            where: { id: existingRequest.id },
            data: { status: 'accepted', respondedAt: new Date() }
          })
        ])

        await createNotification(targetUser.id, 'friend_accept', {
          actorId: currentUser.id,
          actorName: currentUser.username || currentUser.name,
        })

        return successResponse({
          status: 'friends',
          message: 'Friend request accepted (mutual add)'
        })
      }

      // If we sent a pending request already
      if (existingRequest.senderId === currentUser.id && existingRequest.status === 'pending') {
        return errorResponse('Friend request already sent', 409)
      }

      // If previously rejected, allow re-sending by updating the existing request
      if (existingRequest.status === 'rejected') {
        await prisma.friendRequest.update({
          where: { id: existingRequest.id },
          data: {
            senderId: currentUser.id,
            receiverId: targetUser.id,
            status: 'pending',
            respondedAt: null,
            createdAt: new Date()
          }
        })

        await createNotification(targetUser.id, 'friend_request', {
          actorId: currentUser.id,
          actorName: currentUser.username || currentUser.name,
        })

        return successResponse({
          status: 'pending',
          message: 'Friend request sent'
        })
      }
    }

    // Create new friend request
    await prisma.friendRequest.create({
      data: {
        senderId: currentUser.id,
        receiverId: targetUser.id,
      }
    })

    await createNotification(targetUser.id, 'friend_request', {
      actorId: currentUser.id,
      actorName: currentUser.username || currentUser.name,
    })

    return successResponse({
      status: 'pending',
      message: 'Friend request sent'
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401)
    }
    console.error('Error with friend request:', error)
    return errorResponse('Failed to process friend request', 500)
  }
}

// DELETE /api/users/[username]/friend - Unfriend or cancel request
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const currentUser = await requireAuth()

    const targetUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true }
    })

    if (!targetUser) {
      return errorResponse('User not found', 404)
    }

    const [id1, id2] = getSortedIds(currentUser.id, targetUser.id)

    // Try to remove friendship first
    const friendship = await prisma.friendship.findUnique({
      where: { user1Id_user2Id: { user1Id: id1, user2Id: id2 } }
    })

    if (friendship) {
      await prisma.friendship.delete({
        where: { id: friendship.id }
      })
      return successResponse({
        status: 'none',
        message: 'Unfriended successfully'
      })
    }

    // Try to cancel/decline pending request (either direction)
    const pendingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: currentUser.id, receiverId: targetUser.id, status: 'pending' },
          { senderId: targetUser.id, receiverId: currentUser.id, status: 'pending' }
        ]
      }
    })

    if (pendingRequest) {
      await prisma.friendRequest.delete({
        where: { id: pendingRequest.id }
      })

      const wasSentByMe = pendingRequest.senderId === currentUser.id
      return successResponse({
        status: 'none',
        message: wasSentByMe ? 'Friend request cancelled' : 'Friend request declined'
      })
    }

    return errorResponse('No friendship or pending request found', 404)
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401)
    }
    console.error('Error removing friend:', error)
    return errorResponse('Failed to process request', 500)
  }
}
