"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// Small recompute button inside the section
export function SmallRecomputeButton() {
  const [loading, setLoading] = useState(false)

  const handleRecompute = async () => {
    setLoading(true)
    
    try {
      const res = await fetch("/api/tasteid/compute", { 
        method: "POST",
        credentials: "include"
      })
      const data = await res.json()
      
      if (res.ok && data.data?.tasteId) {
        window.location.reload()
      }
    } catch (error) {
      console.error("Recompute error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleRecompute}
      className="px-2 py-1 text-xs border border-white/30 text-white/70 hover:text-white hover:border-white hover:bg-white/10 transition-colors rounded flex items-center gap-1"
      title="Recompute TasteID"
    >
      {loading ? (
        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )}
      <span>{loading ? "..." : "refresh"}</span>
    </button>
  )
}

export function GenerateTasteIDButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const router = useRouter()

  const handleGenerate = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/tasteid/compute", { method: "POST" })
      const data = await res.json()
      
      if (res.ok && data.data?.tasteId) {
        setResult(`✓ ${data.data.tasteId.primaryArchetype} @ ${Math.round(data.data.tasteId.archetypeConfidence * 100)}%`)
        // Force hard refresh to bust cache
        setTimeout(() => window.location.reload(), 1000)
      } else {
        setResult(`✗ ${data.error || 'Failed'}`)
      }
    } catch (error) {
      console.error("Failed to generate TasteID:", error)
      setResult("✗ Error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={loading}
        className="w-full sm:w-auto px-6 py-3 border-2 border-white text-sm font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleGenerate}
      >
        {loading ? "COMPUTING..." : "GENERATE MY TASTEID"}
      </button>
      {result && (
        <div className="text-sm text-center">{result}</div>
      )}
    </div>
  )
}

export function RecomputeButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleRecompute = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/tasteid/compute", { method: "POST" })
      const data = await res.json()
      
      console.log("[TasteID Recompute] Response:", data)
      
      if (res.ok && data.data?.tasteId) {
        const archetype = data.data.tasteId.primaryArchetype
        const confidence = Math.round(data.data.tasteId.archetypeConfidence * 100)
        const adventureness = Math.round(data.data.tasteId.adventurenessScore * 100)
        setResult(`✓ ${archetype} @ ${confidence}% (${adventureness}% adv)`)
        
        // Force hard page reload after 1.5s to bust Next.js cache
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setResult(`✗ ${data.error || 'Failed to compute'}`)
      }
    } catch (error) {
      console.error("Failed to recompute TasteID:", error)
      setResult("✗ Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={loading}
        className="w-full sm:w-auto px-4 py-3 sm:py-2 border-2 border-white text-sm font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleRecompute}
      >
        {loading ? "COMPUTING..." : "RECOMPUTE TASTEID"}
      </button>
      {result && (
        <div className={`text-sm ${result.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>
          {result}
        </div>
      )}
    </div>
  )
}
