"use client"

import { useState, useRef, useEffect } from "react"

interface Track {
  id: string
  name: string
  trackNumber: number
  durationMs: number
  previewUrl: string | null
  spotifyUrl: string | null
}

interface TrackPlayerProps {
  tracks: Track[]
  albumTitle: string
  artistName: string
  coverArtUrl: string | null
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

export function TrackPlayer({ tracks, albumTitle, artistName, coverArtUrl }: TrackPlayerProps) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100)
      }
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(0)
      // Auto-play next track with preview
      if (currentTrack) {
        const currentIndex = tracks.findIndex(t => t.id === currentTrack.id)
        const nextTrack = tracks.slice(currentIndex + 1).find(t => t.previewUrl)
        if (nextTrack) {
          playTrack(nextTrack)
        } else {
          setCurrentTrack(null)
        }
      }
    }

    audio.addEventListener("timeupdate", updateProgress)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", updateProgress)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [currentTrack, tracks])

  const playTrack = (track: Track) => {
    if (!track.previewUrl) return

    if (currentTrack?.id === track.id && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
      return
    }

    setCurrentTrack(track)
    setProgress(0)

    if (audioRef.current) {
      audioRef.current.src = track.previewUrl
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const tracksWithPreviews = tracks.filter(t => t.previewUrl)

  return (
    <div className="border border-[#222] bg-[#0a0a0a]">
      <audio ref={audioRef} className="hidden" />

      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b border-[#222]">
        <div className="text-xs text-[#888]">
          {tracksWithPreviews.length} / {tracks.length} tracks with previews
        </div>
      </div>

      {/* Track List */}
      <div className="max-h-[400px] overflow-y-auto">
        {tracks.map((track) => {
          const isActive = currentTrack?.id === track.id
          const hasPreview = !!track.previewUrl

          return (
            <div
              key={track.id}
              className={`flex items-center gap-3 px-3 py-2 border-b border-[#181818] last:border-0 ${
                hasPreview ? "cursor-pointer hover:bg-[#181818]" : "opacity-50"
              } ${isActive ? "bg-[#181818]" : ""}`}
              onClick={() => hasPreview && playTrack(track)}
            >
              {/* Track Number / Play Button */}
              <div className="w-8 text-center">
                {hasPreview ? (
                  isActive && isPlaying ? (
                    <svg className="w-4 h-4 mx-auto text-white" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 mx-auto text-[#888] group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )
                ) : (
                  <span className="text-xs text-[#666]">{track.trackNumber}</span>
                )}
              </div>

              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${isActive ? "text-white" : "text-[#ccc]"}`}>
                  {track.name}
                </p>
                {isActive && (
                  <div className="mt-1 h-1 bg-[#333] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Duration */}
              <div className="text-xs text-[#666]">
                {formatDuration(track.durationMs)}
              </div>

              {/* Spotify Link */}
              {track.spotifyUrl && (
                <a
                  href={track.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1DB954] hover:text-[#1ed760] p-1"
                  onClick={(e) => e.stopPropagation()}
                  title="Open in Spotify"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                </a>
              )}
            </div>
          )
        })}
      </div>

      {/* Now Playing Bar */}
      {currentTrack && (
        <div className="flex items-center gap-3 p-3 border-t border-[#222] bg-[#111]">
          {coverArtUrl && (
            <img src={coverArtUrl} alt="" className="w-10 h-10 object-cover" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{currentTrack.name}</p>
            <p className="text-xs text-[#888] truncate">{artistName}</p>
          </div>
          <button
            onClick={() => playTrack(currentTrack)}
            className="w-8 h-8 flex items-center justify-center bg-white rounded-full hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
