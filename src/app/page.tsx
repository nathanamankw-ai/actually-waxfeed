import { prisma } from "@/lib/prisma"
import { ReviewCard } from "@/components/review-card"
import { DefaultAvatar } from "@/components/default-avatar"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { formatDistanceToNow } from "date-fns"

// Use dynamic rendering for auth but cache expensive queries
export const dynamic = "force-dynamic"

// Get recent reviews - no caching to avoid serialization issues
async function getRecentReviews() {
  try {
    return await prisma.review.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          image: true,
          isVerified: true,
        },
      },
      album: {
        select: {
          id: true,
          spotifyId: true,
          title: true,
          artistName: true,
          coverArtUrl: true,
        },
      },
      _count: {
        select: { replies: true },
      },
    },
  })
  } catch {
    return []
  }
}

async function getFriendsActivity(userId: string | undefined) {
  if (!userId) return []

  try {
  // Get users the current user is friends with
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { user1Id: userId },
        { user2Id: userId },
      ],
    },
    select: { user1Id: true, user2Id: true },
  })

  // Extract friend IDs (the other person in each friendship)
  const friendIds = friendships.map(f =>
    f.user1Id === userId ? f.user2Id : f.user1Id
  )

  if (friendIds.length === 0) return []

  // Get recent reviews from friends
    return await prisma.review.findMany({
    where: { userId: { in: friendIds } },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          image: true,
          isVerified: true,
        },
      },
      album: {
        select: {
          id: true,
          spotifyId: true,
          title: true,
          artistName: true,
          coverArtUrl: true,
        },
      },
    },
  })
  } catch {
    return []
  }
}

// Get top albums
async function getTopAlbums() {
  try {
  // Get Billboard chart albums sorted by rank
  // CRITICAL: NEVER show singles
    return await prisma.album.findMany({
    take: 12,
    where: {
      billboardRank: { not: null },
      albumType: { not: 'single' }
    },
    orderBy: { billboardRank: "asc" },
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
  } catch {
    return []
  }
}

// Get featured album (highest rated or most reviewed)
async function getFeaturedAlbum() {
  try {
    return await prisma.album.findFirst({
      where: {
        billboardRank: 1,
        albumType: { not: 'single' }
      },
      select: {
        id: true,
        spotifyId: true,
        title: true,
        artistName: true,
        coverArtUrl: true,
        coverArtUrlLarge: true,
        averageRating: true,
        totalReviews: true,
        genres: true,
      },
    })
  } catch {
    return null
  }
}

// Get stats
async function getStats() {
  try {
  const [albumCount, reviewCount, userCount] = await Promise.all([
    // CRITICAL: Only count albums (not singles)
    prisma.album.count({ where: { albumType: { not: 'single' } } }),
    prisma.review.count(),
    prisma.user.count(),
  ])
  return { albumCount, reviewCount, userCount }
  } catch {
    return { albumCount: 0, reviewCount: 0, userCount: 0 }
  }
}

export default async function Home() {
  const session = await auth()
  const [reviews, albums, stats, friendsActivity, featured] = await Promise.all([
    getRecentReviews(),
    getTopAlbums(),
    getStats(),
    getFriendsActivity(session?.user?.id),
    getFeaturedAlbum(),
  ])

  return (
    <div className="min-h-screen">
      {/* Hero Section - Editorial Magazine Style */}
      <section className="border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 py-12 lg:py-20">
          {/* Tagline with Off-White style quotes */}
          <div className="mb-12 lg:mb-16">
            <div className="flex items-center gap-3 mb-2">
              <p className="text-xs tracking-[0.3em] text-gray-500">WAXFEED™ — SINCE 2024</p>
              <Link 
                href="/demo" 
                className="text-[9px] tracking-[0.15em] border border-gray-400 px-2 py-0.5 text-gray-500 hover:text-black hover:border-black transition-colors no-underline"
              >
                TRY OUR DEMO
              </Link>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-none mb-4">
              "RATE"
              <br />
              <span className="text-gray-400">"DISCOVER"</span>
              <br />
              "SHARE"
            </h1>
            <p className="text-sm lg:text-base text-gray-600 max-w-md mt-6">
              A social music review platform. Rate albums, build lists, discover new music through friends.
            </p>
          </div>

          {/* Stats - Industrial Typography */}
          <div className="flex flex-wrap gap-8 lg:gap-16">
            <div className="group">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl lg:text-7xl font-bold tracking-tighter">{stats.albumCount.toLocaleString()}</span>
                <span className="text-xs text-gray-400 tracking-widest">→</span>
              </div>
              <p className="text-[10px] tracking-[0.2em] text-gray-500 mt-1">"ALBUMS"</p>
            </div>
            <div className="group">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl lg:text-7xl font-bold tracking-tighter">{stats.reviewCount.toLocaleString()}</span>
                <span className="text-xs text-gray-400 tracking-widest">→</span>
              </div>
              <p className="text-[10px] tracking-[0.2em] text-gray-500 mt-1">"REVIEWS"</p>
            </div>
            <div className="group">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl lg:text-7xl font-bold tracking-tighter">{stats.userCount.toLocaleString()}</span>
                <span className="text-xs text-gray-400 tracking-widest">→</span>
              </div>
              <p className="text-[10px] tracking-[0.2em] text-gray-500 mt-1">"USERS"</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Album - Magazine Cover Style */}
      {featured && (
        <section className="border-b-2 border-black bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Album Art - Full Bleed */}
              <Link 
                href={`/album/${featured.spotifyId || featured.id}`}
                className="relative aspect-square lg:aspect-auto lg:h-[600px] overflow-hidden group"
              >
                {featured.coverArtUrlLarge || featured.coverArtUrl ? (
                  <img
                    src={featured.coverArtUrlLarge || featured.coverArtUrl || ""}
                    alt={featured.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No Cover</span>
                  </div>
                )}
                {/* Diagonal stripe accent */}
                <div className="absolute top-4 left-4 bg-black text-white px-3 py-1">
                  <span className="text-[10px] tracking-[0.2em]">#1 ON BILLBOARD</span>
                </div>
              </Link>

              {/* Album Info - Editorial Layout */}
              <div className="p-6 lg:p-12 flex flex-col justify-center">
                <p className="text-[10px] tracking-[0.3em] text-gray-500 mb-4">FEATURED</p>
                <h2 className="text-3xl lg:text-5xl font-bold tracking-tight mb-2 leading-tight">
                  "{featured.title}"
                </h2>
                <p className="text-lg lg:text-xl text-gray-600 mb-6">{featured.artistName}</p>
                
                {featured.genres && featured.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {featured.genres.slice(0, 3).map((genre) => (
                      <span key={genre} className="text-[10px] tracking-[0.15em] border border-black px-2 py-1">
                        {genre.toUpperCase()}
                      </span>
                    ))}
                  </div>
                )}

                {featured.averageRating !== null && (
                  <div className="mb-8">
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl lg:text-8xl font-bold">{featured.averageRating.toFixed(1)}</span>
                      <span className="text-2xl text-gray-400">/10</span>
                    </div>
                    <p className="text-[10px] tracking-[0.2em] text-gray-500 mt-1">
                      {featured.totalReviews} {featured.totalReviews === 1 ? 'REVIEW' : 'REVIEWS'}
                    </p>
                  </div>
                )}

                <Link 
                  href={`/album/${featured.spotifyId || featured.id}`}
                  className="inline-flex items-center gap-3 bg-black text-white px-6 py-4 text-sm tracking-[0.1em] hover:bg-gray-900 transition-colors w-fit no-underline"
                >
                  VIEW ALBUM
                  <span className="text-lg">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Friends Activity - Horizontal Scroll */}
      {session && friendsActivity.length > 0 && (
        <section className="border-b-2 border-black py-8 lg:py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[10px] tracking-[0.3em] text-gray-500">"FRIENDS ACTIVITY"</h2>
            </div>
            <div className="flex gap-4 lg:gap-6 overflow-x-auto pb-4 -mx-4 px-4">
              {friendsActivity.map((review) => (
                <Link
                  key={review.id}
                  href={`/album/${review.album.spotifyId || review.album.id}`}
                  className="flex-shrink-0 w-40 lg:w-52 group no-underline"
                >
                  <div className="aspect-square bg-gray-100 mb-3 overflow-hidden border border-gray-200">
                    {review.album.coverArtUrl ? (
                      <img
                        src={review.album.coverArtUrl}
                        alt={review.album.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                        No Cover
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {review.user.image ? (
                      <img
                        src={review.user.image}
                        alt={review.user.username || ""}
                        className="w-5 h-5 border border-black"
                      />
                    ) : (
                      <DefaultAvatar size="xs" />
                    )}
                    <span className="text-xs text-gray-600 truncate">{review.user.username}</span>
                    <span className="text-xs font-bold ml-auto">{review.rating}</span>
                  </div>
                  <p className="text-sm font-medium truncate">{review.album.title}</p>
                  <p className="text-[10px] text-gray-500 tracking-wide">
                    {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true }).toUpperCase()}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content - Editorial Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Top Albums - Magazine Grid */}
          <section className="lg:col-span-7">
            <div className="flex items-center justify-between mb-6 lg:mb-8 pb-4 border-b border-black">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">"TOP ALBUMS"</h2>
                <p className="text-[10px] tracking-[0.2em] text-gray-500 mt-1">BILLBOARD 200 CHART</p>
              </div>
              <Link 
                href="/trending" 
                className="text-xs tracking-[0.1em] text-gray-500 hover:text-black no-underline flex items-center gap-2"
              >
                VIEW ALL <span>→</span>
              </Link>
            </div>

            {albums.length === 0 ? (
              <p className="text-gray-500 text-sm">No albums yet.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 lg:gap-4">
                {albums.map((album, index) => (
                  <Link
                    key={album.id}
                    href={`/album/${album.spotifyId || album.id}`}
                    className="group relative no-underline"
                  >
                    <div className="aspect-square bg-gray-100 overflow-hidden border border-gray-200 group-hover:border-black transition-colors">
                      {album.coverArtUrl ? (
                        <img
                          src={album.coverArtUrl}
                          alt={album.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Cover
                        </div>
                      )}
                    </div>
                    {/* Rank badge - Off-White zip-tie style */}
                    <div className="absolute -top-1 -left-1 bg-black text-white w-6 h-6 flex items-center justify-center">
                      <span className="text-[10px] font-bold">{index + 1}</span>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs font-medium truncate">{album.title}</p>
                      <p className="text-[10px] text-gray-500 truncate">{album.artistName}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Recent Reviews - Editorial Style */}
          <section className="lg:col-span-5">
            <div className="flex items-center justify-between mb-6 lg:mb-8 pb-4 border-b border-black">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">"REVIEWS"</h2>
                <p className="text-[10px] tracking-[0.2em] text-gray-500 mt-1">LATEST FROM THE COMMUNITY</p>
              </div>
              <Link 
                href="/reviews" 
                className="text-xs tracking-[0.1em] text-gray-500 hover:text-black no-underline flex items-center gap-2"
              >
                VIEW ALL <span>→</span>
              </Link>
            </div>

            {reviews.length === 0 ? (
              <div className="border-2 border-black p-8 text-center">
                <p className="text-gray-500 text-sm">No reviews yet.</p>
                <p className="text-[10px] tracking-[0.2em] text-gray-400 mt-2">
                  BE THE FIRST TO REVIEW AN ALBUM
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.slice(0, 6).map((review) => (
                  <ReviewCard
                    key={review.id}
                    id={review.id}
                    rating={review.rating}
                    text={review.text}
                    createdAt={review.createdAt}
                    isEdited={review.isEdited}
                    likeCount={review.likeCount}
                    replyCount={review._count.replies}
                    user={review.user}
                    album={review.album}
                    compact
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Footer - Minimal */}
      <footer className="border-t-2 border-black py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <p className="text-[10px] tracking-[0.3em] text-gray-500 mb-2">"CONTACT"</p>
              <p className="text-sm">scrolling@waxfeed.com</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] tracking-[0.3em] text-gray-500 mb-2">"BROADCAST"</p>
              <p className="text-sm">WBRU © 2025 · BROWN BROADCASTING SERVICE, INC.</p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-[10px] tracking-[0.2em] text-gray-400 text-center">
              WAXFEED™ — "FOR THOSE WHO KNOW"
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
