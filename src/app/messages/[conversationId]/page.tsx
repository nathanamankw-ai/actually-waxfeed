import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { DefaultAvatar } from "@/components/default-avatar"
import { ConversationChat } from "./conversation-chat"

export const dynamic = "force-dynamic"

async function getConversation(conversationId: string, userId: string) {
  try {
    // Check if user is a participant
    const participation = await prisma.dMParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    })

    if (!participation || participation.leftAt) {
      return null
    }

    // Get conversation with participants and messages
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
                lastSeenAt: true,
                isOnline: true,
              },
            },
          },
        },
      },
    })

    if (!conversation) {
      return null
    }

    // Get messages with replies
    const messages = await prisma.directMessage.findMany({
      where: {
        conversationId,
        isDeleted: false,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
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

    // Get user info for reply authors
    const replyUserIds = messages
      .filter(m => m.replyTo)
      .map(m => m.replyTo!.userId)
    
    const replyUsers = replyUserIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: replyUserIds } },
          select: { id: true, username: true },
        })
      : []

    const userMap = new Map(replyUsers.map(u => [u.id, u]))

    // Get user info for message authors
    const userIds = [...new Set(messages.map(m => m.userId))]
    const messageUsers = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        username: true,
        image: true,
        isVerified: true,
      },
    })
    const messageUserMap = new Map(messageUsers.map(u => [u.id, u]))

    // Update last read time
    await prisma.dMParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
      data: { lastReadAt: new Date() },
    })

    // Process messages with reactions
    const processedMessages = messages.reverse().map(m => {
      // Group reactions by emoji
      const reactionGroups = m.reactions.reduce((acc, r) => {
        if (!acc[r.emoji]) {
          acc[r.emoji] = { emoji: r.emoji, count: 0, userReacted: false }
        }
        acc[r.emoji].count++
        if (r.userId === userId) {
          acc[r.emoji].userReacted = true
        }
        return acc
      }, {} as Record<string, { emoji: string; count: number; userReacted: boolean }>)

      return {
        id: m.id,
        content: m.content,
        type: m.type,
        metadata: m.metadata as any,
        isEdited: m.isEdited,
        createdAt: m.createdAt,
        user: messageUserMap.get(m.userId) || {
          id: m.userId,
          username: "Unknown",
          image: null,
          isVerified: false,
        },
        replyToId: m.replyToId,
        replyTo: m.replyTo ? {
          id: m.replyTo.id,
          content: m.replyTo.content,
          user: userMap.get(m.replyTo.userId) || { username: "Unknown" },
        } : undefined,
        reactions: Object.values(reactionGroups),
      }
    })

    return {
      ...conversation,
      participants: conversation.participants.map((p) => ({
        ...p.user,
        lastSeenAt: p.user.lastSeenAt,
        isOnline: p.user.isOnline,
      })),
      messages: processedMessages,
    }
  } catch (error) {
    console.error("Error fetching conversation:", error)
    return null
  }
}

// Check if user is online (seen in last 5 minutes)
function isUserOnline(lastSeenAt: Date | null | undefined) {
  if (!lastSeenAt) return false
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  return new Date(lastSeenAt) > fiveMinutesAgo
}

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/messages")
  }

  const { conversationId } = await params
  const conversation = await getConversation(conversationId, session.user.id)

  if (!conversation) {
    notFound()
  }

  const otherParticipants = conversation.participants.filter(
    (p) => p.id !== session.user.id
  )
  const otherUser = otherParticipants[0]
  const displayName =
    conversation.type === "group"
      ? conversation.name || otherParticipants.map((p) => p.username).join(", ")
      : otherUser?.username || "Unknown"
  const online = otherUser ? isUserOnline(otherUser.lastSeenAt) : false

  return (
    <div className="flex flex-col h-full">
      {/* Conversation Header */}
      <div className="flex items-center gap-4 px-6 py-3 border-b-2 border-black bg-white">
        {/* Avatar with online indicator */}
        <div className="relative flex-shrink-0">
          {conversation.type === "group" ? (
            <div className="w-10 h-10 bg-gray-200 flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          ) : otherUser?.image ? (
            <img src={otherUser.image} alt="" className="w-10 h-10 object-cover" />
          ) : (
            <DefaultAvatar size="md" />
          )}
          {/* Online indicator */}
          {online && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {conversation.type === "direct" && otherUser ? (
              <Link
                href={`/u/${otherUser.username}`}
                className="font-bold hover:underline no-underline truncate"
              >
                {displayName}
              </Link>
            ) : (
              <span className="font-bold truncate">{displayName}</span>
            )}
            {otherUser?.isVerified && (
              <svg className="w-4 h-4 text-black flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            )}
          </div>
          {conversation.type === "group" ? (
            <p className="text-xs text-gray-500">
              {conversation.participants.length} members
            </p>
          ) : (
            <p className="text-xs text-gray-500">
              {online ? "Online" : otherUser?.lastSeenAt 
                ? `Last seen ${new Date(otherUser.lastSeenAt).toLocaleDateString()}`
                : "Offline"}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Search */}
          <button className="p-2 hover:bg-gray-100 transition-colors" title="Search messages">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Profile */}
          {conversation.type === "direct" && otherUser && (
            <Link
              href={`/u/${otherUser.username}`}
              className="p-2 hover:bg-gray-100 transition-colors no-underline"
              title="View Profile"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          )}

          {/* More options */}
          <button className="p-2 hover:bg-gray-100 transition-colors" title="More options">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <ConversationChat
        conversationId={conversation.id}
        initialMessages={conversation.messages}
        currentUserId={session.user.id}
        participants={conversation.participants}
      />
    </div>
  )
}
