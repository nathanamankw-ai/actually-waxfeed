"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns"
import { DefaultAvatar } from "@/components/default-avatar"
import Link from "next/link"

interface Message {
  id: string
  content: string
  type: string
  metadata?: {
    albumId?: string
    albumName?: string
    artistName?: string
    albumCover?: string
  }
  isEdited?: boolean
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

interface Member {
  id: string
  username: string | null
  image: string | null
}

interface ChannelChatProps {
  channelId: string
  channelSlug: string
  initialMessages: Message[]
  currentUserId: string | undefined
  isMember: boolean
  members?: Member[]
}

const REACTION_EMOJIS = ["👍", "❤️", "🔥", "😂", "😮", "🎵"]

export function ChannelChat({
  channelId,
  channelSlug,
  initialMessages,
  currentUserId,
  isMember,
  members = [],
}: ChannelChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [mentionSearch, setMentionSearch] = useState<string | null>(null)
  const [mentionPosition, setMentionPosition] = useState<number>(0)
  const [showAlbumSearch, setShowAlbumSearch] = useState(false)
  const [albumSearchQuery, setAlbumSearchQuery] = useState("")
  const [albumSearchResults, setAlbumSearchResults] = useState<any[]>([])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Poll for new messages
  useEffect(() => {
    const pollMessages = async () => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000)
        
        const res = await fetch(`/api/channels/${channelSlug}/messages?limit=50`, {
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

    pollMessages()
    const interval = setInterval(pollMessages, 3000)
    return () => clearInterval(interval)
  }, [channelSlug])

  // Handle input change with @mention detection
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setNewMessage(value)

    const cursorPos = e.target.selectionStart || 0
    const textBeforeCursor = value.slice(0, cursorPos)
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)
    
    if (mentionMatch) {
      setMentionSearch(mentionMatch[1])
      setMentionPosition(cursorPos - mentionMatch[0].length)
    } else {
      setMentionSearch(null)
    }
  }

  // Insert mention
  const insertMention = (username: string) => {
    const beforeMention = newMessage.slice(0, mentionPosition)
    const afterMention = newMessage.slice(mentionPosition + (mentionSearch?.length || 0) + 1)
    setNewMessage(`${beforeMention}@${username} ${afterMention}`)
    setMentionSearch(null)
    inputRef.current?.focus()
  }

  // Filter members for mention
  const mentionSuggestions = mentionSearch !== null
    ? members.filter(m => 
        m.id !== currentUserId && 
        m.username?.toLowerCase().includes(mentionSearch.toLowerCase())
      )
    : []

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/channels/${channelSlug}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: newMessage.trim(),
          replyToId: replyingTo?.id,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to send message")
      }

      const message = await res.json()
      setMessages((prev) => [...prev, message])
      setNewMessage("")
      setReplyingTo(null)
      inputRef.current?.focus()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send message")
    } finally {
      setIsLoading(false)
    }
  }

  // Add reaction
  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      await fetch(`/api/channels/${channelSlug}/messages/${messageId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      })
    } catch (e) {
      console.error("Failed to add reaction:", e)
    }
    setShowEmojiPicker(null)
  }

  // Search albums
  const searchAlbums = async (query: string) => {
    if (!query.trim()) {
      setAlbumSearchResults([])
      return
    }

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=album&limit=5`)
      if (res.ok) {
        const data = await res.json()
        setAlbumSearchResults(data.albums || [])
      }
    } catch (e) {
      console.error("Failed to search albums:", e)
    }
  }

  // Insert album card
  const insertAlbumCard = async (album: any) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/channels/${channelSlug}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `Check out: ${album.name} by ${album.artists?.[0]?.name || "Unknown"}`,
          type: "album",
          metadata: {
            albumId: album.id,
            albumName: album.name,
            artistName: album.artists?.[0]?.name,
            albumCover: album.images?.[0]?.url,
          },
        }),
      })

      if (res.ok) {
        const message = await res.json()
        setMessages((prev) => [...prev, message])
      }
    } catch (e) {
      console.error("Failed to send album card:", e)
    } finally {
      setIsLoading(false)
      setShowAlbumSearch(false)
      setAlbumSearchQuery("")
      setAlbumSearchResults([])
    }
  }

  // Format date header
  const formatDateHeader = (date: Date) => {
    if (isToday(date)) return "Today"
    if (isYesterday(date)) return "Yesterday"
    return format(date, "EEEE, MMMM d")
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
    <div className="flex flex-col h-full bg-white">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No messages yet</p>
            <p className="text-gray-400 text-xs mt-1">Be the first to start the conversation!</p>
          </div>
        ) : (
          <>
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date Separator */}
                <div className="flex items-center gap-4 my-6 sticky top-0 bg-white py-2 z-10">
                  <div className="flex-1 border-t border-gray-200" />
                  <span className="text-[10px] tracking-[0.2em] text-gray-400 bg-white px-2">
                    {formatDateHeader(new Date(date))}
                  </span>
                  <div className="flex-1 border-t border-gray-200" />
                </div>

                {/* Messages for this date */}
                {dateMessages.map((message, index) => {
                  const prevMessage = index > 0 ? dateMessages[index - 1] : null
                  const showAvatar = !prevMessage || 
                    prevMessage.user.id !== message.user.id ||
                    new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() > 5 * 60 * 1000
                  const isOwn = message.user.id === currentUserId

                  // Group reactions
                  const reactionGroups = message.reactions.reduce((acc, r) => {
                    if (!acc[r.emoji]) {
                      acc[r.emoji] = { emoji: r.emoji, count: 0, userReacted: false }
                    }
                    acc[r.emoji].count++
                    if (r.userId === currentUserId) {
                      acc[r.emoji].userReacted = true
                    }
                    return acc
                  }, {} as Record<string, { emoji: string; count: number; userReacted: boolean }>)

                  return (
                    <div
                      key={message.id}
                      className={`group relative ${showAvatar ? "mt-4" : "mt-0.5"}`}
                      onMouseEnter={() => setHoveredMessageId(message.id)}
                      onMouseLeave={() => setHoveredMessageId(null)}
                    >
                      {/* Reply context */}
                      {message.replyTo && (
                        <div className="flex items-center gap-2 ml-12 mb-1 text-xs text-gray-400">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                          <span>Replying to {message.replyTo.user.username}</span>
                          <span className="truncate max-w-[200px]">{message.replyTo.content}</span>
                        </div>
                      )}

                      <div className="flex gap-3">
                        {/* Avatar */}
                        <div className="w-9 flex-shrink-0">
                          {showAvatar && (
                            <Link href={`/u/${message.user.username}`}>
                              {message.user.image ? (
                                <img
                                  src={message.user.image}
                                  alt=""
                                  className="w-9 h-9 object-cover hover:ring-2 ring-black transition-all"
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
                            <div className="flex items-baseline gap-2 mb-0.5">
                              <Link
                                href={`/u/${message.user.username}`}
                                className="font-bold text-sm hover:underline no-underline"
                              >
                                {message.user.username}
                              </Link>
                              {message.user.isVerified && (
                                <svg className="w-3.5 h-3.5 text-black" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                </svg>
                              )}
                              <span className="text-[10px] text-gray-400">
                                {format(new Date(message.createdAt), "h:mm a")}
                              </span>
                              {message.isEdited && (
                                <span className="text-[10px] text-gray-400">(edited)</span>
                              )}
                            </div>
                          )}

                          {/* Album Card */}
                          {message.type === "album" && message.metadata?.albumId ? (
                            <Link
                              href={`/album/${message.metadata.albumId}`}
                              className="block border border-gray-200 hover:border-gray-300 transition-colors p-3 max-w-md no-underline"
                            >
                              <div className="flex gap-3">
                                {message.metadata.albumCover && (
                                  <img
                                    src={message.metadata.albumCover}
                                    alt=""
                                    className="w-16 h-16 object-cover"
                                  />
                                )}
                                <div className="min-w-0">
                                  <p className="font-bold text-sm truncate">{message.metadata.albumName}</p>
                                  <p className="text-xs text-gray-500 truncate">{message.metadata.artistName}</p>
                                  <p className="text-[10px] text-gray-400 mt-1">VIEW ON WAXFEED →</p>
                                </div>
                              </div>
                            </Link>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap break-words text-gray-800">
                              {message.content.split(/(@\w+)/g).map((part, i) => 
                                part.match(/^@\w+$/) ? (
                                  <Link
                                    key={i}
                                    href={`/u/${part.slice(1)}`}
                                    className="text-black font-bold hover:underline no-underline bg-gray-100 px-1"
                                  >
                                    {part}
                                  </Link>
                                ) : part
                              )}
                            </p>
                          )}

                          {/* Reactions */}
                          {Object.keys(reactionGroups).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Object.values(reactionGroups).map((reaction) => (
                                <button
                                  key={reaction.emoji}
                                  onClick={() => handleReaction(message.id, reaction.emoji)}
                                  className={`flex items-center gap-1 px-2 py-0.5 border text-xs ${
                                    reaction.userReacted
                                      ? "border-black bg-gray-100"
                                      : "border-gray-200 hover:border-gray-300"
                                  }`}
                                >
                                  <span>{reaction.emoji}</span>
                                  <span className="text-gray-600">{reaction.count}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Message Actions (on hover) */}
                        {currentUserId && hoveredMessageId === message.id && (
                          <div className="absolute top-0 right-0 flex items-center gap-0.5 bg-white border border-gray-200 shadow-sm">
                            {/* React */}
                            <div className="relative">
                              <button
                                onClick={() => setShowEmojiPicker(showEmojiPicker === message.id ? null : message.id)}
                                className="p-1.5 hover:bg-gray-100 transition-colors"
                                title="Add reaction"
                              >
                                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                              {showEmojiPicker === message.id && (
                                <div className="absolute top-full right-0 mt-1 flex gap-1 bg-white border border-gray-200 shadow-lg p-1 z-20">
                                  {REACTION_EMOJIS.map((emoji) => (
                                    <button
                                      key={emoji}
                                      onClick={() => handleReaction(message.id, emoji)}
                                      className="p-1 hover:bg-gray-100 text-lg"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Reply */}
                            <button
                              onClick={() => { setReplyingTo(message); inputRef.current?.focus() }}
                              className="p-1.5 hover:bg-gray-100 transition-colors"
                              title="Reply"
                            >
                              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Reply Preview */}
      {replyingTo && (
        <div className="px-6 py-2 bg-gray-50 border-t border-gray-200 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] tracking-[0.2em] text-gray-400 mb-0.5">REPLYING TO {replyingTo.user.username?.toUpperCase()}</p>
            <p className="text-xs text-gray-600 truncate">{replyingTo.content}</p>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="p-1 hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Message Input */}
      <div className="border-t-2 border-black p-4">
        {error && <p className="text-red-600 text-xs mb-2">{error}</p>}

        {/* @Mention Suggestions */}
        {mentionSuggestions.length > 0 && (
          <div className="mb-2 bg-white border border-gray-200 shadow-lg max-h-40 overflow-y-auto">
            {mentionSuggestions.map((user) => (
              <button
                key={user.id}
                onClick={() => insertMention(user.username || "")}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-left"
              >
                {user.image ? (
                  <img src={user.image} alt="" className="w-6 h-6 object-cover" />
                ) : (
                  <DefaultAvatar size="xs" />
                )}
                <span className="text-sm font-medium">{user.username}</span>
              </button>
            ))}
          </div>
        )}

        {/* Album Search Modal */}
        {showAlbumSearch && (
          <div className="mb-2 bg-white border border-gray-200 shadow-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] tracking-[0.2em] text-gray-400">SHARE ALBUM</p>
              <button onClick={() => { setShowAlbumSearch(false); setAlbumSearchQuery(""); setAlbumSearchResults([]) }}>
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <input
              type="text"
              value={albumSearchQuery}
              onChange={(e) => { setAlbumSearchQuery(e.target.value); searchAlbums(e.target.value) }}
              placeholder="Search for an album..."
              className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-black mb-2"
              autoFocus
            />
            {albumSearchResults.length > 0 && (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {albumSearchResults.map((album) => (
                  <button
                    key={album.id}
                    onClick={() => insertAlbumCard(album)}
                    className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 text-left"
                  >
                    {album.images?.[0]?.url && (
                      <img src={album.images[0].url} alt="" className="w-10 h-10 object-cover" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{album.name}</p>
                      <p className="text-xs text-gray-500 truncate">{album.artists?.[0]?.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        
        {currentUserId ? (
          <form onSubmit={handleSendMessage} className="flex gap-2">
            {/* Attachment buttons */}
            <div className="flex items-end gap-1">
              <button
                type="button"
                onClick={() => setShowAlbumSearch(!showAlbumSearch)}
                className="p-2 hover:bg-gray-100 transition-colors border border-gray-200"
                title="Share album"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </button>
            </div>

            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={newMessage}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage(e)
                  }
                }}
                placeholder={replyingTo ? `Reply to ${replyingTo.user.username}...` : isMember ? "Type a message... (@ to mention)" : "Join to send messages"}
                disabled={isLoading || !isMember}
                rows={1}
                className="w-full bg-gray-50 border-2 border-gray-200 px-4 py-3 text-sm resize-none focus:outline-none focus:border-black disabled:opacity-50"
                style={{ minHeight: "48px", maxHeight: "120px" }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !newMessage.trim() || !isMember}
              className="bg-black text-white px-6 py-3 font-bold text-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center py-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 text-sm font-bold no-underline hover:bg-gray-800 transition-colors"
            >
              SIGN IN TO SEND MESSAGES
              <span>→</span>
            </Link>
          </div>
        )}

        {/* Tips */}
        {currentUserId && isMember && (
          <div className="flex gap-4 mt-2 text-[10px] text-gray-400">
            <span>
              <kbd className="px-1 bg-gray-100 border border-gray-200">Enter</kbd> to send
            </span>
            <span>
              <kbd className="px-1 bg-gray-100 border border-gray-200">Shift + Enter</kbd> for new line
            </span>
            <span>
              <kbd className="px-1 bg-gray-100 border border-gray-200">@</kbd> to mention
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
