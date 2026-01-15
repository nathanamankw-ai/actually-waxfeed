"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface AttendButtonProps {
  eventSlug: string
  isAttending: boolean
  currentStatus: string | null
  isLive: boolean
}

export function AttendButton({
  eventSlug,
  isAttending,
  currentStatus,
  isLive,
}: AttendButtonProps) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [attending, setAttending] = useState(isAttending)
  const [isLoading, setIsLoading] = useState(false)

  const handleAttend = async (newStatus: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/live/${eventSlug}/attend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        setStatus(newStatus)
        setAttending(true)
        router.refresh()
      }
    } catch (e) {
      console.error("Error updating attendance:", e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLeave = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/live/${eventSlug}/attend`, {
        method: "DELETE",
      })

      if (res.ok) {
        setStatus(null)
        setAttending(false)
        router.refresh()
      }
    } catch (e) {
      console.error("Error removing attendance:", e)
    } finally {
      setIsLoading(false)
    }
  }

  if (attending && status) {
    return (
      <div className="flex items-center gap-3">
        {isLive && status !== "checked_in" && (
          <button
            onClick={() => handleAttend("checked_in")}
            disabled={isLoading}
            className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 font-bold hover:bg-green-600 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Check In - I&apos;m Here!
          </button>
        )}
        
        {status === "checked_in" && (
          <div className="flex items-center gap-2 bg-green-500/20 text-green-500 px-6 py-3 font-bold rounded">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Checked In
          </div>
        )}
        
        {status === "going" && !isLive && (
          <div className="flex items-center gap-2 bg-white/10 text-white px-6 py-3 font-bold rounded">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Going
          </div>
        )}
        
        {status === "interested" && (
          <button
            onClick={() => handleAttend("going")}
            disabled={isLoading}
            className="bg-white text-black px-6 py-3 font-bold hover:bg-gray-100 disabled:opacity-50"
          >
            Confirm - I&apos;m Going
          </button>
        )}
        
        <button
          onClick={handleLeave}
          disabled={isLoading}
          className="text-gray-500 hover:text-black text-sm underline"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => handleAttend("going")}
        disabled={isLoading}
        className="flex items-center gap-2 bg-white text-black px-6 py-3 font-bold hover:bg-gray-100 disabled:opacity-50"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        {isLive ? "Join Event" : "I'm Going"}
      </button>
      
      {!isLive && (
        <button
          onClick={() => handleAttend("interested")}
          disabled={isLoading}
          className="border border-gray-300 text-gray-600 px-6 py-3 hover:text-black hover:border-white disabled:opacity-50"
        >
          Interested
        </button>
      )}
    </div>
  )
}
