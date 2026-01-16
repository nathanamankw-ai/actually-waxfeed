"use client"

import { useState, useCallback } from "react"
import Link from "next/link"

interface Album {
  id: string
  spotifyId: string
  title: string
  artistName: string
  coverArtUrl: string | null
  averageRating: number | null
  totalReviews: number
  genres: string[]
}

interface SpinWheelProps {
  userId?: string
}

export function SpinWheel({ userId }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [album, setAlbum] = useState<Album | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [spinCount, setSpinCount] = useState(0)

  const spin = useCallback(async () => {
    setIsSpinning(true)
    setError(null)
    setSpinCount(c => c + 1)

    try {
      const res = await fetch("/api/albums/random" + (userId ? `?userId=${userId}` : ""))
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to get random album")
      }
      const data = await res.json()

      // Wait for spin animation
      await new Promise(resolve => setTimeout(resolve, 1800))

      setAlbum(data.data.album)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSpinning(false)
    }
  }, [userId])

  const reset = useCallback(() => {
    setAlbum(null)
    setError(null)
  }, [])

  return (
    <div className="w-full">
      {!album ? (
        /* Pre-spin state - Editorial magazine style */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left: Typography */}
          <div className="order-2 lg:order-1">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#666] mb-4">
              Discovery Tool
            </p>
            <h2 className="text-4xl lg:text-6xl font-bold tracking-tight leading-none mb-6">
              Spin the<br />
              Wheel
            </h2>
            <p className="text-sm text-[#888] max-w-sm leading-relaxed mb-8">
              Let fate decide your next listen. One spin, one album,
              infinite possibilities. No algorithms, just serendipity.
            </p>

            <button
              onClick={spin}
              disabled={isSpinning}
              className="group relative inline-flex items-center gap-4 bg-white text-black px-8 py-4 font-bold text-sm tracking-wide hover:bg-[#f0f0f0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>{isSpinning ? "SPINNING" : "SPIN"}</span>
              <span className="text-xs text-[#888] group-hover:text-[#666] transition-colors">
                {spinCount > 0 ? `#${spinCount + 1}` : "001"}
              </span>
            </button>

            {error && (
              <p className="text-red-500 text-xs mt-4 tracking-wide">{error}</p>
            )}
          </div>

          {/* Right: Vinyl Animation */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div
              className="relative w-64 h-64 lg:w-80 lg:h-80 cursor-pointer"
              onClick={!isSpinning ? spin : undefined}
            >
              <svg
                viewBox="0 0 200 200"
                className={`w-full h-full ${isSpinning ? "animate-spin-fast" : ""}`}
                style={{ transformOrigin: "center center" }}
              >
                <defs>
                  <linearGradient id="spinHolo" x1="20%" y1="80%" x2="80%" y2="20%">
                    <stop offset="0%" stopColor="#e4a8c8"/>
                    <stop offset="25%" stopColor="#98d8b8"/>
                    <stop offset="50%" stopColor="#88c8d8"/>
                    <stop offset="75%" stopColor="#b898d8"/>
                    <stop offset="100%" stopColor="#e8c8d8"/>
                  </linearGradient>

                  <radialGradient id="spinSweep" cx="30%" cy="30%" r="80%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5"/>
                    <stop offset="30%" stopColor="#b8ffb8" stopOpacity="0.3"/>
                    <stop offset="60%" stopColor="#e8b8ff" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#ffb8c8" stopOpacity="0.15"/>
                  </radialGradient>

                  <linearGradient id="spinStreak" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0"/>
                    <stop offset="45%" stopColor="#ffffff" stopOpacity="0.6"/>
                    <stop offset="55%" stopColor="#ffffff" stopOpacity="0.6"/>
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
                  </linearGradient>
                </defs>

                {/* Outer case */}
                <circle cx="100" cy="100" r="98" fill="#0a0a0a" stroke="#222" strokeWidth="1"/>

                {/* Vinyl */}
                <circle cx="100" cy="100" r="92" fill="url(#spinHolo)"/>
                <circle cx="100" cy="100" r="92" fill="url(#spinSweep)"/>

                {/* Grooves */}
                <g fill="none" stroke="#000" strokeOpacity="0.08">
                  <circle cx="100" cy="100" r="86" strokeWidth="10"/>
                  <circle cx="100" cy="100" r="72" strokeWidth="8"/>
                  <circle cx="100" cy="100" r="60" strokeWidth="6"/>
                  <circle cx="100" cy="100" r="50" strokeWidth="5"/>
                  <circle cx="100" cy="100" r="42" strokeWidth="4"/>
                </g>

                {/* Light reflection */}
                <circle cx="100" cy="100" r="92" fill="url(#spinStreak)"/>

                {/* Center label */}
                <circle cx="100" cy="100" r="28" fill="#0a0a0a"/>
                <circle cx="100" cy="100" r="24" fill="#151515"/>
                <circle cx="100" cy="100" r="4" fill="#000"/>

                {/* Center text */}
                <text
                  x="100"
                  y="103"
                  textAnchor="middle"
                  fill="#444"
                  fontSize="8"
                  fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif"
                  fontWeight="700"
                  letterSpacing="0.1em"
                >
                  WAXFEED
                </text>
              </svg>

              {/* Click hint */}
              {!isSpinning && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <div className="text-[10px] tracking-[0.2em] uppercase text-white/60">
                    Click to spin
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Album Result - Magazine editorial layout */
        <div className="animate-fade-in">
          {/* Top metadata bar */}
          <div className="flex items-center justify-between text-[10px] tracking-[0.2em] uppercase text-[#666] mb-8 border-b border-[#222] pb-4">
            <span>Result #{spinCount}</span>
            <span>{album.genres[0] || "Unknown Genre"}</span>
            <span>{album.totalReviews} Reviews</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Album Art - Large editorial style */}
            <div className="lg:col-span-5">
              <Link href={`/album/${album.spotifyId}`} className="block group">
                <div className="relative aspect-square w-full overflow-hidden bg-[#111]">
                  {album.coverArtUrl ? (
                    <img
                      src={album.coverArtUrl}
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#444]">
                      No Cover
                    </div>
                  )}
                </div>
              </Link>
            </div>

            {/* Album Info - Typography focused */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-[#666] mb-3">
                  Your Discovery
                </p>

                <Link href={`/album/${album.spotifyId}`} className="group">
                  <h2 className="text-3xl lg:text-5xl font-bold tracking-tight leading-[0.95] mb-4 group-hover:text-[#888] transition-colors">
                    {album.title}
                  </h2>
                </Link>

                <p className="text-lg lg:text-xl text-[#888] mb-6">
                  {album.artistName}
                </p>

                {/* Rating display - if exists */}
                {album.averageRating && (
                  <div className="inline-flex items-baseline gap-2 mb-8">
                    <span className="text-4xl lg:text-5xl font-bold">
                      {album.averageRating.toFixed(1)}
                    </span>
                    <span className="text-sm text-[#666]">/ 10</span>
                  </div>
                )}

                {/* Genres */}
                {album.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {album.genres.slice(0, 3).map((genre, i) => (
                      <span
                        key={i}
                        className="text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 border border-[#333] text-[#888]"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/album/${album.spotifyId}`}
                  className="bg-white text-black px-6 py-3 font-bold text-sm tracking-wide text-center hover:bg-[#f0f0f0] transition-colors no-underline"
                >
                  REVIEW THIS ALBUM
                </Link>
                <button
                  onClick={reset}
                  className="border border-[#333] px-6 py-3 font-bold text-sm tracking-wide hover:border-white transition-colors"
                >
                  SPIN AGAIN
                </button>
              </div>
            </div>
          </div>

          {/* Bottom note */}
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#444] mt-12 text-center">
            Not feeling it? Spin again for a new discovery
          </p>
        </div>
      )}
    </div>
  )
}
