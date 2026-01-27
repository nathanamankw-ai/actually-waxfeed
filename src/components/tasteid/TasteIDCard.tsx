"use client"

import Link from "next/link"
import { ArchetypeBadge } from "./ArchetypeBadge"
import { GenreRadarChart } from "./GenreRadarChart"
import { getCurrentTier, getProgressToNextTier, TASTEID_TIERS } from "@/lib/tasteid-tiers"

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
    <div className="border-2 border-foreground bg-background p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
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
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
          TOP GENRES
        </div>
        <div className="flex flex-wrap gap-1">
          {topGenres.slice(0, 5).map((genre) => (
            <span
              key={genre}
              className="px-2 py-0.5 text-xs border border-border text-foreground/80 uppercase"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>

      {/* Top Artists */}
      {!compact && (
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
            DEFINING ARTISTS
          </div>
          <div className="text-sm text-muted-foreground">
            {topArtists.slice(0, 5).join(" · ")}
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
        <MetricBlock label="ADVENTURENESS" value={`${Math.round(adventurenessScore * 100)}%`} />
        <MetricBlock label="POLARITY" value={polarityScore.toFixed(2)} />
        <MetricBlock label="RATING STYLE" value={ratingSkew.toUpperCase()} />
        <MetricBlock label="AVG RATING" value={averageRating.toFixed(1)} />
      </div>

      {/* Tier Progress */}
      <TierProgressBar reviewCount={reviewCount} />

      {/* Footer */}
      <div className="pt-2 border-t border-border flex justify-between items-center">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          {reviewCount} reviews analyzed
        </span>
        {linkToFull && (
          <span className="text-xs text-foreground font-bold uppercase tracking-wider hover:underline">
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
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">
        {label}
      </div>
      <div className="text-sm font-bold text-foreground">{value}</div>
    </div>
  )
}

function TierProgressBar({ reviewCount }: { reviewCount: number }) {
  const { progress, ratingsToNext, currentTier, nextTier } = getProgressToNextTier(reviewCount)
  const tiers = TASTEID_TIERS.slice(1) // Skip 'locked'
  
  return (
    <div className="pt-3 border-t border-border space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div 
            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-black"
            style={{ backgroundColor: currentTier.color }}
          >
            {currentTier.shortName}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: currentTier.color }}>
            {currentTier.name}
          </span>
        </div>
        {nextTier && (
          <span className="text-[10px] text-muted-foreground">
            {ratingsToNext} to {nextTier.name}
          </span>
        )}
      </div>
      
      {/* Segmented progress bar */}
      <div className="flex gap-0.5 h-2">
        {tiers.map((tier) => {
          const isCompleted = reviewCount >= tier.minRatings
          const isCurrent = tier.id === currentTier.id
          
          let fillPercent = 0
          if (isCompleted && !isCurrent) fillPercent = 100
          else if (isCurrent) fillPercent = progress
          
          return (
            <div 
              key={tier.id}
              className="flex-1 bg-muted rounded-sm overflow-hidden"
              title={`${tier.name}: ${tier.minRatings}+ ratings`}
            >
              <div 
                className="h-full transition-all duration-500"
                style={{ 
                  width: `${fillPercent}%`,
                  backgroundColor: tier.color
                }}
              />
            </div>
          )
        })}
      </div>
      
      {/* Tier indicators */}
      <div className="flex justify-between">
        {tiers.map((tier) => {
          const isCompleted = reviewCount >= tier.minRatings
          const isCurrent = tier.id === currentTier.id
          return (
            <div
              key={tier.id}
              className="text-center"
              style={{ width: `${100 / tiers.length}%` }}
              title={`${tier.name}: ${tier.minRatings}+ ratings`}
            >
              <div 
                className={`w-3 h-3 mx-auto rounded-full flex items-center justify-center text-[7px] font-bold border ${
                  isCompleted ? 'text-black' : 'text-muted-foreground'
                }`}
                style={{ 
                  backgroundColor: isCompleted ? tier.color : 'transparent',
                  borderColor: isCompleted || isCurrent ? tier.color : 'var(--border)'
                }}
              >
                {isCompleted ? '✓' : tier.shortName}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function TasteIDCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className="border-2 border-border bg-background p-4 space-y-4 animate-pulse">
      <div className="h-8 w-32 bg-muted" />
      <div className="flex gap-1">
        <div className="h-6 w-16 bg-muted" />
        <div className="h-6 w-16 bg-muted" />
        <div className="h-6 w-16 bg-muted" />
      </div>
      {!compact && <div className="h-4 w-full bg-muted" />}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
        <div className="h-8 bg-muted" />
        <div className="h-8 bg-muted" />
        <div className="h-8 bg-muted" />
        <div className="h-8 bg-muted" />
      </div>
    </div>
  )
}
