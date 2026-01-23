"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  HeartIcon,
  HeartFilledIcon,
  VinylIcon,
  VinylFilledIcon,
  ShareIcon,
  CopyIcon,
  CheckIcon,
  XIcon,
} from "@/components/icons"

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
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copied, setCopied] = useState(false)

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

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/review/${reviewId}`
    : `/review/${reviewId}`

  const handleShare = async () => {
    // Check if native share is available (mobile/iMessage friendly)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this review on WAXFEED',
          url: shareUrl,
        })
      } catch (err) {
        // User cancelled or share failed, show menu instead
        if ((err as Error).name !== 'AbortError') {
          setShowShareMenu(true)
        }
      }
    } else {
      setShowShareMenu(!showShareMenu)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
        setShowShareMenu(false)
      }, 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
        setShowShareMenu(false)
      }, 2000)
    }
  }

  const handleShareTwitter = () => {
    const text = encodeURIComponent('Check out this review on WAXFEED')
    const url = encodeURIComponent(shareUrl)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
    setShowShareMenu(false)
  }

  return (
    <div className="flex items-center gap-1 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
      {/* Like button */}
      <button
        onClick={handleLike}
        disabled={isLoading}
        className={`
          group flex items-center gap-2 px-3 py-2
          transition-all duration-200 ease-out
          disabled:opacity-40
          ${hasLiked
            ? "text-red-500"
            : "text-[--muted] hover:text-red-400 hover:bg-red-500/5"
          }
        `}
      >
        <span className={`transition-transform duration-200 ${hasLiked ? 'scale-110' : 'group-hover:scale-110 group-active:scale-95'}`}>
          {hasLiked ? <HeartFilledIcon size={18} /> : <HeartIcon size={18} />}
        </span>
        <span className="text-[12px] tabular-nums font-medium">{likeCount}</span>
      </button>

      {/* Wax button */}
      <button
        onClick={handleWax}
        disabled={isLoading || isOwner || hasGivenWax}
        className={`
          group flex items-center gap-2 px-3 py-2
          transition-all duration-200 ease-out
          ${hasGivenWax
            ? "text-yellow-500"
            : isOwner
            ? "text-[--border] cursor-not-allowed"
            : "text-[--muted] hover:text-yellow-400 hover:bg-yellow-500/5 disabled:opacity-40"
          }
        `}
        title={isOwner ? "Can't wax your own review" : hasGivenWax ? "Already waxed" : "Give wax"}
      >
        <span className={`transition-transform duration-200 ${hasGivenWax ? 'scale-110' : 'group-hover:scale-110 group-active:scale-95'}`}>
          {hasGivenWax ? <VinylFilledIcon size={18} /> : <VinylIcon size={18} />}
        </span>
        <span className="text-[12px] tabular-nums font-medium">{waxCount}</span>
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Share button */}
      <div className="relative">
        <button
          onClick={handleShare}
          className="
            group flex items-center gap-2 px-4 py-2
            text-[11px] tracking-[0.05em] uppercase font-medium
            border transition-all duration-200 ease-out
            text-[--muted] hover:text-[--foreground] hover:border-[--foreground]
            active:scale-[0.98]
          "
          style={{ borderColor: 'var(--border)' }}
          title="Share this review"
        >
          <ShareIcon size={14} className="transition-transform duration-200 group-hover:scale-110" />
          <span>Share</span>
        </button>

        {/* Share dropdown menu */}
        {showShareMenu && (
          <>
            {/* Backdrop to close menu */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowShareMenu(false)}
            />
            <div
              className="
                absolute right-0 bottom-full mb-2 z-20 min-w-[180px] overflow-hidden
                border shadow-2xl
                animate-in fade-in slide-in-from-bottom-2 duration-200
              "
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)'
              }}
            >
              <button
                onClick={handleCopyLink}
                className="
                  w-full px-4 py-3 text-left text-[12px]
                  flex items-center gap-3
                  transition-colors duration-150
                  hover:bg-[--border]
                "
              >
                {copied ? (
                  <>
                    <CheckIcon size={14} className="text-green-500" />
                    <span className="text-green-500 font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <CopyIcon size={14} className="text-[--muted]" />
                    <span>Copy link</span>
                  </>
                )}
              </button>
              <button
                onClick={handleShareTwitter}
                className="
                  w-full px-4 py-3 text-left text-[12px]
                  flex items-center gap-3
                  transition-colors duration-150
                  hover:bg-[--border]
                "
              >
                <XIcon size={14} className="text-[--muted]" />
                <span>Share on X</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
