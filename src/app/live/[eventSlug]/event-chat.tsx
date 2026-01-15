"use client"

import { useState, useRef, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { DefaultAvatar } from "@/components/default-avatar"
import Link from "next/link"

interface Message {
  id: string
  content: string
  createdAt: Date
  user: {
    id: string
    username: string | null
    image: string | null
    isVerified: boolean
  }
}

interface EventChatProps {
  eventSlug: string
  currentUserId: string | undefined
  isLive: boolean
}

export function EventChat({ eventSlug, currentUserId, isLive }: EventChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Fetch and poll messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout
        
        const res = await fetch(`/api/live/${eventSlug}/messages?limit=100`, {
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        
        if (res.ok) {
          const data = await res.json()
          setMessages(data.messages || [])
        }
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          console.error("Error fetching messages:", e)
        }
      }
    }

    fetchMessages()
    
    // Poll more frequently for live events
    const interval = setInterval(fetchMessages, isLive ? 2000 : 5000)
    return () => clearInterval(interval)
  }, [eventSlug, isLive])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isLoading || !currentUserId) return

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/live/${eventSlug}/messages`, {
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

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No messages yet</p>
            <p className="text-sm text-gray-400">Be the first to say something!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.user.id === currentUserId
            
            return (
              <div key={message.id} className="flex items-start gap-2">
                {/* Avatar */}
                <Link href={`/u/${message.user.username}`} className="flex-shrink-0">
                  {message.user.image ? (
                    <img src={message.user.image} alt="" className="w-6 h-6 " />
                  ) : (
                    <div className="w-6 h-6  bg-gray-300" />
                  )}
                </Link>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/u/${message.user.username}`}
                      className={`text-sm font-medium no-underline hover:underline ${isOwn ? "text-blue-400" : ""}`}
                    >
                      {message.user.username}
                    </Link>
                    {message.user.isVerified && (
                      <svg className="w-3 h-3 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    )}
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 break-words">{message.content}</p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-3">
        {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
        
        {currentUserId ? (
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isLive ? "Chat about the event..." : "Send a message..."}
              disabled={isLoading}
              className="flex-1 bg-gray-100 border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#555] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !newMessage.trim()}
              className="bg-white text-black px-4 py-2 font-bold text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        ) : (
          <div className="text-center py-2">
            <Link
              href="/login"
              className="text-sm text-gray-500 hover:text-black no-underline"
            >
              Sign in to chat
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
