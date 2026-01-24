import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { DefaultAvatar } from "@/components/default-avatar"
import { FriendRequestActions } from "./friend-request-actions"

async function getFriendsData(userId: string) {
  // Get all friendships
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { user1Id: userId },
        { user2Id: userId }
      ]
    },
    include: {
      user1: {
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
          isVerified: true,
        }
      },
      user2: {
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
          isVerified: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Get pending friend requests (received)
  const incomingRequests = await prisma.friendRequest.findMany({
    where: {
      receiverId: userId,
      status: 'pending'
    },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
          isVerified: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Get pending friend requests (sent)
  const outgoingRequests = await prisma.friendRequest.findMany({
    where: {
      senderId: userId,
      status: 'pending'
    },
    include: {
      receiver: {
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
          isVerified: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Extract friend users from friendships
  const friends = friendships.map(f =>
    f.user1Id === userId ? f.user2 : f.user1
  )

  return {
    friends,
    incomingRequests: incomingRequests.map(r => ({
      id: r.id,
      user: r.sender,
      createdAt: r.createdAt
    })),
    outgoingRequests: outgoingRequests.map(r => ({
      id: r.id,
      user: r.receiver,
      createdAt: r.createdAt
    }))
  }
}

export default async function FriendsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const { friends, incomingRequests, outgoingRequests } = await getFriendsData(session.user.id)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Friends</h1>

      {/* Incoming Requests */}
      {incomingRequests.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4">
            Friend Requests ({incomingRequests.length})
          </h2>
          <div className="space-y-3">
            {incomingRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 border"
                style={{ borderColor: 'var(--border)' }}
              >
                <Link
                  href={`/u/${request.user.username}`}
                  className="flex items-center gap-3 no-underline hover:opacity-80"
                >
                  {request.user.image ? (
                    <img
                      src={request.user.image}
                      alt=""
                      className="w-10 h-10 object-cover"
                    />
                  ) : (
                    <DefaultAvatar size="sm" className="w-10 h-10" />
                  )}
                  <div>
                    <p className="font-bold">@{request.user.username}</p>
                    {request.user.name && (
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>
                        {request.user.name}
                      </p>
                    )}
                  </div>
                </Link>
                <FriendRequestActions
                  username={request.user.username!}
                  type="incoming"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Outgoing Requests */}
      {outgoingRequests.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--muted)' }}>
            Pending Requests ({outgoingRequests.length})
          </h2>
          <div className="space-y-3">
            {outgoingRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 border"
                style={{ borderColor: 'var(--border)' }}
              >
                <Link
                  href={`/u/${request.user.username}`}
                  className="flex items-center gap-3 no-underline hover:opacity-80"
                >
                  {request.user.image ? (
                    <img
                      src={request.user.image}
                      alt=""
                      className="w-10 h-10 object-cover"
                    />
                  ) : (
                    <DefaultAvatar size="sm" className="w-10 h-10" />
                  )}
                  <div>
                    <p className="font-bold">@{request.user.username}</p>
                    {request.user.name && (
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>
                        {request.user.name}
                      </p>
                    )}
                  </div>
                </Link>
                <FriendRequestActions
                  username={request.user.username!}
                  type="outgoing"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Friends List */}
      <section>
        <h2 className="text-lg font-bold mb-4">
          Your Friends ({friends.length})
        </h2>
        {friends.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>
            You haven't added any friends yet. Find users to connect with!
          </p>
        ) : (
          <div className="space-y-3">
            {friends.map((friend) => (
              <Link
                key={friend.id}
                href={`/u/${friend.username}`}
                className="flex items-center gap-3 p-4 border no-underline hover:opacity-80 transition-opacity"
                style={{ borderColor: 'var(--border)' }}
              >
                {friend.image ? (
                  <img
                    src={friend.image}
                    alt=""
                    className="w-10 h-10 object-cover"
                  />
                ) : (
                  <DefaultAvatar size="sm" className="w-10 h-10" />
                )}
                <div>
                  <p className="font-bold">@{friend.username}</p>
                  {friend.name && (
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                      {friend.name}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
