import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { format } from "date-fns"
import { AlbumCard } from "@/components/album-card"

export const dynamic = "force-dynamic"

// HomeBRU Show Data - In production, this would come from a CMS or database
const HOMEBRU_EPISODES = [
  {
    id: "ep-latest",
    title: "HomeBRU Live: New Year New Sounds",
    date: new Date("2026-01-10T20:00:00"),
    description: "Kicking off 2026 with the hottest new releases and underground gems",
    spotifyPlaylistUrl: "https://open.spotify.com/playlist/example",
    duration: "2h 30m",
    hosts: ["DJ Homebase", "Melody Maven"],
    isLive: false,
  },
  {
    id: "ep-2",
    title: "Best of 2025 Recap",
    date: new Date("2025-12-27T20:00:00"),
    description: "Looking back at the albums that defined 2025",
    spotifyPlaylistUrl: "https://open.spotify.com/playlist/example2",
    duration: "3h 00m",
    hosts: ["DJ Homebase"],
    isLive: false,
  },
  {
    id: "ep-3",
    title: "Underground Fridays Vol. 52",
    date: new Date("2025-12-20T20:00:00"),
    description: "Hidden gems and upcoming artists you need to know",
    spotifyPlaylistUrl: "https://open.spotify.com/playlist/example3",
    duration: "2h 00m",
    hosts: ["Melody Maven", "Beat Architect"],
    isLive: false,
  },
]

async function getHomeBRUPicks() {
  // Get staff-picked albums (albums with high ratings from verified users)
  try {
    const picks = await prisma.album.findMany({
      where: {
        totalReviews: { gte: 1 },
        averageRating: { gte: 7 },
        albumType: { not: "single" },
      },
      orderBy: { averageRating: "desc" },
      take: 8,
      select: {
        id: true,
        spotifyId: true,
        title: true,
        artistName: true,
        coverArtUrl: true,
        averageRating: true,
        totalReviews: true,
      },
    })
    return picks
  } catch {
    return []
  }
}

async function getRelatedChannel() {
  try {
    return await prisma.channel.findUnique({
      where: { slug: "homebru" },
      select: { id: true, slug: true, memberCount: true, messageCount: true },
    })
  } catch {
    return null
  }
}

export default async function HomeBRUPage() {
  const [staffPicks, channel] = await Promise.all([
    getHomeBRUPicks(),
    getRelatedChannel(),
  ])

  const nextEpisode = HOMEBRU_EPISODES[0]
  const pastEpisodes = HOMEBRU_EPISODES.slice(1)

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-amber-900/40 via-orange-900/30 to-yellow-900/20 rounded-2xl p-8 mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">📻</span>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold">HomeBRU</h1>
              <p className="text-amber-200/80">Your weekly home for fresh brews and fresher beats</p>
            </div>
          </div>
          
          <p className="text-lg text-[#ccc] max-w-2xl mb-6">
            Every Friday night, we serve up the hottest tracks, underground discoveries, 
            and in-depth music discussions. Tune in live or catch up on past episodes.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href={channel ? `/community/channel/${channel.slug}` : "/community"}
              className="flex items-center gap-2 bg-amber-500 text-black px-6 py-3 font-bold rounded-lg hover:bg-amber-400 transition-colors no-underline"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Join the Chat
            </Link>
            <Link
              href="/live"
              className="flex items-center gap-2 border-2 border-amber-500/50 text-amber-200 px-6 py-3 font-bold rounded-lg hover:bg-amber-500/10 transition-colors no-underline"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Live Events
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Latest Episode */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-amber-500">▶</span> Latest Episode
            </h2>
            <div className="bg-[#111] border border-[#222] rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold mb-1">{nextEpisode.title}</h3>
                  <p className="text-sm text-[#888]">
                    {format(nextEpisode.date, "MMMM d, yyyy")} • {nextEpisode.duration}
                  </p>
                </div>
                {nextEpisode.isLive && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                    LIVE NOW
                  </span>
                )}
              </div>
              <p className="text-[#ccc] mb-4">{nextEpisode.description}</p>
              <div className="flex items-center gap-4 text-sm text-[#888] mb-4">
                <span>Hosted by: {nextEpisode.hosts.join(", ")}</span>
              </div>
              <div className="flex gap-3">
                <a
                  href={nextEpisode.spotifyPlaylistUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#1DB954] text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-[#1ed760] transition-colors no-underline"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  Listen on Spotify
                </a>
              </div>
            </div>
          </section>

          {/* Past Episodes */}
          <section>
            <h2 className="text-xl font-bold mb-4">Past Episodes</h2>
            <div className="space-y-3">
              {pastEpisodes.map((episode) => (
                <div
                  key={episode.id}
                  className="bg-[#111] border border-[#222] rounded-lg p-4 hover:border-[#444] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">{episode.title}</h3>
                      <p className="text-sm text-[#888]">
                        {format(episode.date, "MMM d, yyyy")} • {episode.duration}
                      </p>
                    </div>
                    <a
                      href={episode.spotifyPlaylistUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1DB954] hover:underline text-sm no-underline"
                    >
                      Playlist →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Staff Picks */}
          {staffPicks.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">🏆 HomeBRU Staff Picks</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {staffPicks.map((album) => (
                  <AlbumCard
                    key={album.id}
                    id={album.id}
                    spotifyId={album.spotifyId}
                    title={album.title}
                    artistName={album.artistName}
                    coverArtUrl={album.coverArtUrl}
                    averageRating={album.averageRating}
                    totalReviews={album.totalReviews}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Show Schedule */}
          <div className="bg-[#111] border border-[#222] rounded-lg p-4">
            <h3 className="font-bold mb-4">📅 Show Schedule</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-amber-500 font-bold">FRI</span>
                </div>
                <div>
                  <p className="font-medium">Friday Night Live</p>
                  <p className="text-sm text-[#888]">8:00 PM - 11:00 PM EST</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-blue-500 font-bold">SUN</span>
                </div>
                <div>
                  <p className="font-medium">Sunday Sessions</p>
                  <p className="text-sm text-[#888]">2:00 PM - 4:00 PM EST</p>
                </div>
              </div>
            </div>
          </div>

          {/* Community Stats */}
          {channel && (
            <div className="bg-[#111] border border-[#222] rounded-lg p-4">
              <h3 className="font-bold mb-4">💬 Community</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-[#0a0a0a] rounded">
                  <p className="text-2xl font-bold">{channel.memberCount}</p>
                  <p className="text-xs text-[#888]">Members</p>
                </div>
                <div className="text-center p-3 bg-[#0a0a0a] rounded">
                  <p className="text-2xl font-bold">{channel.messageCount}</p>
                  <p className="text-xs text-[#888]">Messages</p>
                </div>
              </div>
              <Link
                href={`/community/channel/${channel.slug}`}
                className="block w-full text-center bg-amber-500 text-black py-2 font-bold rounded hover:bg-amber-400 transition-colors no-underline"
              >
                Join Discussion
              </Link>
            </div>
          )}

          {/* Quick Links */}
          <div className="bg-[#111] border border-[#222] rounded-lg p-4">
            <h3 className="font-bold mb-4">🔗 Quick Links</h3>
            <div className="space-y-2">
              <Link href="/avdp" className="flex items-center gap-2 p-2 hover:bg-[#181818] rounded transition-colors no-underline text-sm">
                <span>🎙️</span> AVDP Podcast
              </Link>
              <Link href="/live" className="flex items-center gap-2 p-2 hover:bg-[#181818] rounded transition-colors no-underline text-sm">
                <span>🔴</span> Live Events
              </Link>
              <Link href="/dj-feed" className="flex items-center gap-2 p-2 hover:bg-[#181818] rounded transition-colors no-underline text-sm">
                <span>🎧</span> DJFeed
              </Link>
              <Link href="/community" className="flex items-center gap-2 p-2 hover:bg-[#181818] rounded transition-colors no-underline text-sm">
                <span>📢</span> Community Hub
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
