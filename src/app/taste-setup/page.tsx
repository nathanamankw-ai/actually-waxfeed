import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import {
  BrainNetworkIcon,
  TasteTwinIcon,
  DiscoveryIcon,
  AestheticIcon,
} from "@/components/icons/network-icons"

export default async function TasteSetupPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/taste-setup")
  }

  // Check if user already has a TasteID
  const tasteId = await prisma.tasteID.findUnique({
    where: { userId: session.user.id },
  })

  if (tasteId) {
    // Already has TasteID, redirect to it
    redirect(`/u/${session.user.username}/tasteid`)
  }

  // Check review count
  const reviewCount = await prisma.review.count({
    where: { userId: session.user.id },
  })

  if (reviewCount >= 20) {
    // Has enough reviews, just compute and redirect
    redirect("/taste-setup/result")
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      <div className="max-w-xl w-full text-center space-y-8">
        {/* Progress indicator */}
        <div className="flex justify-center gap-2">
          <div className="w-3 h-3 bg-[--foreground]" />
          <div className="w-3 h-3 bg-[--border]" />
          <div className="w-3 h-3 bg-[--border]" />
          <div className="w-3 h-3 bg-[--border]" />
        </div>

        {/* TasteID Logo */}
        <div className="flex justify-center">
          <div className="w-20 h-20 flex items-center justify-center border-2 border-violet-500/50 bg-gradient-to-br from-violet-500/10 to-blue-500/10">
            <BrainNetworkIcon size={40} color="rgb(139, 92, 246)" />
          </div>
        </div>

        {/* Hero */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-wider">
            UNLOCK YOUR TASTEID
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-[--muted]">
            YOUR MUSICAL FINGERPRINT
          </h2>
        </div>

        {/* Description */}
        <p className="text-lg text-[--muted] max-w-md mx-auto">
          Rate albums to map your unique listening signature. Your TasteID reveals your musical personality and connects you with like-minded listeners.
        </p>

        {/* What you'll get */}
        <div className="border-2 border-[--foreground] p-6 text-left space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-[--muted] font-bold">
            WHAT YOU'LL UNLOCK
          </h3>
          <ul className="space-y-4">
            <li className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center border border-violet-500/30 bg-violet-500/10 flex-shrink-0">
                <BrainNetworkIcon size={20} color="rgb(139, 92, 246)" />
              </div>
              <div>
                <span className="font-semibold">Your TasteID archetype</span>
                <p className="text-xs text-[--muted]">Discover your unique listening personality</p>
              </div>
            </li>
            <li className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center border border-emerald-500/30 bg-emerald-500/10 flex-shrink-0">
                <TasteTwinIcon size={20} color="rgb(16, 185, 129)" />
              </div>
              <div>
                <span className="font-semibold">Taste connections</span>
                <p className="text-xs text-[--muted]">Match with people who share your listening patterns</p>
              </div>
            </li>
            <li className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center border border-blue-500/30 bg-blue-500/10 flex-shrink-0">
                <DiscoveryIcon size={20} color="rgb(59, 130, 246)" />
              </div>
              <div>
                <span className="font-semibold">Personalized discovery</span>
                <p className="text-xs text-[--muted]">Recommendations tailored to your taste signature</p>
              </div>
            </li>
            <li className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center border border-amber-500/30 bg-amber-500/10 flex-shrink-0">
                <AestheticIcon size={20} color="rgb(245, 158, 11)" />
              </div>
              <div>
                <span className="font-semibold">Shareable taste card</span>
                <p className="text-xs text-[--muted]">Show off your unique musical identity</p>
              </div>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <Link
            href="/taste-setup/rate"
            className="inline-block w-full md:w-auto px-8 py-4 bg-gradient-to-r from-violet-500 to-blue-500 text-white font-bold uppercase tracking-wider text-lg hover:opacity-90 transition-opacity"
          >
            START RATING
          </Link>
          <div>
            <Link
              href="/"
              className="text-sm text-[--muted] hover:text-[--foreground] transition-colors"
            >
              Skip for now →
            </Link>
          </div>
        </div>

        {/* Info */}
        <p className="text-xs text-[--muted] uppercase tracking-wider">
          Rate 20 albums to unlock your TasteID
        </p>
      </div>
    </div>
  )
}
