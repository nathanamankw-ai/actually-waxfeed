import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import Link from "next/link"

export const dynamic = "force-dynamic"

const CATEGORIES = [
  { value: "all", label: "All Channels", icon: "#" },
  { value: "genre", label: "Genre", icon: "#" },
  { value: "artist", label: "Artist", icon: "#" },
  { value: "event", label: "Events", icon: "#" },
  { value: "show", label: "Shows", icon: "#" },
  { value: "release", label: "Releases", icon: "#" },
]

async function getChannels(category: string | null) {
  try {
    const where: Record<string, unknown> = {
      type: "public",
      isArchived: false,
    }

    if (category && category !== "all") {
      where.category = category
    }

    return await prisma.channel.findMany({
      where,
      orderBy: { memberCount: "desc" },
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
  } catch {
    return []
  }
}

async function getUserChannels(userId: string | undefined) {
  if (!userId) return []
  
  try {
    const memberships = await prisma.channelMember.findMany({
      where: { userId },
      select: { channelId: true },
    })
    return memberships.map(m => m.channelId)
  } catch {
    return []
  }
}

export default async function ChannelsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const session = await auth()
  const channels = await getChannels(category || null)
  const userChannelIds = await getUserChannels(session?.user?.id)

  const getCategoryIcon = (cat: string | null) => {
    const found = CATEGORIES.find(c => c.value === cat)
    return found?.icon || "#"
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/community" className="text-sm text-gray-500 hover:text-black no-underline">
          ← Back to Community
        </Link>
        <h1 className="text-2xl lg:text-3xl font-bold mt-4">Browse Channels</h1>
        <p className="text-gray-500 text-sm mt-1">Find communities that match your interests</p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.value}
            href={cat.value === "all" ? "/community/channels" : `/community/channels?category=${cat.value}`}
            className={`flex items-center gap-2 px-4 py-2  text-sm no-underline transition-colors ${
              (category === cat.value || (!category && cat.value === "all"))
                ? "bg-white text-black"
                : "bg-gray-50 border border-gray-300 hover:border-[#555]"
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </Link>
        ))}
      </div>

      {/* Channels Grid */}
      {channels.length === 0 ? (
        <div className="text-center py-12 border border-gray-200 ">
          <p className="text-gray-500 mb-2">No channels found</p>
          <p className="text-sm text-gray-400">Try selecting a different category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels.map((channel) => {
            const isJoined = userChannelIds.includes(channel.id)
            
            return (
              <Link
                key={channel.id}
                href={`/community/channel/${channel.slug}`}
                className="flex flex-col p-4 bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors no-underline "
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl">{getCategoryIcon(channel.category)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold truncate">{channel.name}</h3>
                      {isJoined && (
                        <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded">
                          Joined
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{channel.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400 mt-auto pt-3 border-t border-gray-200">
                  <span>{channel.memberCount.toLocaleString()} members</span>
                  <span>{channel.messageCount.toLocaleString()} messages</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Create Channel CTA */}
      {session && (
        <div className="mt-8 p-6 bg-gray-50 border border-gray-200  text-center">
          <h3 className="font-bold mb-2">Can&apos;t find what you&apos;re looking for?</h3>
          <p className="text-sm text-gray-500 mb-4">Create your own channel and build a community</p>
          <Link
            href="/community/channels/new"
            className="inline-block bg-white text-black px-6 py-2 font-bold text-sm no-underline hover:bg-gray-100"
          >
            Create Channel
          </Link>
        </div>
      )}
    </div>
  )
}
