"use client"

import Link from "next/link"
import { ArchetypeBadge } from "./ArchetypeBadge"
import { GenreRadarChart } from "./GenreRadarChart"

interface TasteIDCardProps {
  username: string
  archetype: {
    id: string
    name: string
    icon: string
    description: string
  }
  secondaryArchetype?: {
    id: string
    name: string
    icon: string
  } | null
  topGenres: string[]
  topArtists: string[]
  genreVector?: Record<string, number>
  adventurenessScore: number
  polarityScore: number
  ratingSkew: string
  reviewCount: number
  averageRating: number
  compact?: boolean
  showRadar?: boolean
  linkToFull?: boolean
}

export function TasteIDCard({
  username,
  archetype,
  secondaryArchetype,
  topGenres,
  topArtists,
  genreVector,
  adventurenessScore,
  polarityScore,
  ratingSkew,
  reviewCount,
  averageRating,
  compact = false,
  showRadar = false,
  linkToFull = true,
}: TasteIDCardProps) {
  const content = (
    <div className="border-2 border-white bg-black p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
            TASTEID
          </div>
          <ArchetypeBadge {...archetype} size="md" />
          {secondaryArchetype && (
            <div className="mt-1">
              <ArchetypeBadge {...secondaryArchetype} size="sm" />
            </div>
          )}
        </div>
        {showRadar && genreVector && Object.keys(genreVector).length >= 3 && (
          <GenreRadarChart genres={genreVector} size={100} showLabels={false} />
        )}
      </div>

      {/* Top Genres */}
      <div className="space-y-1">
        <div className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
          TOP GENRES
        </div>
        <div className="flex flex-wrap gap-1">
          {topGenres.slice(0, 5).map((genre) => (
            <span
              key={genre}
              className="px-2 py-0.5 text-xs border border-neutral-700 text-neutral-300 uppercase"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>

      {/* Top Artists */}
      {!compact && (
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
            DEFINING ARTISTS
          </div>
          <div className="text-sm text-neutral-400">
            {topArtists.slice(0, 5).join(" · ")}
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-800">
        <MetricBlock label="ADVENTURENESS" value={`${Math.round(adventurenessScore * 100)}%`} />
        <MetricBlock label="POLARITY" value={polarityScore.toFixed(2)} />
        <MetricBlock label="RATING STYLE" value={ratingSkew.toUpperCase()} />
        <MetricBlock label="AVG RATING" value={averageRating.toFixed(1)} />
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-neutral-800 flex justify-between items-center">
        <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
          {reviewCount} reviews analyzed
        </span>
        {linkToFull && (
          <span className="text-xs text-white font-bold uppercase tracking-wider hover:underline">
            VIEW FULL →
          </span>
        )}
      </div>
    </div>
  )

  if (linkToFull) {
    return (
      <Link href={`/u/${username}/tasteid`} className="block hover:opacity-90 transition-opacity">
        {content}
      </Link>
    )
  }

  return content
}

function MetricBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <div className="text-[9px] uppercase tracking-widest text-neutral-600 font-bold">
        {label}
      </div>
      <div className="text-sm font-bold text-white">{value}</div>
    </div>
  )
}

export function TasteIDCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className="border-2 border-neutral-800 bg-black p-4 space-y-4 animate-pulse">
      <div className="h-8 w-32 bg-neutral-800" />
      <div className="flex gap-1">
        <div className="h-6 w-16 bg-neutral-800" />
        <div className="h-6 w-16 bg-neutral-800" />
        <div className="h-6 w-16 bg-neutral-800" />
      </div>
      {!compact && <div className="h-4 w-full bg-neutral-800" />}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-800">
        <div className="h-8 bg-neutral-800" />
        <div className="h-8 bg-neutral-800" />
        <div className="h-8 bg-neutral-800" />
        <div className="h-8 bg-neutral-800" />
      </div>
    </div>
  )
}
