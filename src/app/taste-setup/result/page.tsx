import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ArchetypeBadge, GenreRadarChart } from "@/components/tasteid"
import { getArchetypeInfo, computeTasteID, saveTasteID } from "@/lib/tasteid"

export default async function TasteSetupResultPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/taste-setup")
  }

  // Get or compute TasteID
  let tasteId = await prisma.tasteID.findUnique({
    where: { userId: session.user.id },
  })

  if (!tasteId) {
    // Try to compute it
    const computation = await computeTasteID(session.user.id)
    if (!computation) {
      redirect("/taste-setup/rate")
    }
    tasteId = await saveTasteID(session.user.id, computation)
  }

  const archetype = getArchetypeInfo(tasteId.primaryArchetype)
  const secondaryArchetype = tasteId.secondaryArchetype
    ? getArchetypeInfo(tasteId.secondaryArchetype)
    : null
  const genreVector = tasteId.genreVector as Record<string, number>

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Progress */}
        <div className="flex justify-center gap-2">
          <div className="w-3 h-3 bg-neutral-700" />
          <div className="w-3 h-3 bg-neutral-700" />
          <div className="w-3 h-3 bg-white" />
          <div className="w-3 h-3 bg-neutral-700" />
        </div>

        {/* Reveal header */}
        <div className="text-center space-y-4">
          <p className="text-neutral-500 uppercase tracking-wider text-sm">
            YOUR TASTEID IS...
          </p>
        </div>

        {/* Archetype reveal */}
        <div className="border-2 border-white p-8 text-center space-y-6">
          <div className="text-6xl">{archetype.icon}</div>
          <div className="space-y-2">
            <ArchetypeBadge {...archetype} size="lg" />
            <p className="text-neutral-400 mt-2">{archetype.description}</p>
          </div>
          {secondaryArchetype && (
            <div className="pt-4 border-t border-neutral-800">
              <p className="text-xs text-neutral-500 mb-2">WITH ELEMENTS OF</p>
              <ArchetypeBadge {...secondaryArchetype} size="sm" />
            </div>
          )}
        </div>

        {/* Radar chart */}
        <div className="flex justify-center">
          <GenreRadarChart genres={genreVector} size={250} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-neutral-800 p-4 text-center">
            <div className="text-3xl font-bold">
              {Math.round(tasteId.adventurenessScore * 100)}%
            </div>
            <div className="text-xs text-neutral-500 uppercase tracking-wider mt-1">
              ADVENTUROUS
            </div>
          </div>
          <div className="border border-neutral-800 p-4 text-center">
            <div className="text-3xl font-bold">
              {tasteId.averageRating.toFixed(1)}
            </div>
            <div className="text-xs text-neutral-500 uppercase tracking-wider mt-1">
              AVG RATING
            </div>
          </div>
        </div>

        {/* Top genres */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-bold">
            YOUR TOP GENRES
          </h3>
          <div className="flex flex-wrap gap-2">
            {tasteId.topGenres.slice(0, 5).map((genre) => (
              <span
                key={genre}
                className="px-3 py-1 border border-white text-sm uppercase"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-4 pt-4">
          <Link
            href="/taste-setup/matches"
            className="block w-full py-4 bg-white text-black font-bold uppercase tracking-wider text-lg text-center hover:bg-neutral-200 transition-colors"
          >
            FIND YOUR TASTE MATCHES
          </Link>
          <Link
            href={`/u/${session.user.username}/tasteid`}
            className="block text-center text-neutral-500 hover:text-white transition-colors"
          >
            View your full TasteID →
          </Link>
        </div>
      </div>
    </div>
  )
}
