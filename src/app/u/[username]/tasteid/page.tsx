import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import Link from "next/link"
import {
  ArchetypeBadge,
  GenreRadarChart,
  ArtistDNAStrip,
  TasteCardShare,
} from "@/components/tasteid"
import { DefaultAvatar } from "@/components/default-avatar"
import { getArchetypeInfo } from "@/lib/tasteid"
import { ArrowRightIcon } from "@/components/icons"
import { GenerateTasteIDButton, RecomputeButton } from "./tasteid-actions"

interface Props {
  params: Promise<{ username: string }>
}

async function getTasteID(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
      tasteId: {
        include: {
          snapshots: {
            orderBy: { createdAt: "desc" },
            take: 6,
          },
        },
      },
    },
  })

  return user
}

export default async function TasteIDPage({ params }: Props) {
  const { username } = await params
  const session = await auth()
  const user = await getTasteID(username)

  if (!user) {
    notFound()
  }

  const isOwnProfile = session?.user?.id === user.id
  const tasteId = user.tasteId

  // If no TasteID, show prompt
  if (!tasteId) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-2xl mx-auto">
          <Link
            href={`/u/${username}`}
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white mb-8"
          >
            ← Back to profile
          </Link>

          <div className="border-2 border-white p-8 text-center space-y-6">
            <h1 className="text-2xl font-bold uppercase tracking-wider">
              TASTEID NOT GENERATED
            </h1>
            <p className="text-neutral-400">
              {isOwnProfile
                ? "Your TasteID hasn't been computed yet. Review at least 3 albums to generate your unique taste fingerprint."
                : `@${username} hasn't generated their TasteID yet.`}
            </p>
            {isOwnProfile && (
              <GenerateTasteIDButton />
            )}
          </div>
        </div>
      </div>
    )
  }

  const archetypeInfo = getArchetypeInfo(tasteId.primaryArchetype)
  const secondaryInfo = tasteId.secondaryArchetype
    ? getArchetypeInfo(tasteId.secondaryArchetype)
    : null

  const genreVector = tasteId.genreVector as Record<string, number>
  const decadePrefs = tasteId.decadePreferences as Record<string, number>

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href={`/u/${username}`}
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white"
          >
            ← Back to profile
          </Link>
          {!isOwnProfile && session?.user && (
            <Link
              href={`/u/${username}/compare`}
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-white text-sm font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-colors"
            >
              COMPARE TASTE <ArrowRightIcon className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Hero Section */}
        <div className="border-2 border-white p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* User info */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 border-2 border-white overflow-hidden">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.username || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <DefaultAvatar size="lg" className="w-full h-full" />
                )}
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-1">
                  TASTEID
                </div>
                <Link
                  href={`/u/${username}`}
                  className="text-xl font-bold hover:underline"
                >
                  @{username}
                </Link>
              </div>
            </div>

            {/* Archetype */}
            <div className="flex-1">
              <div className="space-y-3">
                <ArchetypeBadge
                  {...archetypeInfo}
                  confidence={tasteId.archetypeConfidence}
                  size="lg"
                  showDescription
                />
                {secondaryInfo && (
                  <div>
                    <span className="text-xs text-neutral-500 mr-2">ALSO:</span>
                    <ArchetypeBadge {...secondaryInfo} size="sm" />
                  </div>
                )}
              </div>
            </div>

            {/* Radar chart */}
            <div className="hidden md:block">
              <GenreRadarChart genres={genreVector} size={180} />
            </div>
          </div>
        </div>

        {/* Mobile radar */}
        <div className="md:hidden flex justify-center mb-8">
          <GenreRadarChart genres={genreVector} size={250} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="POLARITY SCORE"
            value={tasteId.polarityScore.toFixed(2)}
            description="Taste distinctiveness"
          />
          <StatCard
            label="ADVENTURENESS"
            value={`${Math.round(tasteId.adventurenessScore * 100)}%`}
            description="Genre diversity"
          />
          <StatCard
            label="RATING STYLE"
            value={tasteId.ratingSkew.toUpperCase()}
            description={
              tasteId.ratingSkew === "harsh"
                ? "High standards"
                : tasteId.ratingSkew === "lenient"
                ? "Finds joy easily"
                : "Balanced critic"
            }
          />
          <StatCard
            label="AVG RATING"
            value={tasteId.averageRating.toFixed(1)}
            description={`±${tasteId.ratingStdDev.toFixed(1)} std dev`}
          />
        </div>

        {/* Defining Artists */}
        <div className="mb-8">
          <h2 className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-4">
            DEFINING ARTISTS
          </h2>
          <ArtistDNAStrip artists={tasteId.topArtists} />
        </div>

        {/* Top Genres */}
        <div className="mb-8">
          <h2 className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-4">
            TOP GENRES
          </h2>
          <div className="flex flex-wrap gap-2">
            {tasteId.topGenres.map((genre, i) => (
              <div
                key={genre}
                className="px-4 py-2 border-2 border-white flex items-center gap-2"
              >
                <span className="text-neutral-500 text-sm">{i + 1}</span>
                <span className="font-bold uppercase">{genre}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decade Preferences */}
        {Object.keys(decadePrefs).length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-4">
              DECADE PREFERENCES
            </h2>
            <div className="space-y-2">
              {Object.entries(decadePrefs)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([decade, value]) => (
                  <div key={decade} className="flex items-center gap-4">
                    <span className="w-16 text-sm font-bold">{decade}</span>
                    <div className="flex-1 h-4 bg-neutral-800">
                      <div
                        className="h-full bg-white"
                        style={{ width: `${value * 100}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-sm text-neutral-500">
                      {Math.round(value * 100)}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Review Depth */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 border-2 border-neutral-800 p-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-1">
              REVIEW STYLE
            </div>
            <div className="text-lg font-bold uppercase">
              {tasteId.reviewDepth}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-1">
              REVIEWS ANALYZED
            </div>
            <div className="text-lg font-bold">{tasteId.reviewCount}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-1">
              AVG REVIEW LENGTH
            </div>
            <div className="text-lg font-bold">{tasteId.avgReviewLength} words</div>
          </div>
        </div>

        {/* Share */}
        {isOwnProfile && (
          <div className="mb-8 border-2 border-neutral-800 p-6">
            <TasteCardShare
              username={username}
              archetype={archetypeInfo.name}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          {isOwnProfile && (
            <RecomputeButton />
          )}
          <Link
            href={`/discover/similar-tasters`}
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-neutral-700 text-sm font-bold uppercase tracking-wider hover:border-white transition-colors"
          >
            FIND SIMILAR TASTERS
          </Link>
        </div>

        {/* Last computed */}
        <div className="mt-8 text-xs text-neutral-600">
          Last computed:{" "}
          {new Date(tasteId.lastComputedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string
  value: string
  description: string
}) {
  return (
    <div className="border-2 border-white p-4">
      <div className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-1">
        {label}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-neutral-500 mt-1">{description}</div>
    </div>
  )
}
