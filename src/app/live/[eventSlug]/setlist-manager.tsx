"use client"

import { useState } from "react"
import { format } from "date-fns"

interface SetlistTrack {
  id: string
  trackName: string | null
  artistName: string | null
  position: number
  playedAt: Date | null
}

interface SetlistManagerProps {
  eventId: string
  eventSlug: string
  initialSetlist: SetlistTrack[]
  isHost: boolean
  isLive: boolean
}

export function SetlistManager({
  eventId,
  eventSlug,
  initialSetlist,
  isHost,
  isLive,
}: SetlistManagerProps) {
  const [setlist, setSetlist] = useState<SetlistTrack[]>(initialSetlist)
  const [isAdding, setIsAdding] = useState(false)
  const [trackName, setTrackName] = useState("")
  const [artistName, setArtistName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackName.trim()) return

    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/live/${eventSlug}/setlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackName: trackName.trim(),
          artistName: artistName.trim() || null,
        }),
      })

      if (res.ok) {
        const newTrack = await res.json()
        setSetlist((prev) => [...prev, newTrack])
        setTrackName("")
        setArtistName("")
        setIsAdding(false)
      }
    } catch (error) {
      console.error("Error adding track:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gray-50 border border-gray-200  p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold"> Setlist ({setlist.length} tracks)</h3>
        {isHost && isLive && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="text-sm text-black hover:text-gray-600"
          >
            {isAdding ? "Cancel" : "+ Add Track"}
          </button>
        )}
      </div>

      {/* Add Track Form */}
      {isAdding && (
        <form onSubmit={handleAddTrack} className="mb-4 p-3 bg-gray-100 ">
          <input
            type="text"
            value={trackName}
            onChange={(e) => setTrackName(e.target.value)}
            placeholder="Track name"
            className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-sm mb-2 focus:outline-none focus:border-[#555]"
          />
          <input
            type="text"
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
            placeholder="Artist name (optional)"
            className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-sm mb-2 focus:outline-none focus:border-[#555]"
          />
          <button
            type="submit"
            disabled={isSubmitting || !trackName.trim()}
            className="w-full bg-black text-white py-2 font-bold text-sm hover:bg-gray-800 disabled:opacity-50"
          >
            {isSubmitting ? "Adding..." : "Add to Setlist"}
          </button>
        </form>
      )}

      {/* Setlist */}
      {setlist.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">
          {isLive ? "No tracks played yet" : "Setlist not available"}
        </p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {setlist.map((track, index) => (
            <div
              key={track.id}
              className="flex items-center gap-3 p-2 bg-gray-100 rounded"
            >
              <span className="text-gray-400 w-6 text-right text-sm">{index + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {track.trackName || "Unknown Track"}
                </p>
                {track.artistName && (
                  <p className="text-xs text-gray-500 truncate">{track.artistName}</p>
                )}
              </div>
              <span className="text-xs text-gray-400">
                {track.playedAt ? format(new Date(track.playedAt), "h:mm a") : "-"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Now Playing Indicator */}
      {isLive && setlist.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full  bg-green-400 opacity-75"></span>
              <span className="relative inline-flex  h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-sm text-green-500">Now Playing</span>
          </div>
          <p className="font-bold mt-1">{setlist[setlist.length - 1]?.trackName}</p>
          {setlist[setlist.length - 1]?.artistName && (
            <p className="text-sm text-gray-500">{setlist[setlist.length - 1]?.artistName}</p>
          )}
        </div>
      )}
    </div>
  )
}
