import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { format } from "date-fns"
import { AlbumCard } from "@/components/album-card"

export const dynamic = "force-dynamic"

// AVDP Episodes - In production from CMS/database
const AVDP_EPISODES = [
  {
    id: "avdp-latest",
    number: 156,
    title: "The State of Hip-Hop in 2026",
    date: new Date("2026-01-08"),
    description: "We dive deep into where hip-hop is headed, discussing the rise of AI production, the return of conscious rap, and who's really running the game right now.",
    duration: "1h 45m",
    guests: ["Music Critic X", "Producer Y"],
    topics: ["Hip-Hop", "Industry", "AI in Music"],
    spotifyUrl: "https://open.spotify.com/episode/example",
    youtubeUrl: "https://youtube.com/watch?v=example",
  },
  {
    id: "avdp-2",
    number: 155,
    title: "Album Deep Dive: Kendrick's New Era",
    date: new Date("2026-01-01"),
    description: "Breaking down every track, every bar, and every hidden meaning in Kendrick Lamar's latest project.",
    duration: "2h 15m",
    guests: [],
    topics: ["Kendrick Lamar", "Album Review", "Lyricism"],
    spotifyUrl: "https://open.spotify.com/episode/example2",
    youtubeUrl: "https://youtube.com/watch?v=example2",
  },
  {
    id: "avdp-3",
    number: 154,
    title: "2025 Year in Review",
    date: new Date("2025-12-25"),
    description: "Our comprehensive breakdown of the year's best albums, biggest disappointments, and most slept-on releases.",
    duration: "3h 00m",
    guests: ["The Whole Crew"],
    topics: ["Year End", "Best Of", "Rankings"],
    spotifyUrl: "https://open.spotify.com/episode/example3",
    youtubeUrl: "https://youtube.com/watch?v=example3",
  },
]

async function getDiscussedAlbums() {
  try {
    // Get recent highly-discussed albums
    const albums = await prisma.album.findMany({
      where: {
        totalReviews: { gte: 2 },
        albumType: { not: "single" },
      },
      orderBy: { totalReviews: "desc" },
      take: 6,
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
    return albums
  } catch {
    return []
  }
}

export default async function AVDPPage() {
  const discussedAlbums = await getDiscussedAlbums()
  const latestEpisode = AVDP_EPISODES[0]
  const pastEpisodes = AVDP_EPISODES.slice(1)

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
      {/* Hero Section */}
      <div className="border-b border-gray-200 pb-8 mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-black mb-2">AVDP</h1>
        <p className="text-gray-500 mb-4">A Very Distant Perspective — Deep dives into music that matters</p>
        
        <p className="text-gray-600 max-w-2xl mb-6">
          The podcast where we take a step back and really analyze the music. 
          No hot takes, no clickbait – just thoughtful discussion about albums, 
          artists, and the culture.
        </p>

        <div className="flex flex-wrap gap-3">
          <a
            href={latestEpisode.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-black text-white px-6 py-3 font-bold hover:bg-gray-800 transition-colors no-underline"
          >
            Spotify
          </a>
          <a
            href={latestEpisode.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-black text-black px-6 py-3 font-bold hover:bg-gray-100 transition-colors no-underline"
          >
            YouTube
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Latest Episode */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              Latest Episode
            </h2>
            <div className="bg-gray-50 border border-gray-200  p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded">
                  EP {latestEpisode.number}
                </span>
                <span className="text-sm text-gray-500">
                  {format(latestEpisode.date, "MMMM d, yyyy")}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">{latestEpisode.title}</h3>
              <p className="text-gray-600 mb-4">{latestEpisode.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {latestEpisode.topics.map((topic) => (
                  <span key={topic} className="bg-gray-200 text-gray-500 text-xs px-2 py-1 rounded">
                    {topic}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span>{latestEpisode.duration}</span>
                {latestEpisode.guests.length > 0 && (
                  <span>Guests: {latestEpisode.guests.join(", ")}</span>
                )}
              </div>

              <div className="flex gap-3">
                <a
                  href={latestEpisode.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-black text-white px-4 py-2  text-sm font-bold hover:bg-gray-800 transition-colors no-underline"
                >
                  Spotify
                </a>
                <a
                  href={latestEpisode.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 border border-black text-black px-4 py-2 text-sm font-bold hover:bg-gray-100 transition-colors no-underline"
                >
                  YouTube
                </a>
              </div>
            </div>
          </section>

          {/* Episode Archive */}
          <section>
            <h2 className="text-xl font-bold mb-4">Episode Archive</h2>
            <div className="space-y-3">
              {pastEpisodes.map((episode) => (
                <div
                  key={episode.id}
                  className="bg-gray-50 border border-gray-200  p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-600 text-sm font-bold">EP {episode.number}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-500">{format(episode.date, "MMM d, yyyy")}</span>
                      </div>
                      <h3 className="font-bold mb-1">{episode.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2">{episode.description}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <a
                        href={episode.spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black hover:text-[#1ed760] p-2"
                        title="Listen on Spotify"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02z"/>
                        </svg>
                      </a>
                      <a
                        href={episode.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-black p-2"
                        title="Watch on YouTube"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-3 border border-gray-300 text-gray-500 hover:text-black hover:border-[#555] transition-colors ">
              Load More Episodes
            </button>
          </section>

          {/* Recently Discussed Albums */}
          {discussedAlbums.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Recently Discussed</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {discussedAlbums.map((album) => (
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
          {/* About */}
          <div className="bg-gray-50 border border-gray-200  p-4">
            <h3 className="font-bold mb-4">About AVDP</h3>
            <p className="text-sm text-gray-500 mb-4">
              A Very Distant Perspective is a music podcast that goes beyond surface-level reviews. 
              We analyze albums track-by-track, explore artist histories, and discuss the cultural 
              impact of music.
            </p>
            <div className="flex gap-2">
              
              
              <span className="text-2xl"></span>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gray-50 border border-gray-200  p-4">
            <h3 className="font-bold mb-4">Podcast Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-100 rounded">
                <p className="text-2xl font-bold text-gray-600">156</p>
                <p className="text-xs text-gray-500">Episodes</p>
              </div>
              <div className="text-center p-3 bg-gray-100 rounded">
                <p className="text-2xl font-bold text-gray-600">50K+</p>
                <p className="text-xs text-gray-500">Listeners</p>
              </div>
            </div>
          </div>

          {/* Subscribe */}
          <div className="bg-gray-50 border border-gray-200  p-4">
            <h3 className="font-bold mb-4">Subscribe</h3>
            <div className="space-y-2">
              <a
                href="https://open.spotify.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-black/10  hover:bg-black/20 transition-colors no-underline"
              >
                <svg className="w-6 h-6 text-black" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02z"/>
                </svg>
                <span className="font-medium">Spotify</span>
              </a>
              <a
                href="https://podcasts.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 transition-colors no-underline"
              >
                
                <span className="font-medium">Apple Podcasts</span>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 transition-colors no-underline"
              >
                <svg className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
                </svg>
                <span className="font-medium">YouTube</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-gray-50 border border-gray-200  p-4">
            <h3 className="font-bold mb-4">More Content</h3>
            <div className="space-y-2">
              <Link href="/homebru" className="flex items-center gap-2 p-2 hover:bg-gray-100 transition-colors no-underline text-sm">
                HomeBRU Radio
              </Link>
              <Link href="/dj-feed" className="flex items-center gap-2 p-2 hover:bg-gray-100 transition-colors no-underline text-sm">
                DJFeed
              </Link>
              <Link href="/community" className="flex items-center gap-2 p-2 hover:bg-gray-100 transition-colors no-underline text-sm">
                Community
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
