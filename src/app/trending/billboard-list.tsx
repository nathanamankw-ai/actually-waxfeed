"use client"

import { useState } from "react"
import Link from "next/link"

interface Album {
  id: string
  spotifyId: string
  title: string
  artistName: string
  coverArtUrl: string | null
  averageRating: number | null
  totalReviews: number
  billboardRank: number | null
}

interface BillboardListProps {
  albums: Album[]
}

export function BillboardList({ albums }: BillboardListProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const displayedAlbums = isExpanded ? albums : albums.slice(0, 15)
  const hasMore = albums.length > 15

  return (
    <div>
      <div className="space-y-2">
        {displayedAlbums.map((album) => (
          <Link
            key={album.id}
            href={`/album/${album.spotifyId}`}
            className="flex items-center gap-3 md:gap-4 p-2 md:p-3 hover:opacity-80 transition-colors no-underline group"
          >
            <span className="text-lg md:text-xl font-bold text-[--muted] w-6 md:w-8 flex-shrink-0">
              {album.billboardRank}
            </span>
            <div className="w-12 h-12 md:w-14 md:h-14 flex-shrink-0 bg-[--border]">
              {album.coverArtUrl && (
                <img
                  src={album.coverArtUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate group-hover:underline text-sm md:text-base">
                {album.title}
              </p>
              <p className="text-[--muted] text-xs md:text-sm truncate">
                {album.artistName}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              {album.averageRating !== null && (
                <p className="font-bold text-sm md:text-base">{album.averageRating.toFixed(1)}</p>
              )}
              <p className="text-[--muted] text-xs">
                {album.totalReviews} {album.totalReviews === 1 ? "review" : "reviews"}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-4 py-3 flex items-center justify-center gap-2 text-sm text-[--muted] hover:text-white hover:opacity-80 transition-colors border border-[--border] hover:border-[--muted]"
        >
          <span>{isExpanded ? "Show Less" : `Show All ${albums.length}`}</span>
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
    </div>
  )
}
