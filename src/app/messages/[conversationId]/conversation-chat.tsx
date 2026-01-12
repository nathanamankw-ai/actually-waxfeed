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
}

interface Participant {
  id: string
  username: string | null
  image: string | null
  isVerified: boolean
}

interface ConversationChatProps {
  conversationId: string
  initialMessages: Message[]
  currentUserId: string
  participants: Participant[]
}

export function ConversationChat({
  conversationId,
  initialMessages,
  currentUserId,
  participants,
}: ConversationChatProps) {
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

  // Poll for new messages
  useEffect(() => {
    const pollMessages = async () => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout
        
        const res = await fetch(`/api/messages/${conversationId}`, {
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        
        if (res.ok) {
          const data = await res.json()
          setMessages(data.messages)
        }
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          console.error("Error polling messages:", e)
        }
      }
    }

    // Initial load
    pollMessages()
    
    const interval = setInterval(pollMessages, 3000)
    return () => clearInterval(interval)
  }, [conversationId])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/messages/${conversationId}`, {
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

  // Group messages by date
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
            <p className="text-sm text-[#666]">Send a message to start the conversation!</p>
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
                const isOwn = message.user.id === currentUserId
                const prevMessage = index > 0 ? dateMessages[index - 1] : null
                const showAvatar = !prevMessage || prevMessage.user.id !== message.user.id

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${showAvatar ? "mt-4" : "mt-1"} ${isOwn ? "flex-row-reverse" : ""}`}
                  >
                    {/* Avatar */}
                    <div className="w-8 flex-shrink-0">
                      {showAvatar && !isOwn && (
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
                    <div className={`flex-1 min-w-0 ${isOwn ? "flex flex-col items-end" : ""}`}>
                      {showAvatar && !isOwn && (
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

                      <div
                        className={`inline-block max-w-[70%] rounded-2xl px-4 py-2 ${
                          isOwn
                            ? "bg-white text-black rounded-tr-sm"
                            : "bg-[#222] text-white rounded-tl-sm"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      </div>

                      {showAvatar && isOwn && (
                        <span className="text-xs text-[#666] mt-1">
                          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>

                    {/* Spacer for own messages */}
                    {isOwn && <div className="w-8 flex-shrink-0" />}
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
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1 bg-[#0a0a0a] border border-[#333] rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#555] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !newMessage.trim()}
            className="bg-white text-black px-6 py-2 font-bold text-sm rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  )
}
