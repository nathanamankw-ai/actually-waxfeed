import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { DefaultAvatar } from "@/components/default-avatar"

export const dynamic = "force-dynamic"

async function getConversations(userId: string) {
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
      const unreadCount = await prisma.directMessage.count({
        where: {
          conversationId: p.conversationId,
          createdAt: { gt: p.lastReadAt || new Date(0) },
          userId: { not: userId },
        },
      })

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
}

async function getFriends(userId: string) {
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
        },
      },
      user2: {
        select: {
          id: true,
          username: true,
          image: true,
          isVerified: true,
        },
      },
    },
  })

  return friendships.map((f) =>
    f.user1Id === userId ? f.user2 : f.user1
  )
}

export default async function MessagesPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/messages")
  }

  const [conversations, friends] = await Promise.all([
    getConversations(session.user.id),
    getFriends(session.user.id),
  ])

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 lg:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Messages</h1>
          {totalUnread > 0 && (
            <p className="text-sm text-[#888]">{totalUnread} unread message{totalUnread !== 1 ? "s" : ""}</p>
          )}
        </div>
        <Link
          href="/messages/new"
          className="flex items-center gap-2 bg-white text-black px-4 py-2 font-bold text-sm no-underline hover:bg-gray-100"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Message
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-2">
          <div className="bg-[#111] border border-[#222] rounded-lg overflow-hidden">
            {conversations.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#222] rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#666]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2">No conversations yet</h3>
                <p className="text-sm text-[#888] mb-4">Start a conversation with a friend</p>
                <Link
                  href="/messages/new"
                  className="inline-block bg-white text-black px-4 py-2 font-bold text-sm no-underline hover:bg-gray-100"
                >
                  Start Chatting
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#222]">
                {conversations.map((conv) => {
                  const otherUser = conv.participants[0]
                  const displayName = conv.type === "group" 
                    ? conv.name || conv.participants.map(p => p.username).join(", ")
                    : otherUser?.username || "Unknown"

                  return (
                    <Link
                      key={conv.id}
                      href={`/messages/${conv.id}`}
                      className="flex items-center gap-3 p-4 hover:bg-[#181818] transition-colors no-underline"
                    >
                      {/* Avatar */}
                      {conv.type === "group" ? (
                        <div className="w-12 h-12 rounded-full bg-[#222] flex items-center justify-center">
                          <svg className="w-6 h-6 text-[#888]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                      ) : otherUser?.image ? (
                        <img src={otherUser.image} alt="" className="w-12 h-12 rounded-full" />
                      ) : (
                        <DefaultAvatar size="md" />
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{displayName}</span>
                            {otherUser?.isVerified && (
                              <svg className="w-4 h-4 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                              </svg>
                            )}
                            {conv.unreadCount > 0 && (
                              <span className="bg-white text-black text-xs font-bold px-2 py-0.5 rounded-full">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                          {conv.lastMessage && (
                            <span className="text-xs text-[#666] flex-shrink-0">
                              {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                        {conv.lastMessage && (
                          <p className={`text-sm truncate mt-1 ${conv.unreadCount > 0 ? "text-white" : "text-[#888]"}`}>
                            {conv.lastMessage.userId === session.user.id ? "You: " : ""}
                            {conv.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Friends to message */}
        <div>
          <div className="bg-[#111] border border-[#222] rounded-lg p-4">
            <h3 className="font-bold mb-4">Friends</h3>
            {friends.length === 0 ? (
              <p className="text-sm text-[#888]">No friends yet. Add friends to start messaging!</p>
            ) : (
              <div className="space-y-2">
                {friends.slice(0, 10).map((friend) => (
                  <Link
                    key={friend.id}
                    href={`/messages/new?userId=${friend.id}`}
                    className="flex items-center gap-3 p-2 hover:bg-[#181818] rounded transition-colors no-underline"
                  >
                    {friend.image ? (
                      <img src={friend.image} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                      <DefaultAvatar size="sm" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium truncate">{friend.username}</span>
                        {friend.isVerified && (
                          <svg className="w-3 h-3 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-[#666]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-4 bg-[#111] border border-[#222] rounded-lg p-4">
            <h3 className="font-bold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link
                href="/community"
                className="flex items-center gap-2 p-2 hover:bg-[#181818] rounded transition-colors no-underline text-sm"
              >
                <span>📢</span>
                <span>Community Channels</span>
              </Link>
              <Link
                href="/live"
                className="flex items-center gap-2 p-2 hover:bg-[#181818] rounded transition-colors no-underline text-sm"
              >
                <span>🔴</span>
                <span>Live Events</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
