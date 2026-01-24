import { prisma } from "@/lib/prisma"
import { DefaultAvatar } from "@/components/default-avatar"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { format, formatDistanceToNow } from "date-fns"

export const dynamic = "force-dynamic"

// Get Billboard 200 trending albums
async function getBillboardAlbums() {
  return prisma.album.findMany({
    where: {
      billboardRank: { not: null },
      albumType: { not: 'single' },
    },
    orderBy: {
      billboardRank: 'asc'
    },
    take: 50,
    select: {
      id: true,
      spotifyId: true,
      title: true,
      artistName: true,
      coverArtUrl: true,
      coverArtUrlLarge: true,
      averageRating: true,
      totalReviews: true,
      billboardRank: true,
    },
  })
}

// Get recent reviews
async function getRecentReviews() {
  return prisma.review.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          image: true,
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
}

// Get stats
async function getStats() {
  const [albumCount, reviewCount, userCount] = await Promise.all([
    prisma.album.count({ where: { albumType: { not: 'single' } } }),
    prisma.review.count(),
    prisma.user.count(),
  ])
  return { albumCount, reviewCount, userCount }
}

// Get active users to connect with (for logged out users or new users)
async function getActiveUsers(excludeUserId?: string) {
  return prisma.user.findMany({
    where: {
      id: excludeUserId ? { not: excludeUserId } : undefined,
      username: { not: null },
      reviews: { some: {} }, // Users who have at least one review
    },
    orderBy: [
      { reviews: { _count: 'desc' } },
    ],
    take: 8,
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
      tasteId: {
        select: {
          primaryArchetype: true,
        }
      },
      _count: {
        select: { reviews: true }
      }
    }
  })
}

export default async function Home() {
  const session = await auth()
  const [billboardAlbums, recentReviews, stats, activeUsers] = await Promise.all([
    getBillboardAlbums(),
    getRecentReviews(),
    getStats(),
    getActiveUsers(session?.user?.id),
  ])
  const weekOf = format(new Date(), "MMM d, yyyy")

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Header section */}
      <section style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <p className="text-base md:text-lg lg:text-xl font-medium leading-relaxed max-w-2xl">
              Discover music & friends tailored to you. Rate albums, reveal your TasteID, connect with your musical twins.
            </p>
            <div className="flex-shrink-0 lg:text-right">
              <p className="text-[10px] tracking-[0.3em] uppercase text-[--muted] mb-1 font-medium">
                Week Of
              </p>
              <p className="text-2xl lg:text-3xl font-medium tracking-wide">
                {weekOf}
              </p>
            </div>
          </div>

          {!session && (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 mt-8 px-5 py-3 bg-white text-black text-[12px] uppercase tracking-[0.1em] font-medium hover:bg-[#e5e5e5] transition-colors"
            >
              Get Started
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          )}
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-[--border]">
        <div className="max-w-7xl mx-auto px-6 py-5 flex gap-8 lg:gap-12">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl lg:text-2xl font-light tabular-nums">{stats.albumCount.toLocaleString()}</span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-[--muted]">Albums</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl lg:text-2xl font-light tabular-nums">{stats.reviewCount.toLocaleString()}</span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-[--muted]">Reviews</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl lg:text-2xl font-light tabular-nums">{stats.userCount.toLocaleString()}</span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-[--muted]">Users</span>
          </div>
        </div>
      </section>

      {/* Connect & TasteID Section */}
      <section className="border-b border-[--border]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row">
            {/* LEFT: Active Users - Compact */}
            {activeUsers.length > 0 && (
              <div className="lg:w-1/2 px-6 py-10 lg:border-r border-[--border]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[11px] tracking-[0.2em] uppercase text-[--muted]">
                    Connect
                  </h2>
                  <Link
                    href="/friends"
                    className="text-[10px] tracking-[0.15em] uppercase text-[--muted] hover:text-white transition-colors"
                  >
                    View All →
                  </Link>
                </div>
                <div className="space-y-2">
                  {activeUsers.slice(0, 5).map((user, index) => (
                    <Link
                      key={user.id}
                      href={`/u/${user.username}`}
                      className="flex items-center gap-3 p-2 -mx-2 hover:bg-white/5 transition-colors group"
                    >
                      <div className="w-10 h-10 border border-[--border] overflow-hidden flex-shrink-0 group-hover:border-white transition-colors">
                        {user.image ? (
                          <img src={user.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <DefaultAvatar size="sm" className="w-full h-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">@{user.username}</p>
                        <p className="text-[10px] text-[--muted] truncate uppercase tracking-wider">
                          {user.tasteId?.primaryArchetype?.replace(/_/g, ' ') || `${user._count.reviews} reviews`}
                        </p>
                      </div>
                      <div className="text-[10px] text-[--muted] tabular-nums">
                        {user._count.reviews}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* RIGHT: TasteID Promo */}
            <div className="lg:w-1/2 px-6 py-10 border-t lg:border-t-0 border-[--border]">
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-[11px] tracking-[0.2em] uppercase text-[--muted]">
                  TasteID
                </h2>
                <span className="text-[9px] px-1.5 py-0.5 bg-white/10 text-[--muted] uppercase tracking-wider">Beta</span>
              </div>

              <div className="border border-[--border] p-6 mb-4">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-3xl">🎵</div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Your Musical DNA</h3>
                    <p className="text-sm text-[--muted]">
                      Discover your unique taste archetype and find your musical twins.
                    </p>
                  </div>
                </div>

                {/* Mini stats */}
                <div className="grid grid-cols-3 gap-4 py-4 border-y border-[--border] mb-4">
                  <div className="text-center">
                    <div className="text-xl font-bold">12</div>
                    <div className="text-[9px] text-[--muted] uppercase tracking-wider">Archetypes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">∞</div>
                    <div className="text-[9px] text-[--muted] uppercase tracking-wider">Combinations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">5+</div>
                    <div className="text-[9px] text-[--muted] uppercase tracking-wider">Reviews Needed</div>
                  </div>
                </div>

                <Link
                  href="/taste-setup"
                  className="block w-full py-3 bg-white text-black text-center text-[11px] tracking-[0.15em] uppercase font-bold hover:bg-[#e5e5e5] transition-colors"
                >
                  Generate Your TasteID
                </Link>
              </div>

              <Link
                href="/discover/similar-tasters"
                className="flex items-center justify-between p-3 border border-[--border] hover:border-white transition-colors group"
              >
                <span className="text-sm">Find Similar Tasters</span>
                <svg className="w-4 h-4 text-[--muted] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Split Layout */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row">
          {/* LEFT: Trending */}
          <section className="lg:w-1/2 px-6 py-12 lg:py-16 lg:border-r border-[--border] flex flex-col">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="text-[11px] tracking-[0.2em] uppercase text-[--muted]">
                Trending
              </h2>
            </div>

            {/* Album grid - grows to fill space */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 flex-1">
              {billboardAlbums.map((album) => (
                <Link
                  key={album.id}
                  href={`/album/${album.spotifyId}`}
                  className="group"
                >
                  {/* Album art */}
                  <div className="aspect-square w-full bg-[--border] overflow-hidden mb-2 relative">
                    {album.coverArtUrlLarge || album.coverArtUrl ? (
                      <img
                        src={album.coverArtUrlLarge || album.coverArtUrl || ''}
                        alt={album.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[--muted]">
                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
                        </svg>
                      </div>
                    )}
                    {/* Billboard rank badge */}
                    {album.billboardRank && (
                      <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 text-[10px] font-bold tracking-wider">
                        #{album.billboardRank}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <p className="text-[11px] sm:text-[12px] font-medium truncate group-hover:text-[--muted] transition-colors">
                    {album.title}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-[--muted] truncate">
                    {album.artistName}
                  </p>
                </Link>
              ))}
            </div>

            {/* See All button at bottom */}
            <div className="mt-8 pt-6 border-t border-[--border]">
              <Link
                href="/trending"
                className="inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-[--muted] hover:text-white transition-colors"
              >
                See All Trending
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </section>

          {/* RIGHT: Recent Reviews */}
          <section className="lg:w-1/2 px-6 py-12 lg:py-16 border-t lg:border-t-0 border-[--border] flex flex-col">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="text-[11px] tracking-[0.2em] uppercase text-[--muted]">
                Recent Reviews
              </h2>
            </div>

            {/* Reviews list - grows to fill space */}
            <div className="space-y-0 flex-1">
              {recentReviews.map((review) => (
                <Link
                  key={review.id}
                  href={`/album/${review.album.spotifyId}`}
                  className="group flex gap-4 py-4 border-b border-[--border] last:border-b-0 hover:bg-[--border]/20 -mx-3 px-3 transition-colors"
                >
                  {/* Album art */}
                  <div className="w-14 h-14 flex-shrink-0 bg-[--border] overflow-hidden">
                    {review.album.coverArtUrl ? (
                      <img
                        src={review.album.coverArtUrl}
                        alt={review.album.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[--border]">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-[13px] font-medium truncate group-hover:text-[--muted] transition-colors">
                        {review.album.title}
                      </span>
                      <span className="text-[13px] font-semibold text-[--muted] tabular-nums flex-shrink-0">
                        {review.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-[11px] text-[--muted] truncate">
                      {review.album.artistName}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {review.user.image ? (
                        <img src={review.user.image} alt="" className="w-4 h-4 rounded-full" />
                      ) : (
                        <DefaultAvatar size="xs" />
                      )}
                      <span className="text-[10px] text-[--muted]">
                        {review.user.username}
                      </span>
                      <span className="text-[10px] text-[--border]">·</span>
                      <span className="text-[10px] text-[--border]">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    {review.text && (
                      <p className="text-[11px] text-[--muted] mt-2 line-clamp-2 leading-relaxed">
                        {review.text}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* See All button at bottom */}
            <div className="mt-8 pt-6 border-t border-[--border]">
              <Link
                href="/reviews"
                className="inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-[--muted] hover:text-white transition-colors"
              >
                See All Reviews
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[--border] mt-8">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <p className="text-[11px] tracking-[0.15em] uppercase text-[--border]">
              WAXFEED · Polarity Lab LLC · 2025
            </p>
            <nav className="flex gap-8">
              <Link href="/discover" className="text-[11px] tracking-[0.15em] text-[--muted] hover:text-white transition-colors">
                DISCOVER
              </Link>
              <Link href="/friends" className="text-[11px] tracking-[0.15em] text-[--muted] hover:text-white transition-colors">
                FRIENDS
              </Link>
              <Link href="/hot-takes" className="text-[11px] tracking-[0.15em] text-[--muted] hover:text-white transition-colors">
                HOT TAKES
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
