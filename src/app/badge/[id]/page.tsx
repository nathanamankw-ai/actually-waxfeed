import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Metadata } from "next"
import { DefaultAvatar } from "@/components/default-avatar"
import { CopyButton } from "./copy-button"

interface Props {
  params: Promise<{ id: string }>
}

const BADGE_COLORS = {
  GOLD: { bg: "bg-[#ffd700]/10", border: "border-[#ffd700]", text: "text-[#ffd700]", glow: "shadow-[0_0_30px_rgba(255,215,0,0.15)]" },
  SILVER: { bg: "bg-[#c0c0c0]/10", border: "border-[#c0c0c0]", text: "text-[#c0c0c0]", glow: "shadow-[0_0_30px_rgba(192,192,192,0.15)]" },
  BRONZE: { bg: "bg-[#cd7f32]/10", border: "border-[#cd7f32]", text: "text-[#cd7f32]", glow: "shadow-[0_0_30px_rgba(205,127,50,0.15)]" },
}

const BADGE_TITLES = {
  GOLD: "Gold Spin",
  SILVER: "Silver Spin",
  BRONZE: "Bronze Spin",
}

const BADGE_DESCRIPTIONS = {
  GOLD: "First 10 reviewers",
  SILVER: "Reviewers 11-50",
  BRONZE: "Reviewers 51-100",
}

async function getBadge(id: string) {
  return prisma.firstSpinBadge.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
        }
      },
      album: {
        select: {
          id: true,
          spotifyId: true,
          title: true,
          artistName: true,
          coverArtUrl: true,
          coverArtUrlLarge: true,
          totalReviews: true,
        }
      }
    }
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const badge = await getBadge(id)

  if (!badge) {
    return { title: "Badge Not Found | WaxFeed" }
  }

  const title = `${badge.user.username} was #${badge.position} on "${badge.album.title}" | WaxFeed`
  const description = `${badge.user.username} earned a ${BADGE_TITLES[badge.badgeType]} badge for being one of the first to rate ${badge.album.title} by ${badge.album.artistName}. They believed first.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [`/api/og/badge/${id}`],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og/badge/${id}`],
    },
  }
}

export default async function BadgePage({ params }: Props) {
  const { id } = await params
  const badge = await getBadge(id)

  if (!badge) {
    notFound()
  }

  const colors = BADGE_COLORS[badge.badgeType]
  const title = BADGE_TITLES[badge.badgeType]
  const description = BADGE_DESCRIPTIONS[badge.badgeType]
  const coverUrl = badge.album.coverArtUrlLarge || badge.album.coverArtUrl

  // Generate share URLs
  const badgeUrl = `https://wax-feed.com/badge/${id}`
  const shareText = `I was #${badge.position} to rate "${badge.album.title}" by ${badge.album.artistName} 🎵 I believed first.`

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(badgeUrl)}`
  const threadsUrl = `https://threads.net/intent/post?text=${encodeURIComponent(shareText + " " + badgeUrl)}`

  return (
    <div className="min-h-screen bg-[--background]">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Back navigation */}
        <div className="mb-8 animate-fade-in">
          <Link
            href={`/album/${badge.album.spotifyId}`}
            className="inline-flex items-center gap-2.5 text-sm text-[--muted] hover:text-[#ffd700] transition-colors group"
          >
            <div className="w-8 h-8 flex items-center justify-center border border-[--border] group-hover:border-[#ffd700]/50 group-hover:bg-[#ffd700]/5 transition-all">
              <svg className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <span className="tracking-wide uppercase text-[10px] font-medium">Back to Album</span>
          </Link>
        </div>

        {/* Badge Card */}
        <div className={`border-2 ${colors.border} p-6 md:p-8 ${colors.bg} ${colors.glow} animate-fade-in`} style={{ animationDelay: '100ms' }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 flex items-center justify-center border ${colors.border} ${colors.bg}`}>
                {badge.badgeType === 'GOLD' ? (
                  <svg className="w-6 h-6 text-[#ffd700]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className={`w-6 h-6 ${colors.text}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div>
                <p className={`text-sm uppercase tracking-[0.2em] font-bold ${colors.text}`}>
                  {title}
                </p>
                <p className="text-[10px] text-[--muted] uppercase tracking-wide">{description}</p>
              </div>
            </div>
            <div className={`px-4 py-2 border ${colors.border} ${colors.bg}`}>
              <span className={`text-2xl font-bold ${colors.text} tabular-nums`}>#{badge.position}</span>
            </div>
          </div>

          {/* Album */}
          <div className="flex gap-5 mb-6">
            <div className="w-32 h-32 flex-shrink-0 bg-[--border] overflow-hidden group">
              {coverUrl && (
                <img
                  src={coverUrl}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <Link
                href={`/album/${badge.album.spotifyId}`}
                className="group"
              >
                <h1 className="text-xl md:text-2xl font-bold mb-1 line-clamp-2 tracking-tight group-hover:text-[#ffd700] transition-colors">
                  {badge.album.title}
                </h1>
              </Link>
              <p className="text-[--muted] mb-3">{badge.album.artistName}</p>
              <div className="flex items-center gap-2 text-sm text-[--muted]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>{badge.album.totalReviews.toLocaleString()} total reviews</span>
              </div>
            </div>
          </div>

          {/* User */}
          <div className="flex items-center gap-3 py-4 border-t border-[--border]">
            <Link href={`/u/${badge.user.username}`} className="flex items-center gap-3 group">
              <div className="relative">
                {badge.user.image ? (
                  <img
                    src={badge.user.image}
                    alt=""
                    className="w-12 h-12 object-cover group-hover:opacity-80 transition-opacity"
                  />
                ) : (
                  <DefaultAvatar size="md" />
                )}
              </div>
              <div>
                <p className="font-bold group-hover:text-[#ffd700] transition-colors">@{badge.user.username}</p>
                <p className="text-xs text-[--muted] flex items-center gap-1.5">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Believed first
                </p>
              </div>
            </Link>
          </div>

          {/* Share Buttons */}
          <div className="pt-4 border-t border-[--border]">
            <p className="text-[10px] text-[--muted] uppercase tracking-[0.2em] mb-3">Share this badge</p>
            <div className="flex gap-2">
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-[--background] text-[--foreground] border border-[--border] hover:border-[#ffd700]/50 hover:bg-[#ffd700]/5 transition-all text-[11px] tracking-[0.1em] uppercase font-bold"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                X / Twitter
              </a>
              <a
                href={threadsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-[--background] text-[--foreground] border border-[--border] hover:border-[#ffd700]/50 hover:bg-[#ffd700]/5 transition-all text-[11px] tracking-[0.1em] uppercase font-bold"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.5 12.068V12c.012-6.627 4.668-11.478 10.792-11.493h.028c3.186.008 6.063 1.252 8.102 3.499 1.945 2.146 3.005 5.065 3.078 8.067l-2.186.053c-.062-2.535-.936-4.93-2.533-6.691-1.673-1.847-3.975-2.858-6.48-2.865-4.931.013-8.578 3.985-8.588 9.362v.062c0 2.96.693 5.335 2.064 7.067 1.493 1.884 3.76 2.893 6.732 2.933h.007c2.487 0 4.613-.887 6.173-2.581.79-.858 1.368-1.94 1.769-3.315l2.127.523c-.51 1.742-1.269 3.141-2.313 4.274-2.024 2.195-4.82 3.327-8.105 3.327z"/>
                  <path d="M8.563 10.065h2.123v7.84H8.563z"/>
                </svg>
                Threads
              </a>
              <CopyButton url={badgeUrl} />
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center animate-fade-in" style={{ animationDelay: '200ms' }}>
          <p className="text-[--muted] mb-5 leading-relaxed">
            Think you can spot the next hit before everyone else?
          </p>
          <Link
            href="/discover"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#ffd700] text-black font-bold text-[11px] tracking-[0.15em] uppercase hover:bg-[#ffed4a] transition-colors group"
          >
            <span>Start Rating Albums</span>
            <svg className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
