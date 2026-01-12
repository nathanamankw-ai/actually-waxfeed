"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Props {
  username: string
  userId: string
  isFriend: boolean
  hasPendingRequest: boolean
  pendingRequestSentByMe: boolean
  isLoggedIn: boolean
}

export function ProfileActions({
  username,
  userId,
  isFriend: initialFriend,
  hasPendingRequest: initialPending,
  pendingRequestSentByMe: initialSentByMe,
  isLoggedIn
}: Props) {
  const router = useRouter()
  const [isFriend, setIsFriend] = useState(initialFriend)
  const [hasPendingRequest, setHasPendingRequest] = useState(initialPending)
  const [pendingRequestSentByMe, setPendingRequestSentByMe] = useState(initialSentByMe)
  const [loading, setLoading] = useState(false)
  const [dmLoading, setDmLoading] = useState(false)

  const handleFriend = async () => {
    if (!isLoggedIn) {
      router.push("/login")
      return
    }

    setLoading(true)
    try {
      if (isFriend) {
        // Unfriend
        const res = await fetch(`/api/users/${username}/friend`, {
          method: "DELETE",
        })
        if (res.ok) {
          setIsFriend(false)
        }
      } else if (hasPendingRequest && pendingRequestSentByMe) {
        // Cancel pending request
        const res = await fetch(`/api/users/${username}/friend`, {
          method: "DELETE",
        })
        if (res.ok) {
          setHasPendingRequest(false)
          setPendingRequestSentByMe(false)
        }
      } else if (hasPendingRequest && !pendingRequestSentByMe) {
        // Accept their request
        const res = await fetch(`/api/users/${username}/friend`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "accept" }),
        })
        if (res.ok) {
          setIsFriend(true)
          setHasPendingRequest(false)
        }
      } else {
        // Send friend request
        const res = await fetch(`/api/users/${username}/friend`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "send" }),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.data?.status === "accepted") {
            setIsFriend(true)
          } else if (data.data?.status === "pending") {
            setHasPendingRequest(true)
            setPendingRequestSentByMe(true)
          }
        }
      }
    } catch (error) {
      console.error("Friend error:", error)
    }
    setLoading(false)
  }

  const handleMessage = async () => {
    if (!isLoggedIn) {
      router.push("/login")
      return
    }

    setDmLoading(true)
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantIds: [userId] }),
      })

      if (res.ok) {
        const data = await res.json()
        router.push(`/messages/${data.conversation.id}`)
      }
    } catch (error) {
      console.error("Message error:", error)
    }
    setDmLoading(false)
  }

  // Determine button text and style
  let buttonText = "Add Friend"
  let buttonStyle = "bg-white text-black hover:bg-gray-100"

  if (isFriend) {
    buttonText = "Friends"
    buttonStyle = "border border-[#333] hover:bg-[#111] hover:border-red-500 hover:text-red-500"
  } else if (hasPendingRequest && pendingRequestSentByMe) {
    buttonText = "Request Sent"
    buttonStyle = "border border-[#333] text-[#888] hover:bg-[#111] hover:border-red-500 hover:text-red-500"
  } else if (hasPendingRequest && !pendingRequestSentByMe) {
    buttonText = "Accept Request"
    buttonStyle = "bg-white text-black hover:bg-gray-100"
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleFriend}
        disabled={loading}
        className={`px-4 py-2 text-sm font-bold transition-colors ${buttonStyle} ${loading ? "opacity-50" : ""}`}
      >
        {loading ? "..." : buttonText}
      </button>
      
      {isFriend && (
        <button
          onClick={handleMessage}
          disabled={dmLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold border border-[#333] hover:bg-[#111] transition-colors"
          title="Send Message"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {dmLoading ? "..." : "Message"}
        </button>
      )}
    </div>
  )
}
