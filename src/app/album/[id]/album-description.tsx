"use client"

import { useState, useEffect } from "react"

interface AlbumDescriptionProps {
  albumId: string
}

export function AlbumDescription({ albumId }: AlbumDescriptionProps) {
  const [description, setDescription] = useState<string | null>(null)
  const [source, setSource] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    async function fetchDescription() {
      try {
        const res = await fetch(`/api/albums/${albumId}/description`)
        const data = await res.json()

        if (data.description) {
          setDescription(data.description)
          setSource(data.source)
        } else {
          // No description available - that's okay
          console.log("No description available")
        }
      } catch (err) {
        console.error("Failed to fetch description:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDescription()
  }, [albumId])

  // Don't render anything if there's no description and we're done loading
  if (!loading && !description) {
    return null
  }

  // Loading state - subtle skeleton
  if (loading) {
    return (
      <div className="border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-4 w-32 bg-gray-100 animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-100 animate-pulse w-full"></div>
          <div className="h-4 bg-gray-100 animate-pulse w-11/12"></div>
          <div className="h-4 bg-gray-100 animate-pulse w-4/5"></div>
        </div>
      </div>
    )
  }

  const sourceLabel =
    source === "wikipedia"
      ? "via Wikipedia"
      : source === "genius"
        ? "via Genius"
        : source === "ai"
          ? "AI Summary"
          : source === "manual"
            ? "Editorial"
            : ""

  // Check if description is long enough to need truncation
  const needsTruncation = description && description.length > 350
  const displayText =
    needsTruncation && !expanded
      ? description.substring(0, 350).trim() + "..."
      : description

  return (
    <div className="border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider">
          About This Album
        </h3>
        {source && (
          <span className="text-xs text-gray-400">
            {sourceLabel}
          </span>
        )}
      </div>

      <p className="text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-line">
        {displayText}
      </p>
      
      {needsTruncation && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-black font-medium mt-3 hover:underline"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  )
}
