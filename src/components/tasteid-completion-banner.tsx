"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

interface TasteIDCompletionBannerProps {
  reviewCount: number
  hasTasteID: boolean
}

export function TasteIDCompletionBanner({ reviewCount, hasTasteID }: TasteIDCompletionBannerProps) {
  const { data: session } = useSession()
  const [isDismissed, setIsDismissed] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has dismissed this banner
    const dismissed = localStorage.getItem('tasteid-banner-dismissed')
    if (dismissed === 'true') {
      setIsDismissed(true)
      return
    }

    // Show banner if user has less than 20 reviews or no TasteID
    if (session?.user && (reviewCount < 20 || !hasTasteID)) {
      setIsVisible(true)
    }
  }, [session, reviewCount, hasTasteID])

  const handleDismiss = () => {
    localStorage.setItem('tasteid-banner-dismissed', 'true')
    setIsDismissed(true)
    setIsVisible(false)
  }

  if (!isVisible || isDismissed || !session?.user) {
    return null
  }

  const ratingsNeeded = Math.max(0, 20 - reviewCount)
  const progress = Math.min(100, (reviewCount / 20) * 100)

  return (
    <div className="border-b border-[--border] bg-gradient-to-r from-[#ffd700]/10 to-transparent">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 border-2 border-[#ffd700] flex items-center justify-center">
            <svg className="w-5 h-5 text-[#ffd700]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold mb-1">
              {reviewCount === 0
                ? 'Complete Your TasteID'
                : reviewCount < 20
                ? 'Continue Building Your TasteID'
                : 'Unlock Your Full TasteID'}
            </h3>
            <p className="text-sm text-[--muted] mb-3">
              {reviewCount === 0
                ? 'Rate 20 albums to unlock your personalized taste profile and find your music people.'
                : reviewCount < 20
                ? `Rate ${ratingsNeeded} more album${ratingsNeeded === 1 ? '' : 's'} to complete your taste profile.`
                : 'Your TasteID is ready! View your complete taste profile and discover similar listeners.'}
            </p>

            {/* Progress bar */}
            {reviewCount < 20 && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-[--muted] mb-1">
                  <span>{reviewCount} / 20 ratings</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 bg-[--border] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#ffd700] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              {reviewCount < 20 ? (
                <Link
                  href="/quick-rate"
                  className="px-4 py-2 bg-[#ffd700] text-black text-xs uppercase tracking-wider font-bold hover:bg-[#ffed4a] transition-colors"
                >
                  {reviewCount === 0 ? 'Start Rating' : 'Continue Rating'}
                </Link>
              ) : (
                <Link
                  href="/tasteid/me"
                  className="px-4 py-2 bg-[#ffd700] text-black text-xs uppercase tracking-wider font-bold hover:bg-[#ffed4a] transition-colors"
                >
                  View Your TasteID
                </Link>
              )}
              <button
                onClick={handleDismiss}
                className="px-4 py-2 border border-[--border] text-xs uppercase tracking-wider hover:border-white transition-colors"
              >
                Skip for Now
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-[--muted] hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
