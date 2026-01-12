"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
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
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 lg:py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/messages"
          className="p-2 hover:bg-[#222] rounded-full transition-colors no-underline"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold">New Message</h1>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-lg p-4">
        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-2 bg-[#222] rounded-full px-3 py-1"
              >
                {user.image ? (
                  <img src={user.image} alt="" className="w-5 h-5 rounded-full" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#333]" />
                )}
                <span className="text-sm">{user.username}</span>
                <button
                  onClick={() => handleRemoveUser(user.id)}
                  className="text-[#888] hover:text-white"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Search Input */}
        <div className="relative mb-4">
          <label className="block text-sm text-[#888] mb-2">To:</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a user..."
            className="w-full bg-[#0a0a0a] border border-[#333] rounded px-4 py-2 text-sm focus:outline-none focus:border-[#555]"
          />

          {/* Search Results Dropdown */}
          {(searchResults.length > 0 || isSearching) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#111] border border-[#333] rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-sm text-[#888]">Searching...</div>
              ) : (
                searchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className="flex items-center gap-3 w-full p-3 hover:bg-[#181818] transition-colors text-left"
                  >
                    {user.image ? (
                      <img src={user.image} alt="" className="w-10 h-10 rounded-full" />
                    ) : (
                      <DefaultAvatar size="md" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-medium truncate">{user.username}</span>
                        {user.isVerified && (
                          <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
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

        {/* Message Input */}
        <div className="mb-4">
          <label className="block text-sm text-[#888] mb-2">Message (optional):</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Start the conversation..."
            rows={4}
            className="w-full bg-[#0a0a0a] border border-[#333] rounded px-4 py-2 text-sm focus:outline-none focus:border-[#555] resize-none"
          />
        </div>

        {/* Error */}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* Submit */}
        <button
          onClick={handleStartConversation}
          disabled={isLoading || selectedUsers.length === 0}
          className="w-full bg-white text-black py-3 font-bold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Starting..." : "Start Conversation"}
        </button>
      </div>

      {/* Tips */}
      <div className="mt-4 p-4 bg-[#111] border border-[#222] rounded-lg">
        <h3 className="font-bold mb-2 text-sm">Tips</h3>
        <ul className="text-sm text-[#888] space-y-1">
          <li>• Search by username to find users</li>
          <li>• Add multiple users to create a group chat</li>
          <li>• You can also start a conversation from a user&apos;s profile</li>
        </ul>
      </div>
    </div>
  )
}
