"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function FirstTimeWelcome() {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Mark as mounted first to prevent hydration mismatch
    setIsMounted(true)
    
    // Show for ALL first-time visitors (not just logged in users)
    const hasSeenWelcome = localStorage.getItem('waxfeed-seen-welcome')
    
    if (!hasSeenWelcome) {
      setIsVisible(true)
      setIsAnimating(true)
    }
  }, [])

  const handleCreateTasteID = () => {
    localStorage.setItem('waxfeed-seen-welcome', 'true')
    setIsAnimating(false)
    setTimeout(() => {
      setIsVisible(false)
      // Takes them to signup where they'll start the TasteID flow
      router.push('/signup')
    }, 200)
  }

  const handleSkip = () => {
    localStorage.setItem('waxfeed-seen-welcome', 'true')
    setIsAnimating(false)
    setTimeout(() => {
      setIsVisible(false)
    }, 200)
  }

  // Don't render until mounted (prevents hydration mismatch)
  if (!isMounted || !isVisible) {
    return null
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isAnimating ? 'bg-black/90 backdrop-blur-md' : 'bg-black/0'
      }`}
      style={{ pointerEvents: isAnimating ? 'auto' : 'none' }}
    >
      <div
        className={`max-w-md w-full transition-all duration-400 ${
          isAnimating
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        {/* Premium Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23] border border-white/10 shadow-2xl">
          {/* Animated gradient orbs */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#ffd700]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-[#00ff88]/15 rounded-full blur-3xl" />
          
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/20 transition-all"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative p-8 pt-10">
            {/* Badge */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ffd700]/10 border border-[#ffd700]/30">
                <span className="w-2 h-2 rounded-full bg-[#ffd700] animate-pulse" />
                <span className="text-xs font-bold text-[#ffd700] uppercase tracking-wider">Free Forever</span>
              </div>
            </div>

            {/* Main headline */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-3 text-white">
                Prove Your <span className="text-[#ffd700]">Music Taste</span>
              </h2>
              <p className="text-white/60 text-sm leading-relaxed">
                Be the one who found it first. Get timestamped proof when you discover artists before they blow up.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ffd700] to-[#ff6b6b] flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🏆</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Earn First Spin Badges</div>
                  <div className="text-xs text-white/50">Gold, Silver, Bronze when albums trend</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00ff88] to-[#00bfff] flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🧬</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Get Your TasteID</div>
                  <div className="text-xs text-white/50">AI-powered musical fingerprint</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00bfff] to-[#a855f7] flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">👥</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Find Your People</div>
                  <div className="text-xs text-white/50">Connect with taste matches</div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleCreateTasteID}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#ffd700] to-[#ffed4a] text-black font-bold text-base hover:shadow-lg hover:shadow-[#ffd700]/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Create Free Account
            </button>

            {/* Secondary */}
            <button
              onClick={handleSkip}
              className="w-full mt-3 py-3 text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              Maybe later, let me browse first
            </button>

            {/* Social proof */}
            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-[#ffd700] to-[#ff6b6b] border-2 border-[#1a1a2e] -ml-2 first:ml-0" />
                ))}
                <span className="text-xs text-white/60 ml-2">+2.5k members</span>
              </div>
              <p className="text-[10px] text-white/40">
                Join music lovers proving their taste daily
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
