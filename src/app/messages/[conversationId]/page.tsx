import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { DefaultAvatar } from "@/components/default-avatar"
import { ConversationChat } from "./conversation-chat"

export const dynamic = "force-dynamic"

async function getConversation(conversationId: string, userId: string) {
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
            },
          },
        },
      },
    },
  })

  if (!conversation) {
    return null
  }

  // Get messages
  const messages = await prisma.directMessage.findMany({
    where: {
      conversationId,
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
    },
  })

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

  return {
    ...conversation,
    participants: conversation.participants.map((p) => p.user),
    messages: messages.reverse(),
  }
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 lg:py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Link
          href="/messages"
          className="p-2 hover:bg-[#222] rounded-full transition-colors no-underline"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        {/* Conversation Info */}
        <div className="flex items-center gap-3 flex-1">
          {conversation.type === "group" ? (
            <div className="w-10 h-10 rounded-full bg-[#222] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#888]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          ) : otherUser?.image ? (
            <img src={otherUser.image} alt="" className="w-10 h-10 rounded-full" />
          ) : (
            <DefaultAvatar size="md" />
          )}

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
                <svg className="w-4 h-4 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}
            </div>
            {conversation.type === "group" && (
              <p className="text-xs text-[#888]">
                {conversation.participants.length} members
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {conversation.type === "direct" && otherUser && (
          <Link
            href={`/u/${otherUser.username}`}
            className="p-2 hover:bg-[#222] rounded-full transition-colors no-underline"
            title="View Profile"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>
        )}
      </div>

      {/* Chat Area */}
      <div className="bg-[#111] border border-[#222] rounded-lg" style={{ height: "70vh" }}>
        <ConversationChat
          conversationId={conversation.id}
          initialMessages={conversation.messages}
          currentUserId={session.user.id}
          participants={conversation.participants}
        />
      </div>
    </div>
  )
}
