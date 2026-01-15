"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DefaultAvatar } from "@/components/default-avatar"

interface User {
  id: string
  username: string | null
  image: string | null
  isVerified: boolean
}

export default function NewMessagePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedUserId = searchParams.get("userId")

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [friends, setFriends] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load friends on mount
  useEffect(() => {
    const loadFriends = async () => {
      try {
        const res = await fetch("/api/friends")
        if (res.ok) {
          const data = await res.json()
          setFriends(data.friends || [])
        }
      } catch (e) {
        console.error("Error loading friends:", e)
      }
    }
    loadFriends()
  }, [])

  // Load preselected user
  useEffect(() => {
    if (preselectedUserId) {
      const loadUser = async () => {
        try {
          const res = await fetch(`/api/users?ids=${preselectedUserId}`)
          if (res.ok) {
            const data = await res.json()
            if (data.users && data.users.length > 0) {
              setSelectedUsers([data.users[0]])
            }
          }
        } catch (e) {
          console.error("Error loading user:", e)
        }
      }
      loadUser()
    }
  }, [preselectedUserId])

  // Search users
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const searchUsers = async () => {
      setIsSearching(true)
      try {
        const res = await fetch(`/api/users?search=${encodeURIComponent(searchQuery)}&limit=10`)
        if (res.ok) {
          const data = await res.json()
          // Filter out already selected users
          const filtered = (data.users || []).filter(
            (u: User) => !selectedUsers.some((s) => s.id === u.id)
          )
          setSearchResults(filtered)
        }
      } catch (e) {
        console.error("Error searching users:", e)
      } finally {
        setIsSearching(false)
      }
    }

    const debounce = setTimeout(searchUsers, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery, selectedUsers])

  const handleSelectUser = (user: User) => {
    setSelectedUsers((prev) => [...prev, user])
    setSearchQuery("")
    setSearchResults([])
  }

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId))
  }

  const handleStartConversation = async () => {
    if (selectedUsers.length === 0) {
      setError("Please select at least one recipient")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantIds: selectedUsers.map((u) => u.id),
          initialMessage: message.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create conversation")
      }

      const data = await res.json()
      router.push(`/messages/${data.conversation.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start conversation")
      setIsLoading(false)
    }
  }

  // Filter friends that aren't selected
  const availableFriends = friends.filter(
    (f) => !selectedUsers.some((s) => s.id === f.id)
  )

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b-2 border-black">
        <h2 className="text-lg font-bold">"NEW MESSAGE"</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* To Field */}
        <div className="mb-6">
          <label className="text-[10px] tracking-[0.2em] text-gray-500 mb-2 block">TO</label>
          
          {/* Selected Users */}
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-2 bg-gray-100 border border-gray-200 px-3 py-1.5"
              >
                {user.image ? (
                  <img src={user.image} alt="" className="w-5 h-5 object-cover" />
                ) : (
                  <div className="w-5 h-5 bg-gray-300" />
                )}
                <span className="text-sm font-medium">{user.username}</span>
                {user.isVerified && (
                  <svg className="w-3.5 h-3.5 text-black" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                )}
                <button
                  onClick={() => handleRemoveUser(user.id)}
                  className="text-gray-400 hover:text-black ml-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a user..."
              className="w-full bg-gray-50 border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black"
            />

            {/* Search Results Dropdown */}
            {(searchResults.length > 0 || isSearching) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-black shadow-lg z-10 max-h-60 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
                ) : (
                  searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className="flex items-center gap-3 w-full p-3 hover:bg-gray-100 transition-colors text-left border-b border-gray-100 last:border-0"
                    >
                      {user.image ? (
                        <img src={user.image} alt="" className="w-10 h-10 object-cover" />
                      ) : (
                        <DefaultAvatar size="md" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm truncate">{user.username}</span>
                          {user.isVerified && (
                            <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Friends */}
        {availableFriends.length > 0 && !searchQuery && (
          <div className="mb-6">
            <label className="text-[10px] tracking-[0.2em] text-gray-500 mb-3 block">QUICK SELECT — FRIENDS</label>
            <div className="grid grid-cols-2 gap-2">
              {availableFriends.slice(0, 6).map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => handleSelectUser(friend)}
                  className="flex items-center gap-3 p-3 border border-gray-200 hover:border-black transition-colors text-left"
                >
                  {friend.image ? (
                    <img src={friend.image} alt="" className="w-10 h-10 object-cover" />
                  ) : (
                    <DefaultAvatar size="md" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm truncate">{friend.username}</span>
                      {friend.isVerified && (
                        <svg className="w-3.5 h-3.5 text-black" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="mb-6">
          <label className="text-[10px] tracking-[0.2em] text-gray-500 mb-2 block">FIRST MESSAGE (OPTIONAL)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Start the conversation..."
            rows={4}
            className="w-full bg-gray-50 border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black resize-none"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleStartConversation}
          disabled={isLoading || selectedUsers.length === 0}
          className="w-full bg-black text-white py-4 font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>STARTING...</span>
            </>
          ) : (
            <>
              <span>START CONVERSATION</span>
              <span>→</span>
            </>
          )}
        </button>
      </div>

      {/* Tips Footer */}
      <div className="border-t-2 border-black p-4 bg-gray-50">
        <p className="text-[10px] tracking-[0.2em] text-gray-400 mb-2">TIPS</p>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>• Add multiple users to create a group chat</li>
          <li>• Type @ in messages to mention someone</li>
          <li>• Share albums directly in the conversation</li>
        </ul>
      </div>
    </div>
  )
}
