import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { AlbumCard } from "@/components/album-card"

export const dynamic = "force-dynamic"

async function getUserStats(userId: string) {
  const currentYear = new Date().getFullYear()
  const startOfYear = new Date(currentYear, 0, 1)
  
  // Get all reviews this year
  const reviews = await prisma.review.findMany({
    where: {
      userId,
      createdAt: { gte: startOfYear },
    },
    include: {
      album: {
        select: {
          id: true,
          spotifyId: true,
          title: true,
          artistName: true,
          coverArtUrl: true,
          genres: true,
          averageRating: true,
          totalReviews: true,
        },
      },
    },
    orderBy: { rating: "desc" },
  })

  // Calculate stats
  const totalReviews = reviews.length
  const averageRating = totalReviews > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
    : 0

  // Top albums (highest rated)
  const topAlbums = reviews.slice(0, 5).map(r => ({
    ...r.album,
    userRating: r.rating,
  }))

  // Genre breakdown
  const genreCounts: Record<string, number> = {}
  reviews.forEach(r => {
    r.album.genres.forEach(genre => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1
    })
  })
  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([genre, count]) => ({ genre, count }))

  // Artist breakdown
  const artistCounts: Record<string, number> = {}
  reviews.forEach(r => {
    artistCounts[r.album.artistName] = (artistCounts[r.album.artistName] || 0) + 1
  })
  const topArtists = Object.entries(artistCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([artist, count]) => ({ artist, count }))

  // Rating distribution
  const ratingDistribution = Array(11).fill(0)
  reviews.forEach(r => {
    const bucket = Math.round(r.rating)
    ratingDistribution[bucket]++
  })

  // Monthly activity
  const monthlyActivity = Array(12).fill(0)
  reviews.forEach(r => {
    const month = new Date(r.createdAt).getMonth()
    monthlyActivity[month]++
  })

  // Get user streak data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currentStreak: true, longestStreak: true, waxScore: true },
  })

  return {
    totalReviews,
    averageRating,
    topAlbums,
    topGenres,
    topArtists,
    ratingDistribution,
    monthlyActivity,
    currentStreak: user?.currentStreak || 0,
    longestStreak: user?.longestStreak || 0,
    waxScore: user?.waxScore || 0,
  }
}

export default async function YearInMusicPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/year-in-music")
  }

  const stats = await getUserStats(session.user.id)
  const currentYear = new Date().getFullYear()
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  // Calculate personality based on stats
  const getListenerPersonality = () => {
    if (stats.totalReviews === 0) return { title: "The Newcomer", emoji: "🌱", desc: "Just getting started on your music journey!" }
    if (stats.averageRating >= 8) return { title: "The Optimist", emoji: "☀️", desc: "You love finding the good in every album!" }
    if (stats.averageRating <= 5) return { title: "The Critic", emoji: "🎭", desc: "High standards make for great taste!" }
    if (stats.topGenres.length === 1) return { title: "The Specialist", emoji: "🎯", desc: "Deep expertise in your favorite genre!" }
    if (stats.topGenres.length >= 4) return { title: "The Explorer", emoji: "🧭", desc: "Always discovering new sounds!" }
    return { title: "The Balanced Listener", emoji: "⚖️", desc: "A well-rounded music taste!" }
  }

  const personality = getListenerPersonality()
  const maxMonthly = Math.max(...stats.monthlyActivity, 1)

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 lg:py-8">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-violet-900/50 via-purple-900/40 to-fuchsia-900/30 rounded-2xl p-8 mb-8 overflow-hidden text-center">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5" />
        <div className="relative z-10">
          <p className="text-violet-300 mb-2">Your</p>
          <h1 className="text-4xl lg:text-6xl font-bold mb-2">{currentYear} in Music</h1>
          <p className="text-xl text-[#ccc]">@{session.user.username || session.user.name}</p>
        </div>
      </div>

      {stats.totalReviews === 0 ? (
        <div className="text-center py-12 bg-[#111] border border-[#222] rounded-lg">
          <span className="text-6xl mb-4 block">📝</span>
          <h2 className="text-xl font-bold mb-2">No reviews yet this year!</h2>
          <p className="text-[#888] mb-4">Start reviewing albums to see your Year in Music stats</p>
          <Link
            href="/discover"
            className="inline-block bg-white text-black px-6 py-3 font-bold no-underline hover:bg-gray-100"
          >
            Discover Albums
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Personality Card */}
          <div className="bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 rounded-lg p-6 text-center">
            <span className="text-6xl mb-4 block">{personality.emoji}</span>
            <h2 className="text-2xl font-bold mb-2">{personality.title}</h2>
            <p className="text-[#ccc]">{personality.desc}</p>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#111] border border-[#222] rounded-lg p-4 text-center">
              <p className="text-4xl font-bold text-violet-400">{stats.totalReviews}</p>
              <p className="text-sm text-[#888]">Albums Reviewed</p>
            </div>
            <div className="bg-[#111] border border-[#222] rounded-lg p-4 text-center">
              <p className="text-4xl font-bold text-fuchsia-400">{stats.averageRating.toFixed(1)}</p>
              <p className="text-sm text-[#888]">Average Rating</p>
            </div>
            <div className="bg-[#111] border border-[#222] rounded-lg p-4 text-center">
              <p className="text-4xl font-bold text-pink-400">{stats.longestStreak}</p>
              <p className="text-sm text-[#888]">Longest Streak</p>
            </div>
            <div className="bg-[#111] border border-[#222] rounded-lg p-4 text-center">
              <p className="text-4xl font-bold text-amber-400">{stats.waxScore}</p>
              <p className="text-sm text-[#888]">Wax Score</p>
            </div>
          </div>

          {/* Top Albums */}
          {stats.topAlbums.length > 0 && (
            <div className="bg-[#111] border border-[#222] rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">🏆 Your Top Albums</h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {stats.topAlbums.map((album, index) => (
                  <div key={album.id} className="relative">
                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center text-xs font-bold z-10">
                      {index + 1}
                    </div>
                    <AlbumCard
                      id={album.id}
                      spotifyId={album.spotifyId}
                      title={album.title}
                      artistName={album.artistName}
                      coverArtUrl={album.coverArtUrl}
                      averageRating={album.averageRating}
                      totalReviews={album.totalReviews}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Genres */}
          {stats.topGenres.length > 0 && (
            <div className="bg-[#111] border border-[#222] rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">🎵 Your Top Genres</h2>
              <div className="space-y-3">
                {stats.topGenres.map((item, index) => (
                  <div key={item.genre} className="flex items-center gap-4">
                    <span className="text-2xl w-8">{["🥇", "🥈", "🥉", "4️⃣", "5️⃣"][index]}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium capitalize">{item.genre}</span>
                        <span className="text-[#888]">{item.count} albums</span>
                      </div>
                      <div className="h-2 bg-[#222] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                          style={{ width: `${(item.count / stats.topGenres[0].count) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Artists */}
          {stats.topArtists.length > 0 && (
            <div className="bg-[#111] border border-[#222] rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">🎤 Your Top Artists</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stats.topArtists.map((item, index) => (
                  <div key={item.artist} className="flex items-center gap-3 bg-[#0a0a0a] p-3 rounded-lg">
                    <span className="text-2xl">{["🥇", "🥈", "🥉", "4️⃣", "5️⃣"][index]}</span>
                    <div>
                      <p className="font-medium">{item.artist}</p>
                      <p className="text-sm text-[#888]">{item.count} album{item.count !== 1 ? "s" : ""} reviewed</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monthly Activity */}
          <div className="bg-[#111] border border-[#222] rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">📅 Monthly Activity</h2>
            <div className="flex items-end gap-2 h-32">
              {stats.monthlyActivity.map((count, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className="w-full bg-gradient-to-t from-violet-500 to-fuchsia-500 rounded-t transition-all"
                    style={{ height: `${(count / maxMonthly) * 100}%`, minHeight: count > 0 ? "8px" : "0" }}
                  />
                  <span className="text-xs text-[#666]">{months[index]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="bg-[#111] border border-[#222] rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">⭐ Rating Distribution</h2>
            <div className="space-y-2">
              {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map((rating) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="w-8 text-right text-sm text-[#888]">{rating}</span>
                  <div className="flex-1 h-4 bg-[#222] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${(stats.ratingDistribution[rating] / Math.max(...stats.ratingDistribution, 1)) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-sm text-[#888]">{stats.ratingDistribution[rating]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Share Card */}
          <div className="bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Share Your Year in Music</h2>
            <p className="text-[#888] mb-4">Show off your music taste to friends!</p>
            <button className="bg-white text-black px-6 py-3 font-bold hover:bg-gray-100 transition-colors">
              📸 Generate Share Image
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
