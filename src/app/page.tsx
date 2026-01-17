import { prisma } from "@/lib/prisma"
import { DefaultAvatar } from "@/components/default-avatar"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { formatDistanceToNow } from "date-fns"

export const dynamic = "force-dynamic"

// Get album of the day - highest rated album from last 7 days with reviews
async function getAlbumOfTheDay() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const album = await prisma.album.findFirst({
    where: {
      albumType: { not: 'single' },
      totalReviews: { gte: 1 },
      reviews: {
        some: {
          createdAt: { gte: sevenDaysAgo }
        }
      }
    },
    orderBy: [
      { averageRating: 'desc' },
      { totalReviews: 'desc' }
    ],
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
      releaseDate: true,
    },
  })

  return album
}

// Get recent reviews with variety
async function getRecentReviews() {
  return prisma.review.findMany({
    take: 8,
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
}

async function getFriendsActivity(userId: string | undefined) {
  if (!userId) return []

  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { user1Id: userId },
        { user2Id: userId },
      ],
    },
    select: { user1Id: true, user2Id: true },
  })

  const friendIds = friendships.map(f =>
    f.user1Id === userId ? f.user2Id : f.user1Id
  )

  if (friendIds.length === 0) return []

  return prisma.review.findMany({
    where: { userId: { in: friendIds } },
    take: 6,
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
}

// Get top albums - Billboard chart
async function getTopAlbums() {
  return prisma.album.findMany({
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
      billboardRank: true,
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

// Get hot takes for preview
async function getHotTakes() {
  try {
    return await prisma.hotTake.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: {
        album: {
          select: {
            title: true,
            artistName: true,
            coverArtUrl: true,
            spotifyId: true,
          }
        },
        author: {
          select: {
            username: true,
          }
        }
      }
    })
  } catch {
    return []
  }
}

export default async function Home() {
  const session = await auth()
  const [albumOfDay, reviews, albums, stats, friendsActivity, hotTakes] = await Promise.all([
    getAlbumOfTheDay(),
    getRecentReviews(),
    getTopAlbums(),
    getStats(),
    getFriendsActivity(session?.user?.id),
    getHotTakes(),
  ])

  return (
    <div className="min-h-screen">
      {/* HERO: Album of the Day - Clean, minimal, editorial */}
      {albumOfDay && (
        <section className="relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[75vh] lg:min-h-[85vh] gap-8 lg:gap-16 items-center">
              {/* Left: Album Art */}
              <div className="order-1 py-8 lg:py-0">
                <Link
                  href={`/album/${albumOfDay.spotifyId}`}
                  className="block relative group animate-fade-in"
                >
                  <div className="aspect-square bg-[#0f0f0f] overflow-hidden shadow-2xl">
                    {albumOfDay.coverArtUrlLarge || albumOfDay.coverArtUrl ? (
                      <img
                        src={albumOfDay.coverArtUrlLarge || albumOfDay.coverArtUrl || ''}
                        alt={albumOfDay.title}
                        className="w-full h-full object-cover group-hover:scale-[1.015] transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#333]">
                        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                </Link>
              </div>

              {/* Right: Typography - clean Notion-style */}
              <div className="flex flex-col justify-center order-2 pb-12 lg:pb-0">
                <div className="space-y-6">
                  <p className="text-[11px] tracking-[0.25em] uppercase text-[#555] animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    Album of the Day
                  </p>

                  <Link href={`/album/${albumOfDay.spotifyId}`} className="group block">
                    <h1
                      className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-[-0.03em] leading-[0.95] group-hover:text-[#777] transition-colors duration-300 animate-fade-in"
                      style={{ animationDelay: '0.15s' }}
                    >
                      {albumOfDay.title}
                    </h1>
                  </Link>

                  <p className="text-lg lg:text-xl text-[#666] animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    {albumOfDay.artistName}
                  </p>

                  {/* Rating - large and confident */}
                  <div className="flex items-baseline gap-2 animate-fade-in" style={{ animationDelay: '0.25s' }}>
                    {albumOfDay.averageRating && (
                      <>
                        <span className="text-5xl lg:text-6xl font-bold tracking-tight">{albumOfDay.averageRating.toFixed(1)}</span>
                        <span className="text-base text-[#444] font-medium">/10</span>
                      </>
                    )}
                  </div>

                  {/* Meta - clean dividers */}
                  <div className="flex items-center gap-3 text-[11px] tracking-[0.15em] uppercase text-[#555] animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <span>{albumOfDay.totalReviews} reviews</span>
                    <span className="text-[#333]">·</span>
                    {albumOfDay.genres[0] && <><span>{albumOfDay.genres[0]}</span><span className="text-[#333]">·</span></>}
                    <span>{new Date(albumOfDay.releaseDate).getFullYear()}</span>
                  </div>

                  <div className="pt-4 animate-fade-in" style={{ animationDelay: '0.35s' }}>
                    <Link
                      href={`/album/${albumOfDay.spotifyId}`}
                      className="inline-flex items-center gap-2 bg-white text-black px-6 py-3.5 font-semibold text-sm tracking-wide hover:bg-[#e8e8e8] transition-colors duration-200 no-underline"
                    >
                      Review Album
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Subtle bottom border */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#222] to-transparent" />
        </section>
      )}

      {/* STATS BAR - Minimal, confident numbers */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 lg:gap-16">
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <p className="text-3xl sm:text-5xl lg:text-7xl font-bold tracking-[-0.02em] tabular-nums">{stats.albumCount.toLocaleString()}</p>
              <p className="text-[11px] tracking-[0.2em] uppercase text-[#555] mt-3">Albums</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
              <p className="text-3xl sm:text-5xl lg:text-7xl font-bold tracking-[-0.02em] tabular-nums">{stats.reviewCount.toLocaleString()}</p>
              <p className="text-[11px] tracking-[0.2em] uppercase text-[#555] mt-3">Reviews</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <p className="text-3xl sm:text-5xl lg:text-7xl font-bold tracking-[-0.02em] tabular-nums">{stats.userCount.toLocaleString()}</p>
              <p className="text-[11px] tracking-[0.2em] uppercase text-[#555] mt-3">Critics</p>
            </div>
          </div>
        </div>
        <div className="mt-16 lg:mt-24 h-px bg-gradient-to-r from-transparent via-[#222] to-transparent" />
      </section>

      {/* Friends Activity - Clean horizontal scroll */}
      {session && friendsActivity.length > 0 && (
        <section className="py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-baseline justify-between mb-10">
              <div>
                <p className="text-[11px] tracking-[0.2em] uppercase text-[#555] mb-2">Your Circle</p>
                <h2 className="text-xl lg:text-2xl font-bold tracking-tight">Friends Activity</h2>
              </div>
            </div>
            <div className="flex gap-5 lg:gap-6 overflow-x-auto pb-4 -mx-6 px-6 lg:-mx-8 lg:px-8 snap-x scrollbar-hide">
              {friendsActivity.map((review, i) => (
                <Link
                  key={review.id}
                  href={`/album/${review.album.spotifyId || review.album.id}`}
                  className="flex-shrink-0 w-44 lg:w-52 group no-underline snap-start animate-fade-in"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="aspect-square bg-[#0f0f0f] mb-4 overflow-hidden relative">
                    {review.album.coverArtUrl ? (
                      <img
                        src={review.album.coverArtUrl}
                        alt={review.album.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#333]">
                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
                        </svg>
                      </div>
                    )}
                    {/* Rating badge - subtle */}
                    <div className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-sm text-white px-2 py-1 font-semibold text-xs">
                      {review.rating.toFixed(1)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {review.user.image ? (
                      <img
                        src={review.user.image}
                        alt={review.user.username || ""}
                        className="w-5 h-5"
                        style={{ borderRadius: 0 }}
                      />
                    ) : (
                      <DefaultAvatar size="xs" />
                    )}
                    <span className="text-xs text-[#666]">@{review.user.username}</span>
                  </div>
                  <p className="font-semibold text-sm truncate group-hover:text-[#777] transition-colors duration-200">{review.album.title}</p>
                  <p className="text-xs text-[#555] mt-0.5">{review.album.artistName}</p>
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-12 lg:mt-16 h-px bg-gradient-to-r from-transparent via-[#222] to-transparent" />
        </section>
      )}

      {/* MAIN CONTENT: Clean Grid Layout */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20">

          {/* LEFT COLUMN: Reviews */}
          <div className="lg:col-span-7">
            <div className="flex items-baseline justify-between mb-10">
              <div>
                <p className="text-[11px] tracking-[0.2em] uppercase text-[#555] mb-2">Latest</p>
                <h2 className="text-xl lg:text-2xl font-bold tracking-tight">Reviews</h2>
              </div>
              <Link href="/reviews" className="text-[11px] tracking-[0.15em] uppercase text-[#555] hover:text-white transition-colors duration-200">
                View All
              </Link>
            </div>

            {reviews.length === 0 ? (
              <div className="border border-[#1a1a1a] p-16 text-center">
                <p className="text-[#555]">No reviews yet</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Featured review */}
                {reviews[0] && (
                  <Link
                    key={reviews[0].id}
                    href={`/album/${reviews[0].album.spotifyId}`}
                    className="group no-underline block animate-fade-in"
                  >
                    <article className="border border-[#1a1a1a] hover:border-[#333] transition-colors duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2">
                        <div className="aspect-square sm:aspect-auto sm:min-h-[320px] bg-[#0f0f0f] overflow-hidden">
                          {reviews[0].album.coverArtUrl ? (
                            <img
                              src={reviews[0].album.coverArtUrl}
                              alt={reviews[0].album.title}
                              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#333]">
                              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-6">
                          <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-4xl font-bold tracking-tight">{reviews[0].rating.toFixed(1)}</span>
                            <span className="text-sm text-[#444] font-medium">/10</span>
                          </div>
                          <h3 className="text-lg font-bold mb-1 group-hover:text-[#777] transition-colors duration-200 line-clamp-2">
                            {reviews[0].album.title}
                          </h3>
                          <p className="text-sm text-[#666] mb-4">{reviews[0].album.artistName}</p>
                          {reviews[0].text && (
                            <p className="text-sm text-[#555] line-clamp-3 mb-5 leading-relaxed">
                              {reviews[0].text}
                            </p>
                          )}
                          <div className="flex items-center gap-2 pt-4 border-t border-[#1a1a1a]">
                            {reviews[0].user.image ? (
                              <img src={reviews[0].user.image} alt="" className="w-5 h-5" />
                            ) : (
                              <DefaultAvatar size="xs" />
                            )}
                            <span className="text-xs text-[#666]">@{reviews[0].user.username}</span>
                            <span className="text-xs text-[#444] ml-auto">
                              {formatDistanceToNow(new Date(reviews[0].createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                )}

                {/* Other reviews in grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {reviews.slice(1).map((review, i) => (
                    <Link
                      key={review.id}
                      href={`/album/${review.album.spotifyId}`}
                      className="group no-underline block animate-fade-in"
                      style={{ animationDelay: `${(i + 1) * 0.08}s` }}
                    >
                      <article className="border border-[#1a1a1a] hover:border-[#333] transition-colors duration-200 h-full">
                        <div className="aspect-[16/10] bg-[#0f0f0f] overflow-hidden">
                          {review.album.coverArtUrl ? (
                            <img
                              src={review.album.coverArtUrl}
                              alt={review.album.title}
                              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#333]">
                              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex items-baseline gap-1.5 mb-2">
                            <span className="text-xl font-bold">{review.rating.toFixed(1)}</span>
                            <span className="text-xs text-[#444]">/10</span>
                          </div>
                          <h3 className="font-semibold text-sm mb-0.5 group-hover:text-[#777] transition-colors duration-200 line-clamp-1">
                            {review.album.title}
                          </h3>
                          <p className="text-xs text-[#555]">{review.album.artistName}</p>
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1a1a1a]">
                            {review.user.image ? (
                              <img src={review.user.image} alt="" className="w-4 h-4" />
                            ) : (
                              <DefaultAvatar size="xs" />
                            )}
                            <span className="text-[11px] text-[#555]">@{review.user.username}</span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Charts + Hot Takes */}
          <div className="lg:col-span-5 space-y-16">
            {/* Billboard Chart */}
            <div>
              <div className="flex items-baseline justify-between mb-8">
                <div>
                  <p className="text-[11px] tracking-[0.2em] uppercase text-[#555] mb-2">Billboard 200</p>
                  <h2 className="text-xl lg:text-2xl font-bold tracking-tight">Charts</h2>
                </div>
                <Link href="/trending" className="text-[11px] tracking-[0.15em] uppercase text-[#555] hover:text-white transition-colors duration-200">
                  View All
                </Link>
              </div>

              <div className="space-y-1">
                {albums.slice(0, 8).map((album, i) => (
                  <Link
                    key={album.id}
                    href={`/album/${album.spotifyId}`}
                    className="flex items-center gap-4 group no-underline py-3 hover:bg-[#0f0f0f] transition-colors duration-150 animate-fade-in -mx-3 px-3"
                    style={{ animationDelay: `${i * 0.04}s` }}
                  >
                    {/* Rank - tabular for alignment */}
                    <span className="text-lg font-bold w-6 text-[#444] tabular-nums group-hover:text-white transition-colors duration-150">
                      {album.billboardRank}
                    </span>

                    {/* Art */}
                    <div className="w-11 h-11 bg-[#0f0f0f] flex-shrink-0 overflow-hidden">
                      {album.coverArtUrl ? (
                        <img
                          src={album.coverArtUrl}
                          alt={album.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#333]">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate group-hover:text-[#777] transition-colors duration-150">{album.title}</p>
                      <p className="text-xs text-[#555] truncate">{album.artistName}</p>
                    </div>

                    {/* Rating */}
                    {album.averageRating && (
                      <span className="text-sm font-semibold tabular-nums">{album.averageRating.toFixed(1)}</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* Hot Takes Preview */}
            {hotTakes.length > 0 && (
              <div>
                <div className="flex items-baseline justify-between mb-8">
                  <div>
                    <p className="text-[11px] tracking-[0.2em] uppercase text-[#555] mb-2">Debates</p>
                    <h2 className="text-xl lg:text-2xl font-bold tracking-tight">Hot Takes</h2>
                  </div>
                  <Link href="/hot-takes" className="text-[11px] tracking-[0.15em] uppercase text-[#555] hover:text-white transition-colors duration-200">
                    View All
                  </Link>
                </div>

                <div className="space-y-3">
                  {hotTakes.map((take, i) => (
                    <Link
                      key={take.id}
                      href={`/hot-takes/${take.id}`}
                      className="block p-4 border border-[#1a1a1a] hover:border-[#333] transition-colors duration-200 no-underline group animate-fade-in"
                      style={{ animationDelay: `${i * 0.08}s` }}
                    >
                      <div className="flex gap-4">
                        <div className="w-14 h-14 bg-[#0f0f0f] flex-shrink-0 overflow-hidden">
                          {take.album.coverArtUrl ? (
                            <img
                              src={take.album.coverArtUrl}
                              alt={take.album.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#333]">
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-[10px] tracking-[0.15em] uppercase font-semibold mb-1.5"
                            style={{
                              color: take.stance === 'OVERRATED' || take.stance === 'TRASH'
                                ? '#e54545'
                                : take.stance === 'MASTERPIECE'
                                  ? '#c9a227'
                                  : '#666'
                            }}
                          >
                            {take.stance.replace('_', ' ')}
                          </p>
                          <p className="text-sm font-semibold truncate group-hover:text-[#777] transition-colors duration-150">{take.album.title}</p>
                          <p className="text-xs text-[#555] mt-0.5">@{take.author.username}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* CTA for non-logged in */}
            {!session && (
              <div className="border border-[#1a1a1a] p-8">
                <p className="text-[11px] tracking-[0.2em] uppercase text-[#555] mb-3">Join the Community</p>
                <h3 className="text-xl font-bold mb-3 tracking-tight">Start Rating</h3>
                <p className="text-sm text-[#555] mb-6 leading-relaxed">Join critics worldwide in reviewing and discovering music.</p>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 bg-white text-black px-5 py-3 font-semibold text-sm tracking-wide hover:bg-[#e8e8e8] transition-colors duration-200 no-underline"
                >
                  Create Account
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer - Clean, minimal */}
      <footer className="mt-8">
        <div className="h-px bg-gradient-to-r from-transparent via-[#222] to-transparent" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-5">
              <p className="text-[11px] tracking-[0.2em] uppercase text-[#555] mb-4">About</p>
              <p className="text-sm text-[#666] max-w-md leading-relaxed">
                A social music review platform for critics and enthusiasts. Rate albums,
                build lists, discover new music through friends.
              </p>
            </div>
            <div className="lg:col-span-3">
              <p className="text-[11px] tracking-[0.2em] uppercase text-[#555] mb-4">Navigate</p>
              <div className="space-y-2.5">
                <Link href="/discover" className="block text-sm text-[#666] hover:text-white transition-colors duration-150">Discover</Link>
                <Link href="/trending" className="block text-sm text-[#666] hover:text-white transition-colors duration-150">Trending</Link>
                <Link href="/lists" className="block text-sm text-[#666] hover:text-white transition-colors duration-150">Lists</Link>
                <Link href="/hot-takes" className="block text-sm text-[#666] hover:text-white transition-colors duration-150">Hot Takes</Link>
              </div>
            </div>
            <div className="lg:col-span-4">
              <p className="text-[11px] tracking-[0.2em] uppercase text-[#555] mb-4">Contact</p>
              <p className="text-sm text-[#666]">scrolling@waxfeed.com</p>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-[#1a1a1a]">
            <p className="text-[11px] tracking-[0.15em] uppercase text-[#444]">
              WBRU · Brown Broadcasting Service, Inc. · 2025
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
