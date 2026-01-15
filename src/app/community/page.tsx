import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { DefaultAvatar } from "@/components/default-avatar"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Community",
  description: "Join music discussions, chat with fellow listeners, and connect with the WAXFEED community.",
  openGraph: {
    title: "Community | WAXFEED",
    description: "Join music discussions and connect with fellow listeners.",
  },
}

export const dynamic = "force-dynamic"

// Default channels to show (will be created if they don't exist)
const DEFAULT_CHANNELS = [
  { name: "Hip-Hop", slug: "hip-hop", category: "genre", description: "Discuss all things hip-hop and rap" },
  { name: "R&B", slug: "r-and-b", category: "genre", description: "R&B, soul, and neo-soul discussions" },
  { name: "Pop", slug: "pop", category: "genre", description: "Pop music conversations" },
  { name: "Rock", slug: "rock", category: "genre", description: "Rock, alternative, and indie rock" },
  { name: "Electronic", slug: "electronic", category: "genre", description: "EDM, house, techno, and electronic music" },
  { name: "New Releases", slug: "new-releases", category: "release", description: "Discuss the latest album drops" },
  { name: "360 Sound", slug: "360-sound", category: "event", description: "Live event discussions and updates" },
  { name: "HomeBRU", slug: "homebru", category: "show", description: "HomeBRU show companion chat" },
]

async function getChannels(userId: string | undefined) {
  try {
    // Get popular public channels
    const publicChannels = await prisma.channel.findMany({
      where: {
        type: "public",
        isArchived: false,
      },
      orderBy: { memberCount: "desc" },
      take: 12,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        category: true,
        memberCount: true,
        messageCount: true,
        imageUrl: true,
      },
    })

    // Get user's joined channels if logged in
    let userChannels: typeof publicChannels = []
    if (userId) {
      const memberships = await prisma.channelMember.findMany({
        where: { userId },
        include: {
          channel: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              category: true,
              memberCount: true,
              messageCount: true,
              imageUrl: true,
            },
          },
        },
        orderBy: { joinedAt: "desc" },
        take: 10,
      })
      userChannels = memberships.map(m => m.channel)
    }

    return { publicChannels, userChannels }
  } catch {
    return { publicChannels: [], userChannels: [] }
  }
}

async function getRecentActivity() {
  try {
    const messages = await prisma.channelMessage.findMany({
      where: {
        isDeleted: false,
        channel: {
          type: "public",
          isArchived: false,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5, // Reduced from 10 to 5
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },
        channel: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    })
    return messages
  } catch {
    return []
  }
}

async function getLiveEvents() {
  try {
    const now = new Date()
    return await prisma.liveEvent.findMany({
      where: {
        OR: [
          { status: "live" },
          {
            status: "scheduled",
            startTime: {
              gte: now,
              lte: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Next 24 hours
            },
          },
        ],
      },
      orderBy: { startTime: "asc" },
      take: 5,
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        status: true,
        startTime: true,
        attendeeCount: true,
        imageUrl: true,
      },
    })
  } catch {
    return []
  }
}

async function getDMConversations(userId: string | undefined) {
  if (!userId) return []
  
  try {
    const participations = await prisma.dMParticipant.findMany({
      where: { userId },
      select: {
        conversation: {
          select: {
            id: true,
            type: true,
            name: true,
            imageUrl: true,
            updatedAt: true,
            participants: {
              where: { userId: { not: userId } },
              select: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    image: true,
                  },
                },
              },
              take: 3, // Limit participants shown
            },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: {
                id: true,
                content: true,
                createdAt: true,
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
      take: 3, // Reduced from 5 to 3
    })
    
    return participations.map(p => ({
      ...p.conversation,
      otherParticipants: p.conversation.participants,
    }))
  } catch {
    return []
  }
}

export default async function CommunityPage() {
  const session = await auth()
  const { publicChannels, userChannels } = await getChannels(session?.user?.id)
  const recentActivity = await getRecentActivity()
  const liveEvents = await getLiveEvents()
  const dmConversations = session?.user?.id ? await getDMConversations(session.user.id) : []

  const getCategoryIcon = (category: string | null) => {
    switch (category) {
      case "genre": return "#"
      case "artist": return "#"
      case "event": return "#"
      case "show": return "#"
      case "release": return "#"
      default: return "#"
    }
  }

  const getEventStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return <span className="bg-red-500 text-white text-xs px-2 py-0.5  animate-pulse">LIVE</span>
      case "scheduled":
        return <span className="bg-yellow-500/20 text-yellow-500 text-xs px-2 py-0.5 ">Upcoming</span>
      default:
        return null
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Community</h1>
          <p className="text-gray-500 text-sm mt-1">Connect with music lovers worldwide</p>
        </div>
        {session && (
          <Link
            href="/messages"
            className="flex items-center gap-2 bg-white text-black px-4 py-2 font-bold text-sm no-underline hover:bg-gray-100"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Messages
          </Link>
        )}
      </div>

      {/* Live Events Banner */}
      {liveEvents.length > 0 && (
        <section className="mb-8 p-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 ">
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full  bg-red-400 opacity-75"></span>
              <span className="relative inline-flex  h-2 w-2 bg-red-500"></span>
            </span>
            <h2 className="font-bold">Live & Upcoming Events</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {liveEvents.map((event) => (
              <Link
                key={event.id}
                href={`/live/${event.slug}`}
                className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors no-underline"
              >
                {event.imageUrl ? (
                  <img src={event.imageUrl} alt="" className="w-12 h-12 object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 flex items-center justify-center text-2xl">
                    
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{event.name}</span>
                    {getEventStatusBadge(event.status)}
                  </div>
                  <p className="text-xs text-gray-500">
                    {event.status === "live" 
                      ? `${event.attendeeCount} watching`
                      : formatDistanceToNow(new Date(event.startTime), { addSuffix: true })
                    }
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Your Channels */}
          {session && userChannels.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Your Channels</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {userChannels.map((channel) => (
                  <Link
                    key={channel.id}
                    href={`/community/channel/${channel.slug}`}
                    className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors no-underline rounded"
                  >
                    <span className="text-2xl">{getCategoryIcon(channel.category)}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{channel.name}</h3>
                      <p className="text-xs text-gray-500">{channel.memberCount} members</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Browse Channels */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Popular Channels</h2>
              <Link href="/community/channels" className="text-sm text-gray-500 hover:text-black no-underline">
                Browse All →
              </Link>
            </div>
            {publicChannels.length === 0 ? (
              <div className="text-center py-12 border border-gray-200 rounded">
                <p className="text-gray-500 mb-2">No channels yet</p>
                <p className="text-xs text-gray-400">Channels are coming soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {publicChannels.map((channel) => (
                  <Link
                    key={channel.id}
                    href={`/community/channel/${channel.slug}`}
                    className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors no-underline rounded"
                  >
                    <span className="text-2xl">{getCategoryIcon(channel.category)}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{channel.name}</h3>
                      <p className="text-xs text-gray-500 truncate">{channel.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{channel.memberCount} members · {channel.messageCount} messages</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Show default channels if no channels exist */}
            {publicChannels.length === 0 && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DEFAULT_CHANNELS.map((channel) => (
                  <div
                    key={channel.slug}
                    className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 opacity-50"
                  >
                    <span className="text-2xl">{getCategoryIcon(channel.category)}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{channel.name}</h3>
                      <p className="text-xs text-gray-500 truncate">{channel.description}</p>
                      <p className="text-xs text-gray-400 mt-1">Coming soon</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent Activity */}
          <section>
            <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
            {recentActivity.length === 0 ? (
              <div className="text-center py-12 border border-gray-200 rounded">
                <p className="text-gray-500 mb-2">No activity yet</p>
                <p className="text-xs text-gray-400">Be the first to start a conversation!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((message) => (
                  <Link
                    key={message.id}
                    href={`/community/channel/${message.channel.slug}`}
                    className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors no-underline rounded"
                  >
                    {message.user.image ? (
                      <img src={message.user.image} alt="" className="w-8 h-8 " />
                    ) : (
                      <DefaultAvatar size="sm" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{message.user.username}</span>
                        <span className="text-gray-400">in</span>
                        <span className="text-gray-500">#{message.channel.name}</span>
                        <span className="text-gray-400 text-xs">
                          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-1">{message.content}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Direct Messages */}
          {session && (
            <section className="bg-gray-50 border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Direct Messages</h3>
                <Link href="/messages" className="text-xs text-gray-500 hover:text-black no-underline">
                  View All
                </Link>
              </div>
              {dmConversations.length === 0 ? (
                <p className="text-sm text-gray-500">No messages yet</p>
              ) : (
                <div className="space-y-3">
                  {dmConversations.map((conv) => {
                    const otherUser = conv.otherParticipants[0]?.user
                    const lastMessage = conv.messages[0]
                    return (
                      <Link
                        key={conv.id}
                        href={`/messages/${conv.id}`}
                        className="flex items-center gap-3 p-2 hover:bg-gray-100 transition-colors no-underline"
                      >
                        {otherUser?.image ? (
                          <img src={otherUser.image} alt="" className="w-8 h-8 " />
                        ) : (
                          <DefaultAvatar size="sm" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{otherUser?.username || "Unknown"}</p>
                          {lastMessage && (
                            <p className="text-xs text-gray-500 truncate">{lastMessage.content}</p>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </section>
          )}

          {/* Quick Links */}
          <section className="bg-gray-50 border border-gray-200 p-4">
            <h3 className="font-bold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link
                href="/community/channels"
                className="flex items-center gap-2 p-2 hover:bg-gray-100 transition-colors no-underline text-sm"
              >
                Browse All Channels
              </Link>
              <Link
                href="/live"
                className="flex items-center gap-2 p-2 hover:bg-gray-100 transition-colors no-underline text-sm"
              >
                Live Events
              </Link>
              <Link
                href="/trending"
                className="flex items-center gap-2 p-2 hover:bg-gray-100 transition-colors no-underline text-sm"
              >
                Trending Albums
              </Link>
              <Link
                href="/lists"
                className="flex items-center gap-2 p-2 hover:bg-gray-100 transition-colors no-underline text-sm"
              >
                Curated Lists
              </Link>
            </div>
          </section>

          {/* Sign In Prompt */}
          {!session && (
            <section className="bg-gray-50 border border-gray-200 p-4 text-center">
              <p className="text-sm text-gray-500 mb-3">Sign in to join channels and message other users</p>
              <Link
                href="/login"
                className="inline-block bg-black text-white px-4 py-2 font-bold text-sm no-underline hover:bg-gray-800"
              >
                Sign In
              </Link>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
