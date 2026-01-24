"use client"

import { useEffect, useState } from "react"

interface CompatibilityMeterProps {
  score: number // 0-100
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  animate?: boolean
  matchType?: string
}

export function CompatibilityMeter({
  score,
  size = "md",
  showLabel = true,
  animate = true,
  matchType,
}: CompatibilityMeterProps) {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score)

  useEffect(() => {
    if (!animate) {
      setDisplayScore(score)
      return
    }

    // Animate from 0 to score
    const duration = 1000
    const startTime = Date.now()

    const animateScore = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayScore(Math.round(score * eased))

      if (progress < 1) {
        requestAnimationFrame(animateScore)
      }
    }

    requestAnimationFrame(animateScore)
  }, [score, animate])

  const sizeClasses = {
    sm: { container: "w-16 h-16", text: "text-lg", label: "text-[10px]" },
    md: { container: "w-24 h-24", text: "text-2xl", label: "text-xs" },
    lg: { container: "w-32 h-32", text: "text-4xl", label: "text-sm" },
  }

  const circumference = 2 * Math.PI * 45 // radius of 45
  const strokeDashoffset = circumference - (displayScore / 100) * circumference

  // Color based on score
  const getColor = () => {
    if (displayScore >= 80) return "#22c55e" // green
    if (displayScore >= 60) return "#eab308" // yellow
    if (displayScore >= 40) return "#f97316" // orange
    return "#ef4444" // red
  }

  const matchTypeLabels: Record<string, string> = {
    taste_twin: "TASTE TWIN",
    complementary: "COMPLEMENTARY",
    explorer_guide: "EXPLORER + GUIDE",
    genre_buddy: "GENRE BUDDY",
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative ${sizeClasses[size].container}`}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#333"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={getColor()}
            strokeWidth="8"
            strokeLinecap="square"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-300"
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold ${sizeClasses[size].text}`}>
            {displayScore}
          </span>
          {showLabel && (
            <span className={`text-neutral-500 ${sizeClasses[size].label} uppercase tracking-wider`}>
              MATCH
            </span>
          )}
        </div>
      </div>
      {matchType && matchTypeLabels[matchType] && (
        <span className="text-xs text-neutral-400 uppercase tracking-wider font-bold">
          {matchTypeLabels[matchType]}
        </span>
      )}
    </div>
  )
}

export function CompatibilityMeterSkeleton({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-neutral-800 animate-pulse`} />
  )
}
