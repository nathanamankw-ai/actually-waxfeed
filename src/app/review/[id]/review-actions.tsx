"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface ReviewActionsProps {
  reviewId: string
  likeCount: number
  waxCount: number
  hasLiked: boolean
  hasGivenWax: boolean
  isOwner: boolean
  isLoggedIn: boolean
}

export function ReviewActions({
  reviewId,
  likeCount: initialLikeCount,
  waxCount: initialWaxCount,
  hasLiked: initialHasLiked,
  hasGivenWax: initialHasGivenWax,
  isOwner,
  isLoggedIn,
}: ReviewActionsProps) {
  const router = useRouter()
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [waxCount, setWaxCount] = useState(initialWaxCount)
  const [hasLiked, setHasLiked] = useState(initialHasLiked)
  const [hasGivenWax, setHasGivenWax] = useState(initialHasGivenWax)
  const [isLoading, setIsLoading] = useState(false)

  const handleLike = async () => {
    if (!isLoggedIn) {
      router.push("/login")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/reviews/${reviewId}/like`, {
        method: hasLiked ? "DELETE" : "POST",
      })
      if (res.ok) {
        setHasLiked(!hasLiked)
        setLikeCount((prev) => (hasLiked ? prev - 1 : prev + 1))
      }
    } catch (error) {
      console.error("Failed to toggle like:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleWax = async () => {
    if (!isLoggedIn) {
      router.push("/login")
      return
    }

    if (isOwner || hasGivenWax) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/reviews/${reviewId}/wax`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waxType: "standard" }),
      })
      if (res.ok) {
        setHasGivenWax(true)
        setWaxCount((prev) => prev + 1)
      }
    } catch (error) {
      console.error("Failed to give wax:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-4 pt-4 border-t border-[#222]">
      <button
        onClick={handleLike}
        disabled={isLoading}
        className={`flex items-center gap-2 transition-colors ${
          hasLiked ? "text-red-500" : "text-[#888] hover:text-white"
        } disabled:opacity-50`}
      >
        <span className="text-lg">{hasLiked ? "♥" : "♡"}</span>
        <span className="text-sm">{likeCount} likes</span>
      </button>

      <button
        onClick={handleWax}
        disabled={isLoading || isOwner || hasGivenWax}
        className={`flex items-center gap-2 transition-colors ${
          hasGivenWax
            ? "text-yellow-500"
            : isOwner
            ? "text-[#444] cursor-not-allowed"
            : "text-[#888] hover:text-yellow-500"
        } disabled:opacity-50`}
        title={isOwner ? "Can't wax your own review" : hasGivenWax ? "Already waxed" : "Give wax"}
      >
        <span className="text-lg">💿</span>
        <span className="text-sm">{waxCount} wax</span>
      </button>

    </div>
  )
}
