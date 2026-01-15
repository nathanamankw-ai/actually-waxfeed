"use client"

import { useState } from "react"

interface QuickRatingProps {
  eventSlug: string
  currentUserId: string | undefined
}

export function QuickRating({ eventSlug, currentUserId }: QuickRatingProps) {
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null)
  const [rating, setRating] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const reactions = [
    { id: "fire", emoji: "F", label: "Fire" },
    { id: "mid", emoji: "M", label: "Mid" },
    { id: "skip", emoji: "S", label: "Skip" },
  ]

  const handleReaction = async (reactionId: string) => {
    if (!currentUserId) return
    setSelectedReaction(reactionId)
    // In production, this would call an API
  }

  const handleRating = async (value: number) => {
    if (!currentUserId) return
    setRating(value)
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
    }, 500)
  }

  if (!currentUserId) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        Sign in to rate
      </div>
    )
  }

  return (
    <div className="bg-gray-50 border border-gray-200  p-4">
      <h3 className="font-bold mb-3 text-sm">⚡ Quick Rate</h3>
      
      {/* Quick Reactions */}
      <div className="flex gap-2 mb-4">
        {reactions.map((reaction) => (
          <button
            key={reaction.id}
            onClick={() => handleReaction(reaction.id)}
            className={`flex-1 flex flex-col items-center gap-1 p-3  transition-all ${
              selectedReaction === reaction.id
                ? "bg-white/10 border-2 border-white/30 scale-105"
                : "bg-gray-100 border border-gray-300 hover:border-[#555]"
            }`}
          >
            <span className="text-2xl">{reaction.emoji}</span>
            <span className="text-xs text-gray-500">{reaction.label}</span>
          </button>
        ))}
      </div>

      {/* Detailed Rating */}
      <div>
        <p className="text-xs text-gray-500 mb-2">Or rate 1-10:</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
            <button
              key={value}
              onClick={() => handleRating(value)}
              disabled={isSubmitting}
              className={`flex-1 py-2 text-xs font-bold transition-all ${
                rating === value
                  ? "bg-black text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              } ${isSubmitting ? "opacity-50" : ""}`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {(selectedReaction || rating) && (
        <div className="mt-3 pt-3 border-t border-gray-200 text-center">
          <p className="text-sm text-green-500">
            {selectedReaction && `You voted: ${reactions.find(r => r.id === selectedReaction)?.label}`}
            {rating && ` Rated: ${rating}/10`}
          </p>
        </div>
      )}
    </div>
  )
}
