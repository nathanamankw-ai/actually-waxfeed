import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { DefaultAvatar } from "@/components/default-avatar"
import { VerifiedBadge } from "@/components/role-badge"
import { auth } from "@/lib/auth"

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

async function getUserFriends(userId: string) {
  // Get all friendships where user is either user1 or user2
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
    include: {
      user1: {
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
          isVerified: true,
          bio: true,
          _count: {
            select: { reviews: true },
          },
        },
      },
      user2: {
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
          isVerified: true,
          bio: true,
          _count: {
            select: { reviews: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // Extract the friend from each friendship (the other user)
  return friendships.map((f) => (f.user1Id === userId ? f.user2 : f.user1))
}

async function getMutualFriendsCount(userId: string, friendId: string) {
  // Get user's friends
  const userFriendships = await prisma.friendship.findMany({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
    select: { user1Id: true, user2Id: true },
  })
  const userFriendIds = new Set(
    userFriendships.map((f) => (f.user1Id === userId ? f.user2Id : f.user1Id))
  )

  // Get friend's friends
  const friendFriendships = await prisma.friendship.findMany({
    where: {
      OR: [{ user1Id: friendId }, { user2Id: friendId }],
    },
    select: { user1Id: true, user2Id: true },
  })
  const friendFriendIds = new Set(
    friendFriendships.map((f) => (f.user1Id === friendId ? f.user2Id : f.user1Id))
  )

  // Count mutual
  let mutual = 0
  userFriendIds.forEach((id) => {
    if (friendFriendIds.has(id)) mutual++
  })

  return mutual
}

export default async function UserFriendsPage({ params }: Props) {
  const { username } = await params
  const session = await auth()
  const user = await getUser(username)

  if (!user) {
    notFound()
  }

  const friends = await getUserFriends(user.id)

  // Get mutual friends count for each friend if viewing someone else's profile
  const friendsWithMutual = await Promise.all(
    friends.map(async (friend) => {
      let mutualCount = 0
      if (session?.user?.id && session.user.id !== user.id) {
        mutualCount = await getMutualFriendsCount(session.user.id, friend.id)
      }
      return { ...friend, mutualCount }
    })
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
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
            <p className="text-gray-500">{friends.length} {friends.length === 1 ? "friend" : "friends"}</p>
          </div>
        </div>
      </div>

      {/* Friends List */}
      {friends.length === 0 ? (
        <div className="text-center py-12 border border-gray-200">
          <p className="text-gray-500">No friends yet.</p>
          <p className="text-sm text-gray-400 mt-2">Friends will appear here once connections are made.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {friendsWithMutual.map((friend) => (
            <Link
              key={friend.id}
              href={`/u/${friend.username}`}
              className="flex items-center gap-4 p-4 border border-gray-200 hover:border-black transition-colors no-underline group"
            >
              {/* Avatar */}
              {friend.image ? (
                <img src={friend.image} alt="" className="w-14 h-14 border border-gray-300" />
              ) : (
                <DefaultAvatar size="md" className="w-14 h-14" />
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold group-hover:underline">@{friend.username}</span>
                  {friend.isVerified && <VerifiedBadge className="w-4 h-4" />}
                </div>
                {friend.name && <p className="text-sm text-gray-500">{friend.name}</p>}
                {friend.bio && (
                  <p className="text-sm text-gray-400 truncate mt-1">{friend.bio}</p>
                )}
              </div>

              {/* Stats */}
              <div className="text-right text-sm text-gray-500 flex-shrink-0">
                <div>{friend._count.reviews} reviews</div>
                {friend.mutualCount > 0 && (
                  <div className="text-xs text-gray-400">{friend.mutualCount} mutual</div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
