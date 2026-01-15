import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { notFound } from "next/navigation"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { DefaultAvatar } from "@/components/default-avatar"
import { ChannelChat } from "./channel-chat"

export const dynamic = "force-dynamic"

async function getChannel(slug: string, userId: string | undefined) {
  const channel = await prisma.channel.findUnique({
    where: { slug },
    include: {
      members: {
        take: 20,
        orderBy: { joinedAt: "asc" },
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
      _count: {
        select: {
          members: true,
          messages: true,
        },
      },
    },
  })

  if (!channel) return null

  // Check if user is a member
  let isMember = false
  let membership = null
  if (userId) {
    membership = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId: channel.id,
          userId,
        },
      },
    })
    isMember = !!membership
  }

  // Get recent messages
  const messages = await prisma.channelMessage.findMany({
    where: {
      channelId: channel.id,
      isDeleted: false,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          image: true,
          isVerified: true,
        },
      },
      replyTo: {
        select: {
          id: true,
          content: true,
          user: {
            select: {
              username: true,
            },
          },
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

  return {
    ...channel,
    isMember,
    membership,
    messages: messages.reverse(), // Chronological order
  }
}

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await auth()
  const channel = await getChannel(slug, session?.user?.id)

  if (!channel) {
    notFound()
  }

  // Don't show private channel to non-members
  if (channel.type === "private" && !channel.isMember) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Private Channel</h1>
        <p className="text-gray-500">You need an invite to access this channel.</p>
        <Link
          href="/community"
          className="inline-block mt-4 text-sm text-gray-500 hover:text-black no-underline"
        >
          ← Back to Community
        </Link>
      </div>
    )
  }

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Link href="/community" className="text-sm text-gray-500 hover:text-black no-underline">
          ← Back to Community
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Chat Area */}
        <div className="lg:col-span-3">
          {/* Channel Header */}
          <div className="bg-gray-50 border border-gray-200 rounded-t-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getCategoryIcon(channel.category)}</span>
                <div>
                  <h1 className="text-xl font-bold">{channel.name}</h1>
                  {channel.description && (
                    <p className="text-sm text-gray-500">{channel.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {channel._count.members} members
                </span>
                {session && !channel.isMember && (
                  <JoinButton slug={channel.slug} />
                )}
                {session && channel.isMember && channel.membership?.role !== "owner" && (
                  <LeaveButton slug={channel.slug} />
                )}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="bg-gray-100 border-x border-b border-gray-200 rounded-b-lg" style={{ height: "60vh" }}>
            <ChannelChat
              channelId={channel.id}
              channelSlug={channel.slug}
              initialMessages={channel.messages.map((msg) => ({
                ...msg,
                metadata: msg.metadata as { albumId?: string; albumName?: string; artistName?: string; albumCover?: string } | null | undefined,
              }))}
              currentUserId={session?.user?.id}
              isMember={channel.isMember}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Members */}
          <div className="bg-gray-50 border border-gray-200  p-4">
            <h3 className="font-bold mb-3">Members ({channel._count.members})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {channel.members.map((member) => (
                <Link
                  key={member.user.id}
                  href={`/u/${member.user.username}`}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 transition-colors no-underline"
                >
                  {member.user.image ? (
                    <img src={member.user.image} alt="" className="w-8 h-8 " />
                  ) : (
                    <DefaultAvatar size="sm" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium truncate">{member.user.username}</span>
                      {member.user.isVerified && (
                        <svg className="w-3 h-3 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      )}
                    </div>
                    {member.role !== "member" && (
                      <span className="text-xs text-gray-500 capitalize">{member.role}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Channel Info */}
          <div className="bg-gray-50 border border-gray-200  p-4">
            <h3 className="font-bold mb-3">About</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Messages</span>
                <span>{channel._count.messages.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Type</span>
                <span className="capitalize">{channel.type}</span>
              </div>
              {channel.category && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Category</span>
                  <span className="capitalize">{channel.category}</span>
                </div>
              )}
            </div>
          </div>

          {/* Not logged in prompt */}
          {!session && (
            <div className="bg-gray-50 border border-gray-200  p-4 text-center">
              <p className="text-sm text-gray-500 mb-3">Sign in to join the conversation</p>
              <Link
                href="/login"
                className="inline-block bg-white text-black px-4 py-2 font-bold text-sm no-underline hover:bg-gray-100"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Client component for join button
function JoinButton({ slug }: { slug: string }) {
  return (
    <form action={`/api/channels/${slug}/join`} method="POST">
      <button
        type="submit"
        className="bg-white text-black px-4 py-2 font-bold text-sm hover:bg-gray-100"
      >
        Join Channel
      </button>
    </form>
  )
}

// Client component for leave button
function LeaveButton({ slug }: { slug: string }) {
  return (
    <form action={`/api/channels/${slug}/join`} method="DELETE">
      <button
        type="submit"
        className="border border-gray-300 text-gray-500 px-4 py-2 text-sm hover:text-black hover:border-white"
      >
        Leave
      </button>
    </form>
  )
}
