import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { DefaultAvatar } from "@/components/default-avatar"

export const dynamic = "force-dynamic"

async function getConversations(userId: string) {
  try {
    const participations = await prisma.dMParticipant.findMany({
      where: {
        userId,
        leftAt: null,
      },
      include: {
        conversation: {
          include: {
            participants: {
              where: { userId: { not: userId } },
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
            messages: {
              orderBy: { createdAt: "desc" },
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
          updatedAt: "desc",
        },
      },
    })

    // Calculate unread counts
    const conversations = await Promise.all(
      participations.map(async (p) => {
        let unreadCount = 0
        try {
          unreadCount = await prisma.directMessage.count({
            where: {
              conversationId: p.conversationId,
              createdAt: { gt: p.lastReadAt || new Date(0) },
              userId: { not: userId },
            },
          })
        } catch {
          // Model might not exist yet
        }

        return {
          id: p.conversation.id,
          type: p.conversation.type,
          name: p.conversation.name,
          participants: p.conversation.participants.map((pp) => pp.user),
          lastMessage: p.conversation.messages[0] || null,
          unreadCount,
          updatedAt: p.conversation.updatedAt,
        }
      })
    )

    return conversations
  } catch {
    return []
  }
}

async function getFriends(userId: string) {
  try {
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            image: true,
            isVerified: true,
            lastSeenAt: true,
            isOnline: true,
          },
        },
        user2: {
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
    })

    return friendships.map((f) =>
      f.user1Id === userId ? f.user2 : f.user1
    )
  } catch {
    return []
  }
}

export default async function MessagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/messages")
  }

  const [conversations, friends] = await Promise.all([
    getConversations(session.user.id),
    getFriends(session.user.id),
  ])

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  // Check if user is online (seen in last 5 minutes)
  const isUserOnline = (lastSeenAt: Date | null) => {
    if (!lastSeenAt) return false
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    return new Date(lastSeenAt) > fiveMinutesAgo
  }

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Sidebar - Conversation List */}
      <div className="w-80 border-r-2 border-black flex flex-col bg-gray-50">
        {/* Header */}
        <div className="p-4 border-b-2 border-black">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-bold tracking-tight">"MESSAGES"</h1>
            {totalUnread > 0 && (
              <span className="bg-black text-white text-xs font-bold px-2 py-0.5">
                {totalUnread}
              </span>
            )}
          </div>
          <Link
            href="/messages/new"
            className="flex items-center justify-center gap-2 w-full bg-black text-white px-4 py-2 text-sm font-bold no-underline hover:bg-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            NEW MESSAGE
          </Link>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500">No conversations yet</p>
              <p className="text-xs text-gray-400 mt-1">Start a conversation with a friend</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {conversations.map((conv) => {
                const otherUser = conv.participants[0]
                const displayName = conv.type === "group"
                  ? conv.name || conv.participants.map(p => p.username).join(", ")
                  : otherUser?.username || "Unknown"
                const online = otherUser ? isUserOnline(otherUser.lastSeenAt) : false

                return (
                  <Link
                    key={conv.id}
                    href={`/messages/${conv.id}`}
                    className="flex items-center gap-3 p-3 hover:bg-gray-100 transition-colors no-underline"
                  >
                    {/* Avatar with online indicator */}
                    <div className="relative flex-shrink-0">
                      {conv.type === "group" ? (
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
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-gray-50 rounded-full" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`text-sm truncate ${conv.unreadCount > 0 ? "font-bold" : "font-medium"}`}>
                            {displayName}
                          </span>
                          {otherUser?.isVerified && (
                            <svg className="w-3.5 h-3.5 text-black flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                          )}
                        </div>
                        {conv.lastMessage && (
                          <span className="text-[10px] text-gray-400 flex-shrink-0">
                            {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: false })}
                          </span>
                        )}
                      </div>
                      {conv.lastMessage && (
                        <p className={`text-xs truncate mt-0.5 ${conv.unreadCount > 0 ? "text-black" : "text-gray-500"}`}>
                          {conv.lastMessage.userId === session.user.id ? "You: " : ""}
                          {conv.lastMessage.content}
                        </p>
                      )}
                    </div>

                    {/* Unread badge */}
                    {conv.unreadCount > 0 && (
                      <div className="w-5 h-5 bg-black text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Friends Quick Access */}
        <div className="border-t-2 border-black p-3">
          <p className="text-[10px] tracking-[0.2em] text-gray-500 mb-2">"FRIENDS"</p>
          <div className="flex flex-wrap gap-2">
            {friends.slice(0, 6).map((friend) => {
              const online = isUserOnline(friend.lastSeenAt)
              return (
                <Link
                  key={friend.id}
                  href={`/messages/new?userId=${friend.id}`}
                  className="relative group"
                  title={friend.username || ""}
                >
                  {friend.image ? (
                    <img src={friend.image} alt="" className="w-8 h-8 object-cover group-hover:ring-2 ring-black" />
                  ) : (
                    <DefaultAvatar size="sm" />
                  )}
                  {online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-gray-50 rounded-full" />
                  )}
                </Link>
              )
            })}
            {friends.length > 6 && (
              <div className="w-8 h-8 bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                +{friends.length - 6}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  )
}
