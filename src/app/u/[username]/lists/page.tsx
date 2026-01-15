import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { DefaultAvatar } from "@/components/default-avatar"
import { VerifiedBadge } from "@/components/role-badge"
import { format } from "date-fns"

interface Props {
  params: Promise<{ username: string }>
}

async function getUser(username: string) {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
      isVerified: true,
    },
  })
}

async function getUserLists(userId: string) {
  return prisma.list.findMany({
    where: { userId, isPublic: true },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        take: 4,
        orderBy: { position: "asc" },
        include: {
          album: {
            select: {
              id: true,
              title: true,
              artistName: true,
              coverArtUrl: true,
              coverArtUrlMedium: true,
            },
          },
        },
      },
      _count: {
        select: { items: true, likes: true },
      },
    },
  })
}

export default async function UserListsPage({ params }: Props) {
  const { username } = await params
  const user = await getUser(username)

  if (!user) {
    notFound()
  }

  const lists = await getUserLists(user.id)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/u/${user.username}`}
          className="text-sm text-gray-500 hover:text-black no-underline mb-4 inline-block"
        >
          ← Back to profile
        </Link>

        <div className="flex items-center gap-4">
          {user.image ? (
            <img src={user.image} alt="" className="w-12 h-12 border border-gray-300" />
          ) : (
            <DefaultAvatar size="md" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">@{user.username}</h1>
              {user.isVerified && <VerifiedBadge className="w-5 h-5" />}
            </div>
            <p className="text-gray-500">{lists.length} {lists.length === 1 ? "list" : "lists"}</p>
          </div>
        </div>
      </div>

      {/* Lists Grid */}
      {lists.length === 0 ? (
        <div className="text-center py-12 border border-gray-200">
          <p className="text-gray-500">No public lists yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lists.map((list) => (
            <Link
              key={list.id}
              href={`/list/${list.id}`}
              className="block border border-gray-200 p-5 hover:border-black transition-colors no-underline group"
            >
              {/* List Cover - Album Grid */}
              <div className="grid grid-cols-2 gap-1 mb-4 aspect-square max-w-[200px]">
                {list.items.slice(0, 4).map((item, i) => (
                  <div key={i} className="aspect-square bg-gray-100">
                    {item.album.coverArtUrlMedium || item.album.coverArtUrl ? (
                      <img
                        src={item.album.coverArtUrlMedium || item.album.coverArtUrl || ""}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No Cover
                      </div>
                    )}
                  </div>
                ))}
                {/* Fill empty slots */}
                {Array.from({ length: Math.max(0, 4 - list.items.length) }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square bg-gray-100" />
                ))}
              </div>

              {/* List Info */}
              <h3 className="font-bold text-lg mb-1 group-hover:underline">{list.title}</h3>
              {list.description && (
                <p className="text-sm text-gray-500 mb-2 line-clamp-2">{list.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{list._count.items} albums</span>
                <span>{list._count.likes} likes</span>
                <span>{format(new Date(list.createdAt), "MMM d, yyyy")}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
