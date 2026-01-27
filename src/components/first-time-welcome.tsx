"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function FirstTimeWelcome() {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsMounted(true)
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
      router.push('/signup')
    }, 200)
  }

  const handleSkip = () => {
    localStorage.setItem('waxfeed-seen-welcome', 'true')
    setIsAnimating(false)
    setTimeout(() => setIsVisible(false), 200)
  }

  if (!isMounted || !isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isAnimating ? 'bg-black/95' : 'bg-black/0'
      }`}
      style={{ pointerEvents: isAnimating ? 'auto' : 'none' }}
    >
      <div
        className={`max-w-lg w-full transition-all duration-400 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="bg-black border border-[#222] relative">
          {/* Close */}
          <button
            onClick={handleSkip}
            className="absolute top-6 right-6 text-[#444] hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="p-10 md:p-12">
            {/* Category label */}
            <p className="text-[10px] tracking-[0.4em] uppercase text-[#ffd700] mb-6">
              First of Its Kind
            </p>

            {/* Headline */}
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
              The world's first platform<br />
              <span className="text-[#ffd700]">that proves your taste.</span>
            </h2>

            {/* Subhead */}
            <p className="text-[#777] text-base leading-relaxed mb-10 max-w-md">
              Every album you rate is timestamped. When it blows up months later, 
              you have the proof. No more "I told you so" — just verified discovery.
            </p>

            {/* The differentiator */}
            <div className="border-l-2 border-[#ffd700] pl-5 mb-10">
              <p className="text-sm text-[#999] leading-relaxed">
                "Letterboxd proved people care about logging films. 
                WaxFeed proves people care about <span className="text-white">being first</span>."
              </p>
            </div>

            {/* What you get - clean list */}
            <div className="grid grid-cols-2 gap-4 mb-10 text-sm">
              <div>
                <div className="text-white font-medium mb-1">Timestamped Reviews</div>
                <div className="text-[#555]">Permanent proof of discovery</div>
              </div>
              <div>
                <div className="text-white font-medium mb-1">First Spin Badges</div>
                <div className="text-[#555]">Recognition when you're early</div>
              </div>
              <div>
                <div className="text-white font-medium mb-1">TasteID Profile</div>
                <div className="text-[#555]">Your musical fingerprint</div>
              </div>
              <div>
                <div className="text-white font-medium mb-1">Taste Matching</div>
                <div className="text-[#555]">Find people who get it</div>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleCreateTasteID}
              className="w-full py-4 bg-[#ffd700] text-black font-bold text-sm uppercase tracking-wider hover:bg-[#ffe44d] transition-colors"
            >
              Join Free — Takes 30 Seconds
            </button>

            {/* Skip */}
            <button
              onClick={handleSkip}
              className="w-full mt-4 text-[#444] text-xs hover:text-[#666] transition-colors"
            >
              Continue as guest
            </button>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-[#222] px-10 py-4 flex items-center justify-between text-[11px] text-[#444]">
            <span>No credit card required</span>
            <span>Free forever</span>
            <span>2,500+ members</span>
          </div>
        </div>
      </div>
    </div>
  )
}
