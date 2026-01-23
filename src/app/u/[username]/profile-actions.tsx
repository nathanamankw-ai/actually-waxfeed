"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"

type FriendStatus = 'none' | 'pending' | 'friends'

interface Props {
  username: string
  isFriend: boolean
  hasPendingRequest: boolean
  pendingRequestSentByMe: boolean
  isLoggedIn: boolean
}

export function ProfileActions({
  username,
  isFriend: initialFriend,
  hasPendingRequest: initialPending,
  pendingRequestSentByMe: initialSentByMe,
  isLoggedIn
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Derive status from props
  const [status, setStatus] = useState<FriendStatus>(() => {
    if (initialFriend) return 'friends'
    if (initialPending) return 'pending'
    return 'none'
  })
  const [sentByMe, setSentByMe] = useState(initialSentByMe)

  const refreshStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/users/${username}/friend`)
      if (res.ok) {
        const json = await res.json()
        const data = json.data
        if (data.isFriend) {
          setStatus('friends')
        } else if (data.hasPendingRequest) {
          setStatus('pending')
          setSentByMe(data.pendingRequestSentByMe)
        } else {
          setStatus('none')
        }
      }
    } catch (e) {
      console.error('Failed to refresh status:', e)
    }
  }, [username])

  const handleAction = async () => {
    if (!isLoggedIn) {
      router.push("/login")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Determine what action to take based on current state
      if (status === 'friends') {
        // Unfriend
        const res = await fetch(`/api/users/${username}/friend`, {
          method: "DELETE",
        })
        if (res.ok) {
          setStatus('none')
        } else {
          const json = await res.json()
          setError(json.error || 'Failed to unfriend')
        }
      } else if (status === 'pending' && sentByMe) {
        // Cancel my pending request
        const res = await fetch(`/api/users/${username}/friend`, {
          method: "DELETE",
        })
        if (res.ok) {
          setStatus('none')
          setSentByMe(false)
        } else {
          const json = await res.json()
          setError(json.error || 'Failed to cancel request')
        }
      } else if (status === 'pending' && !sentByMe) {
        // Accept their pending request
        const res = await fetch(`/api/users/${username}/friend`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "accept" }),
        })
        if (res.ok) {
          setStatus('friends')
        } else {
          const json = await res.json()
          setError(json.error || 'Failed to accept request')
        }
      } else {
        // Send friend request
        const res = await fetch(`/api/users/${username}/friend`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "send" }),
        })
        if (res.ok) {
          const json = await res.json()
          const data = json.data
          if (data.status === 'friends') {
            // Mutual add - they had a pending request for us
            setStatus('friends')
          } else {
            setStatus('pending')
            setSentByMe(true)
          }
        } else {
          const json = await res.json()
          setError(json.error || 'Failed to send request')
        }
      }
    } catch (e) {
      console.error("Friend action error:", e)
      setError('Something went wrong')
      // Refresh to get correct state
      await refreshStatus()
    }

    setLoading(false)
  }

  const handleDecline = async () => {
    if (!isLoggedIn) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/users/${username}/friend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject" }),
      })
      if (res.ok) {
        setStatus('none')
        setSentByMe(false)
      } else {
        const json = await res.json()
        setError(json.error || 'Failed to decline request')
      }
    } catch (e) {
      console.error("Decline error:", e)
      setError('Something went wrong')
    }

    setLoading(false)
  }

  // Determine button text and style based on status
  const showDecline = status === 'pending' && !sentByMe

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        {/* Primary action button */}
        <button
          onClick={handleAction}
          disabled={loading}
          className={`
            relative px-5 py-2.5 text-[11px] tracking-[0.1em] uppercase font-semibold
            transition-all duration-300 ease-out
            disabled:opacity-40 disabled:cursor-not-allowed
            ${status === 'none'
              ? 'bg-white text-black hover:bg-[#f0f0f0] active:scale-[0.98]'
              : status === 'friends'
              ? 'border border-[--border] text-[--muted] hover:border-red-500/60 hover:text-red-400 hover:bg-red-500/5 group'
              : status === 'pending' && sentByMe
              ? 'border border-[--border] text-[--muted] hover:border-red-500/60 hover:text-red-400 hover:bg-red-500/5'
              : 'bg-white text-black hover:bg-[#f0f0f0] active:scale-[0.98]'
            }
          `}
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
              <span>...</span>
            </span>
          ) : status === 'friends' ? (
            <>
              <span className="group-hover:opacity-0 transition-opacity duration-200">Friends</span>
              <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">Unfriend</span>
            </>
          ) : status === 'pending' && sentByMe ? (
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
              Pending
            </span>
          ) : status === 'pending' && !sentByMe ? (
            'Accept'
          ) : (
            'Add Friend'
          )}
        </button>

        {/* Decline button for incoming requests */}
        {showDecline && !loading && (
          <button
            onClick={handleDecline}
            className="
              px-5 py-2.5 text-[11px] tracking-[0.1em] uppercase font-semibold
              border border-[--border] text-[--muted]
              transition-all duration-300 ease-out
              hover:border-red-500/60 hover:text-red-400 hover:bg-red-500/5
              active:scale-[0.98]
            "
          >
            Decline
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-[10px] tracking-wide text-red-400 animate-in fade-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}
    </div>
  )
}
