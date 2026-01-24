"use client"

import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function PricingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentTier, setCurrentTier] = useState<string>("FREE")
  const [loading, setLoading] = useState<string | null>(null)
  const [message, setMessage] = useState("")

  const canceled = searchParams.get("canceled")

  useEffect(() => {
    if (canceled) {
      setMessage("Checkout canceled.")
    }
  }, [canceled])

  useEffect(() => {
    const fetchUserTier = async () => {
      if (!session?.user) return
      try {
        const res = await fetch("/api/wax/balance")
        const data = await res.json()
        if (data.success) {
          setCurrentTier(data.data.tier || "FREE")
        }
      } catch (error) {
        console.error("Failed to fetch tier:", error)
      }
    }
    fetchUserTier()
  }, [session])

  const handleSubscribe = async (tier: "WAX_PLUS" | "WAX_PRO") => {
    if (!session) {
      router.push("/login?redirect=/pricing")
      return
    }

    setLoading(tier)
    setMessage("")

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "subscription",
          productId: tier,
        }),
      })

      const data = await res.json()

      if (data.success && data.data.url) {
        window.location.href = data.data.url
      } else {
        setMessage(data.error || "Failed to start checkout")
      }
    } catch (error) {
      setMessage("Something went wrong")
    } finally {
      setLoading(null)
    }
  }

  const handleManageSubscription = async () => {
    setLoading("manage")
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
      })
      const data = await res.json()
      if (data.success && data.data.url) {
        window.location.href = data.data.url
      } else {
        setMessage(data.error || "Failed to open portal")
      }
    } catch (error) {
      setMessage("Something went wrong")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Header */}
      <section style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[--muted] mb-3">
            Membership
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-[-0.02em] mb-4">
            Prove Your Taste
          </h1>
          <p className="text-base text-[--muted] max-w-xl">
            Everyone earns First Spin badges. Subscribers get more Wax to tip, 
            trending predictions, and priority visibility.
          </p>
        </div>
      </section>

      {message && (
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <div className="p-4 border border-[--border]">
            <p className="text-sm">{message}</p>
          </div>
        </div>
      )}

      {/* First Spin Explanation */}
      <section className="border-b border-[--border]">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[--muted] mb-8">
            How First Spin Works
          </p>
          <div className="grid lg:grid-cols-3 gap-8">
            <div>
              <div className="w-12 h-12 border border-[--border] flex items-center justify-center mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <p className="text-lg font-medium mb-2">Review Early</p>
              <p className="text-sm text-[--muted]">
                When you review an album, your position is recorded. #1, #7, #42—you're on record.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 border border-[--border] flex items-center justify-center mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <p className="text-lg font-medium mb-2">Album Trends</p>
              <p className="text-sm text-[--muted]">
                When an album hits 100+ reviews, it's trending. The algorithm checks who was early.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 border border-[--border] flex items-center justify-center mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <p className="text-lg font-medium mb-2">Earn Badges</p>
              <p className="text-sm text-[--muted]">
                Early reviewers get Gold, Silver, or Bronze Spin badges—plus Wax rewards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Badge Tiers */}
      <section className="border-b border-[--border]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3">
            <div className="px-6 py-10 lg:border-r border-b lg:border-b-0 border-[--border]">
              <div className="w-12 h-12 border-2 border-[#ffd700] flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-[#ffd700]">G</span>
              </div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[--muted] mb-2">
                Gold Spin
              </p>
              <p className="text-3xl font-bold text-[#ffd700] mb-2">+100 Wax</p>
              <p className="text-sm text-[--muted]">
                First 10 reviewers. Proves elite taste. Adds 10 to your Tastemaker Score.
              </p>
            </div>
            <div className="px-6 py-10 lg:border-r border-b lg:border-b-0 border-[--border]">
              <div className="w-12 h-12 border-2 border-gray-400 flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-gray-400">S</span>
              </div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[--muted] mb-2">
                Silver Spin
              </p>
              <p className="text-3xl font-bold text-gray-400 mb-2">+50 Wax</p>
              <p className="text-sm text-[--muted]">
                First 50 reviewers. Still early, still counts. Adds 5 to your Tastemaker Score.
              </p>
            </div>
            <div className="px-6 py-10">
              <div className="w-12 h-12 border-2 border-amber-700 flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-amber-700">B</span>
              </div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[--muted] mb-2">
                Bronze Spin
              </p>
              <p className="text-3xl font-bold text-amber-700 mb-2">+25 Wax</p>
              <p className="text-sm text-[--muted]">
                First 100 reviewers. You caught it early. Adds 2 to your Tastemaker Score.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="border-b border-[--border]">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[--muted] mb-8">
            Membership Tiers
          </p>
        </div>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3">
          {/* Free Tier */}
          <div className="px-6 py-10 border-t lg:border-r border-[--border]">
            <div className="mb-8">
              <p className="text-[10px] tracking-[0.3em] uppercase text-[--muted] mb-3">
                Free
              </p>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-5xl font-bold tracking-tight">$0</span>
              </div>
              <p className="text-sm text-[--muted]">
                For everyone
              </p>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3">
                <span className="text-[--muted] mt-0.5">+</span>
                <span className="text-sm">Earn First Spin badges</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[--muted] mt-0.5">+</span>
                <span className="text-sm">+5 Wax per review</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[--muted] mt-0.5">+</span>
                <span className="text-sm">Tastemaker Score</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[--muted] mt-0.5">+</span>
                <span className="text-sm">Tip reviews (Standard)</span>
              </div>
              <div className="flex items-start gap-3 text-[--muted]">
                <span className="mt-0.5">−</span>
                <span className="text-sm">50 Wax tip limit/week</span>
              </div>
            </div>

            <button
              disabled
              className="w-full py-3 px-4 border border-[--border] text-[--muted] text-[11px] tracking-[0.15em] uppercase cursor-not-allowed"
            >
              {currentTier === "FREE" ? "Current Plan" : "Downgrade via Portal"}
            </button>
          </div>

          {/* Wax+ Tier */}
          <div className="px-6 py-10 border-t lg:border-r border-[--border] relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-white" />
            
            <div className="mb-8">
              <p className="text-[10px] tracking-[0.3em] uppercase text-[--muted] mb-3">
                Wax+
              </p>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-5xl font-bold tracking-tight">$4.99</span>
                <span className="text-sm text-[--muted]">/mo</span>
              </div>
              <p className="text-sm text-[--muted]">
                For active reviewers
              </p>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3">
                <span className="text-white mt-0.5">+</span>
                <span className="text-sm">Everything in Free</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-white mt-0.5">+</span>
                <span className="text-sm font-medium">Unlimited Wax tipping</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-white mt-0.5">+</span>
                <span className="text-sm">Trending predictions</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-white mt-0.5">+</span>
                <span className="text-sm">Priority badge visibility</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-white mt-0.5">+</span>
                <span className="text-sm">Tip Premium Wax (20)</span>
              </div>
            </div>

            {currentTier === "WAX_PLUS" ? (
              <button
                onClick={handleManageSubscription}
                disabled={loading === "manage"}
                className="w-full py-3 px-4 border border-[--border] text-[11px] tracking-[0.15em] uppercase hover:bg-[--border]/20 transition disabled:opacity-50"
              >
                {loading === "manage" ? "Loading..." : "Manage Subscription"}
              </button>
            ) : (
              <button
                onClick={() => handleSubscribe("WAX_PLUS")}
                disabled={loading === "WAX_PLUS" || currentTier === "WAX_PRO"}
                className="w-full py-3 px-4 bg-white text-black text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-[#e5e5e5] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === "WAX_PLUS" ? "Loading..." : currentTier === "WAX_PRO" ? "Current: Pro" : "Upgrade"}
              </button>
            )}
          </div>

          {/* Pro Tier */}
          <div className="px-6 py-10 border-t border-[--border] relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#ffd700]" />
            
            <div className="mb-8">
              <p className="text-[10px] tracking-[0.3em] uppercase text-[--muted] mb-3">
                Pro
              </p>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-5xl font-bold tracking-tight">$9.99</span>
                <span className="text-sm text-[--muted]">/mo</span>
              </div>
              <p className="text-sm text-[--muted]">
                For tastemakers
              </p>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3">
                <span className="text-[#ffd700] mt-0.5">+</span>
                <span className="text-sm">Everything in Wax+</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#ffd700] mt-0.5">+</span>
                <span className="text-sm font-medium">Tip GOLD Wax (100)</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#ffd700] mt-0.5">+</span>
                <span className="text-sm">Advanced analytics</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#ffd700] mt-0.5">+</span>
                <span className="text-sm">Verified badge eligible</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#ffd700] mt-0.5">+</span>
                <span className="text-sm">Early access features</span>
              </div>
            </div>

            {currentTier === "WAX_PRO" ? (
              <button
                onClick={handleManageSubscription}
                disabled={loading === "manage"}
                className="w-full py-3 px-4 border border-[#ffd700]/50 text-[#ffd700] text-[11px] tracking-[0.15em] uppercase hover:bg-[#ffd700]/10 transition disabled:opacity-50"
              >
                {loading === "manage" ? "Loading..." : "Manage Subscription"}
              </button>
            ) : (
              <button
                onClick={() => handleSubscribe("WAX_PRO")}
                disabled={loading === "WAX_PRO"}
                className="w-full py-3 px-4 bg-[#ffd700] text-black text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-[#ffed4a] transition disabled:opacity-50"
              >
                {loading === "WAX_PRO" ? "Loading..." : "Go Pro"}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-[--border]">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[--muted] mb-8">
            FAQ
          </p>
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <p className="text-sm font-medium mb-2">Do I need to pay for First Spin badges?</p>
              <p className="text-sm text-[--muted]">
                No. Everyone earns badges for free. Just review albums early and wait for them to trend.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">What do subscribers get?</p>
              <p className="text-sm text-[--muted]">
                Unlimited tipping, trending predictions, higher-tier Wax awards (Premium/GOLD), 
                and priority visibility for your reviews.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">What is Wax used for?</p>
              <p className="text-sm text-[--muted]">
                Tip reviewers you appreciate. Higher tips give them more Wax and visibility.
                It's social currency that shows community respect.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Can I cancel anytime?</p>
              <p className="text-sm text-[--muted]">
                Yes. Manage or cancel via the billing portal. Your badges and Tastemaker Score stay forever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer nav */}
      <footer className="border-t border-[--border]">
        <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
          <Link
            href="/wallet"
            className="text-[11px] tracking-[0.15em] uppercase text-[--muted] hover:text-white transition-colors flex items-center gap-2"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            Your Spins
          </Link>
          <Link
            href="/leaderboard"
            className="text-[11px] tracking-[0.15em] uppercase text-[--muted] hover:text-white transition-colors flex items-center gap-2"
          >
            Leaderboard
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </footer>
    </div>
  )
}
