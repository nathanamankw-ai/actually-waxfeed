'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'

interface Album {
  id: string
  title: string
  artistName: string
  coverArtUrl: string | null
  coverArtUrlLarge: string | null
  releaseDate: string | null
  genres: string[]
}

type Rating = 1 | 2 | 3 | 4 | 5

export default function SwipePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [albums, setAlbums] = useState<Album[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [ratedCount, setRatedCount] = useState(0)
  const [sessionRatings, setSessionRatings] = useState<{ albumId: string; rating: Rating }[]>([])
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | null>(null)
  const [showTutorial, setShowTutorial] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/discover/swipe')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchAlbums()
    }
  }, [session])

  const fetchAlbums = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/albums/swipe?limit=20')
      const data = await res.json()
      if (data.success) {
        setAlbums(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch albums:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitRating = async (albumId: string, rating: Rating) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          albumId,
          rating,
          text: '', // Quick rate mode - no text review
          isQuickRate: true,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setRatedCount((prev) => prev + 1)
        setSessionRatings((prev) => [...prev, { albumId, rating }])
      }
    } catch (error) {
      console.error('Failed to submit rating:', error)
    }
  }

  const handleSwipe = useCallback(
    (direction: 'left' | 'right' | 'up') => {
      if (currentIndex >= albums.length) return

      const album = albums[currentIndex]
      let rating: Rating

      switch (direction) {
        case 'left':
          rating = 2 // Skip/meh
          break
        case 'right':
          rating = 4 // Like
          break
        case 'up':
          rating = 5 // Love
          break
      }

      setSwipeDirection(direction)
      submitRating(album.id, rating)

      setTimeout(() => {
        setSwipeDirection(null)
        setCurrentIndex((prev) => prev + 1)
      }, 300)
    },
    [currentIndex, albums]
  )

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100
    const velocityThreshold = 500

    if (info.offset.y < -threshold || info.velocity.y < -velocityThreshold) {
      handleSwipe('up')
    } else if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
      handleSwipe('right')
    } else if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
      handleSwipe('left')
    }
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handleSwipe('left')
      if (e.key === 'ArrowRight') handleSwipe('right')
      if (e.key === 'ArrowUp') handleSwipe('up')
    },
    [handleSwipe]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <div className="w-10 h-10 border-2 border-[--muted] border-t-[#ffd700] animate-spin" />
          <span className="text-xs tracking-[0.2em] uppercase text-[--muted]">Loading albums</span>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const currentAlbum = albums[currentIndex]
  const isFinished = currentIndex >= albums.length

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-[--border]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/discover"
            className="text-[--muted] hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>
          <div className="text-center">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#ffd700]">Quick Rate</p>
            <p className="text-xs text-[--muted]">{ratedCount} rated this session</p>
          </div>
          <button
            onClick={() => setShowTutorial(true)}
            className="text-[--muted] hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tutorial Overlay */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-6"
            onClick={() => setShowTutorial(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-sm w-full p-8 border border-[--border] bg-[#0a0a0a] text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-6">How to Rate</h2>
              <div className="space-y-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 flex items-center justify-center border border-[#ffd700] text-[#ffd700]">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-[#ffd700]">Swipe Up</p>
                    <p className="text-sm text-[--muted]">Love it! (5 stars)</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 flex items-center justify-center border border-green-500 text-green-500">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-green-500">Swipe Right</p>
                    <p className="text-sm text-[--muted]">Like it (4 stars)</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 flex items-center justify-center border border-red-500 text-red-500">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-red-500">Swipe Left</p>
                    <p className="text-sm text-[--muted]">Skip / Not for me (2 stars)</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-[--muted] mb-6">
                Or use arrow keys: ← → ↑
              </p>
              <button
                onClick={() => setShowTutorial(false)}
                className="w-full py-3 bg-[#ffd700] text-black font-bold text-sm tracking-wide uppercase hover:bg-[#ffed4a] transition-colors"
              >
                Start Rating
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="pt-20 pb-32 px-4 flex items-center justify-center min-h-screen">
        {isFinished ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-sm w-full text-center p-8 border border-[--border]"
          >
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-2xl font-bold mb-4">Session Complete!</h2>
            <p className="text-[--muted] mb-2">You rated</p>
            <p className="text-5xl font-bold text-[#ffd700] mb-6 tabular-nums">{ratedCount}</p>
            <p className="text-[--muted] mb-8">albums this session</p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setCurrentIndex(0)
                  fetchAlbums()
                }}
                className="w-full py-3 bg-[#ffd700] text-black font-bold text-sm tracking-wide uppercase hover:bg-[#ffed4a] transition-colors"
              >
                Keep Going
              </button>
              <Link
                href="/discover/connections"
                className="block w-full py-3 border border-[--border] font-bold text-sm tracking-wide uppercase hover:border-white transition-colors"
              >
                Check Connections
              </Link>
            </div>
          </motion.div>
        ) : currentAlbum ? (
          <div className="relative w-full max-w-sm">
            {/* Cards Stack */}
            <div className="relative h-[500px]">
              {/* Next card preview */}
              {albums[currentIndex + 1] && (
                <div className="absolute inset-0 scale-95 opacity-50">
                  <div className="w-full h-full border border-[--border] bg-[#111] p-4">
                    {albums[currentIndex + 1].coverArtUrlLarge && (
                      <img
                        src={albums[currentIndex + 1].coverArtUrlLarge!}
                        alt=""
                        className="w-full aspect-square object-cover"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Current card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentAlbum.id}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    x: swipeDirection === 'left' ? -300 : swipeDirection === 'right' ? 300 : 0,
                    y: swipeDirection === 'up' ? -300 : 0,
                    rotate: swipeDirection === 'left' ? -15 : swipeDirection === 'right' ? 15 : 0,
                  }}
                  exit={{
                    x: swipeDirection === 'left' ? -500 : swipeDirection === 'right' ? 500 : 0,
                    y: swipeDirection === 'up' ? -500 : 0,
                    opacity: 0,
                  }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  drag
                  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                  dragElastic={1}
                  onDragEnd={handleDragEnd}
                  className="absolute inset-0 cursor-grab active:cursor-grabbing"
                >
                  <div className="w-full h-full border-2 border-[--border] bg-[#0a0a0a] overflow-hidden">
                    {/* Album Art */}
                    <div className="relative">
                      {currentAlbum.coverArtUrlLarge ? (
                        <img
                          src={currentAlbum.coverArtUrlLarge}
                          alt={currentAlbum.title}
                          className="w-full aspect-square object-cover"
                          draggable={false}
                        />
                      ) : (
                        <div className="w-full aspect-square bg-[--muted]/10 flex items-center justify-center">
                          <svg className="w-20 h-20 text-[--muted]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                          </svg>
                        </div>
                      )}

                      {/* Swipe indicators */}
                      <motion.div
                        className="absolute inset-0 bg-green-500/20 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: swipeDirection === 'right' ? 1 : 0 }}
                      >
                        <span className="text-6xl font-bold text-green-500">LIKE</span>
                      </motion.div>
                      <motion.div
                        className="absolute inset-0 bg-red-500/20 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: swipeDirection === 'left' ? 1 : 0 }}
                      >
                        <span className="text-6xl font-bold text-red-500">SKIP</span>
                      </motion.div>
                      <motion.div
                        className="absolute inset-0 bg-[#ffd700]/20 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: swipeDirection === 'up' ? 1 : 0 }}
                      >
                        <span className="text-6xl font-bold text-[#ffd700]">LOVE</span>
                      </motion.div>
                    </div>

                    {/* Album Info */}
                    <div className="p-5">
                      <h2 className="text-xl font-bold truncate mb-1">{currentAlbum.title}</h2>
                      <p className="text-[--muted] truncate mb-3">{currentAlbum.artistName}</p>
                      {currentAlbum.genres && currentAlbum.genres.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {currentAlbum.genres.slice(0, 3).map((genre) => (
                            <span
                              key={genre}
                              className="text-[10px] px-2 py-1 border border-[--border] text-[--muted] uppercase tracking-wider"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-6 mt-6">
              <button
                onClick={() => handleSwipe('left')}
                className="w-16 h-16 flex items-center justify-center border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <button
                onClick={() => handleSwipe('up')}
                className="w-20 h-20 flex items-center justify-center border-2 border-[#ffd700] text-[#ffd700] hover:bg-[#ffd700] hover:text-black transition-colors"
              >
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>
              <button
                onClick={() => handleSwipe('right')}
                className="w-16 h-16 flex items-center justify-center border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition-colors"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>

            {/* Progress */}
            <div className="mt-8 text-center">
              <p className="text-xs text-[--muted] tabular-nums">
                {currentIndex + 1} / {albums.length}
              </p>
              <div className="w-full h-1 bg-[--border] mt-2 overflow-hidden">
                <div
                  className="h-full bg-[#ffd700] transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / albums.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-8">
            <div className="text-4xl mb-4">📀</div>
            <p className="text-[--muted]">No more albums to rate right now.</p>
            <button
              onClick={fetchAlbums}
              className="mt-4 px-6 py-2 border border-[--border] text-sm hover:border-white transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
