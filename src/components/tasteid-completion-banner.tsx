"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

interface TasteIDCompletionBannerProps {
  reviewCount: number
  hasTasteID: boolean
}

// TasteID accuracy tiers based on rating count
const ACCURACY_TIERS = [
  { min: 0, max: 19, label: 'Locked', accuracy: 0, color: '#666' },
  { min: 20, max: 49, label: 'Emerging', accuracy: 60, color: '#ffd700' },
  { min: 50, max: 99, label: 'Developing', accuracy: 75, color: '#ffd700' },
  { min: 100, max: 199, label: 'Refined', accuracy: 85, color: '#00ff88' },
  { min: 200, max: 499, label: 'Deep', accuracy: 92, color: '#00ff88' },
  { min: 500, max: Infinity, label: 'Crystallized', accuracy: 98, color: '#00ffff' },
]

function getAccuracyTier(count: number) {
  return ACCURACY_TIERS.find(tier => count >= tier.min && count <= tier.max) || ACCURACY_TIERS[0]
}

function getNextTier(count: number) {
  const currentIndex = ACCURACY_TIERS.findIndex(tier => count >= tier.min && count <= tier.max)
  return currentIndex < ACCURACY_TIERS.length - 1 ? ACCURACY_TIERS[currentIndex + 1] : null
}

export function TasteIDCompletionBanner({ reviewCount, hasTasteID }: TasteIDCompletionBannerProps) {
  const { data: session, status } = useSession()
  const [isMounted, setIsMounted] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  // Handle hydration - only render after mount
  useEffect(() => {
    setIsMounted(true)
    
    // Check if user has dismissed this banner today
    const dismissedDate = localStorage.getItem('tasteid-banner-dismissed-date')
    const today = new Date().toDateString()
    
    if (dismissedDate === today) {
      setIsDismissed(true)
    }
  }, [])

  const handleDismiss = () => {
    // Only dismiss for today - show again tomorrow to encourage continuous rating
    localStorage.setItem('tasteid-banner-dismissed-date', new Date().toDateString())
    setIsDismissed(true)
  }

  // Don't render anything until mounted (prevents hydration mismatch)
  if (!isMounted) {
    return null
  }

  // Don't show if dismissed or no session
  if (isDismissed || status !== 'authenticated' || !session?.user) {
    return null
  }

  const isUnlocked = reviewCount >= 20
  const currentTier = getAccuracyTier(reviewCount)
  const nextTier = getNextTier(reviewCount)
  const ratingsToNextTier = nextTier ? nextTier.min - reviewCount : 0
  const unlockProgress = Math.min(100, (reviewCount / 20) * 100)

  return (
    <div className="border-b border-[--border] bg-gradient-to-r from-[#ffd700]/10 to-transparent">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`flex-shrink-0 w-10 h-10 border-2 flex items-center justify-center`} style={{ borderColor: currentTier.color }}>
            {isUnlocked ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={currentTier.color} strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={currentTier.color} strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {!isUnlocked ? (
              <>
                <h3 className="text-base font-bold mb-1">
                  Unlock Your TasteID
                </h3>
                <p className="text-sm text-[--muted] mb-3">
                  Rate {20 - reviewCount} more album{20 - reviewCount === 1 ? '' : 's'} to unlock your musical fingerprint. 
                  The more you rate, the smarter it gets.
                </p>
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-[--muted] mb-1">
                    <span>{reviewCount} / 20 to unlock</span>
                    <span>{Math.round(unlockProgress)}%</span>
                  </div>
                  <div className="h-1.5 bg-[--border] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#ffd700] transition-all duration-300"
                      style={{ width: `${unlockProgress}%` }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-base font-bold">Your TasteID</h3>
                  <span 
                    className="text-xs px-2 py-0.5 font-bold uppercase tracking-wider"
                    style={{ backgroundColor: currentTier.color, color: '#000' }}
                  >
                    {currentTier.label}
                  </span>
                  <span className="text-xs text-[--muted]">
                    {currentTier.accuracy}% accuracy
                  </span>
                </div>
                <p className="text-sm text-[--muted] mb-3">
                  {nextTier ? (
                    <>
                      Rate {ratingsToNextTier} more album{ratingsToNextTier === 1 ? '' : 's'} to reach <strong style={{ color: nextTier.color }}>{nextTier.label}</strong> tier ({nextTier.accuracy}% accuracy).
                      Your taste profile evolves with every rating.
                    </>
                  ) : (
                    <>
                      Maximum accuracy achieved. Your taste profile is highly refined.
                      Keep rating to maintain peak accuracy.
                    </>
                  )}
                </p>
              </>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              {!isUnlocked ? (
                <Link
                  href="/quick-rate"
                  className="px-4 py-2 bg-[#ffd700] text-black text-xs uppercase tracking-wider font-bold hover:bg-[#ffed4a] transition-colors"
                >
                  {reviewCount === 0 ? 'Start Rating' : 'Continue Rating'}
                </Link>
              ) : (
                <>
                  <Link
                    href="/tasteid/me"
                    className="px-4 py-2 bg-[#ffd700] text-black text-xs uppercase tracking-wider font-bold hover:bg-[#ffed4a] transition-colors"
                  >
                    View TasteID
                  </Link>
                  <Link
                    href="/quick-rate"
                    className="px-4 py-2 border border-[#ffd700] text-[#ffd700] text-xs uppercase tracking-wider font-bold hover:bg-[#ffd700] hover:text-black transition-colors"
                  >
                    Keep Building
                  </Link>
                </>
              )}
              <button
                onClick={handleDismiss}
                className="px-4 py-2 border border-[--border] text-xs uppercase tracking-wider hover:border-white transition-colors"
              >
                Dismiss
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
