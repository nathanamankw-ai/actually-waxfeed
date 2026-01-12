"use client"

import { useState, useRef, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { DefaultAvatar } from "@/components/default-avatar"
import Link from "next/link"

interface Message {
  id: string
  content: string
  type: string
  createdAt: Date
  user: {
    id: string
    username: string | null
    image: string | null
    isVerified: boolean
  }
  replyTo?: {
    id: string
    content: string
    user: {
      username: string | null
    }
  } | null
  reactions: {
    emoji: string
    userId: string
  }[]
}

interface ChannelChatProps {
  channelId: string
  channelSlug: string
  initialMessages: Message[]
  currentUserId: string | undefined
  isMember: boolean
}

export function ChannelChat({
  channelId,
  channelSlug,
  initialMessages,
  currentUserId,
  isMember,
}: ChannelChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Poll for new messages (simple implementation - can be replaced with WebSocket/Supabase Realtime)
  useEffect(() => {
    const pollMessages = async () => {
      try {
        const res = await fetch(`/api/channels/${channelSlug}/messages?limit=50`)
        if (res.ok) {
          const data = await res.json()
          setMessages(data.messages)
        }
      } catch (e) {
        console.error("Error polling messages:", e)
      }
    }

    // Poll every 5 seconds
    const interval = setInterval(pollMessages, 5000)
    return () => clearInterval(interval)
  }, [channelSlug])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/channels/${channelSlug}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to send message")
      }

      const message = await res.json()
      setMessages((prev) => [...prev, message])
      setNewMessage("")
      inputRef.current?.focus()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send message")
    } finally {
      setIsLoading(false)
    }
  }

  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {} as Record<string, Message[]>)

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#888]">No messages yet</p>
            <p className="text-sm text-[#666]">Be the first to start the conversation!</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date Separator */}
              <div className="flex items-center gap-4 my-4">
                <div className="flex-1 border-t border-[#222]" />
                <span className="text-xs text-[#666]">{date}</span>
                <div className="flex-1 border-t border-[#222]" />
              </div>

              {/* Messages for this date */}
              {dateMessages.map((message, index) => {
                const prevMessage = index > 0 ? dateMessages[index - 1] : null
                const showAvatar = !prevMessage || prevMessage.user.id !== message.user.id
                const isOwn = message.user.id === currentUserId

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${showAvatar ? "mt-4" : "mt-1"}`}
                  >
                    {/* Avatar */}
                    <div className="w-8 flex-shrink-0">
                      {showAvatar && (
                        <Link href={`/u/${message.user.username}`}>
                          {message.user.image ? (
                            <img
                              src={message.user.image}
                              alt=""
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <DefaultAvatar size="sm" />
                          )}
                        </Link>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      {showAvatar && (
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            href={`/u/${message.user.username}`}
                            className="font-medium text-sm hover:underline no-underline"
                          >
                            {message.user.username}
                          </Link>
                          {message.user.isVerified && (
                            <svg className="w-3 h-3 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                          )}
                          <span className="text-xs text-[#666]">
                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      )}

                      {/* Reply indicator */}
                      {message.replyTo && (
                        <div className="flex items-center gap-2 text-xs text-[#888] mb-1 pl-2 border-l-2 border-[#333]">
                          <span>Replying to</span>
                          <span className="font-medium">{message.replyTo.user.username}</span>
                          <span className="truncate max-w-xs">{message.replyTo.content}</span>
                        </div>
                      )}

                      <p className="text-sm text-[#ededed] whitespace-pre-wrap break-words">
                        {message.content}
                      </p>

                      {/* Reactions */}
                      {message.reactions.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {Object.entries(
                            message.reactions.reduce((acc, r) => {
                              acc[r.emoji] = (acc[r.emoji] || 0) + 1
                              return acc
                            }, {} as Record<string, number>)
                          ).map(([emoji, count]) => (
                            <span
                              key={emoji}
                              className="text-xs bg-[#222] px-2 py-0.5 rounded-full"
                            >
                              {emoji} {count}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-[#222] p-4">
        {error && (
          <p className="text-red-500 text-sm mb-2">{error}</p>
        )}
        
        {currentUserId ? (
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isMember ? "Type a message..." : "Join to send messages"}
              disabled={isLoading}
              className="flex-1 bg-[#111] border border-[#333] rounded px-4 py-2 text-sm focus:outline-none focus:border-[#555] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !newMessage.trim()}
              className="bg-white text-black px-4 py-2 font-bold text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "..." : "Send"}
            </button>
          </form>
        ) : (
          <div className="text-center py-2">
            <Link
              href="/login"
              className="text-sm text-[#888] hover:text-white no-underline"
            >
              Sign in to send messages
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
