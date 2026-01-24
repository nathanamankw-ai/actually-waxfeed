"use client"

import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

type WalletStats = {
  balance: number
  lifetimeEarned: number
  lifetimeSpent: number
  weeklyEarned: number
  weeklyCap: number | null
  weeklyRemaining: number | null
  daysUntilReset: number
  currentStreak: number
  canClaimDaily: boolean
  tier: string
  earnMultiplier: number
}

type Transaction = {
  id: string
  amount: number
  type: string
  description: string
  createdAt: string
  metadata: Record<string, unknown> | null
}

const TX_TYPE_LABELS: Record<string, string> = {
  DAILY_CLAIM: "Daily",
  STREAK_BONUS: "Streak",
  REVIEW_REWARD: "Review",
  WAX_RECEIVED: "Received",
  FIRST_ALBUM_BONUS: "First Review",
  REFERRAL_BONUS: "Referral",
  SUBSCRIPTION_GRANT: "Monthly Grant",
  PURCHASE: "Purchase",
  AWARD_STANDARD: "Awarded",
  AWARD_PREMIUM: "Premium",
  AWARD_GOLD: "GOLD",
  BOOST_REVIEW: "Boost",
  BUY_BADGE: "Badge",
  BUY_FRAME: "Frame",
  USERNAME_CHANGE: "Username",
  TRENDING_BONUS: "Trending",
}

export default function WalletPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [stats, setStats] = useState<WalletStats | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [message, setMessage] = useState("")

  const purchaseSuccess = searchParams.get("purchase")
  const waxAmount = searchParams.get("wax")

  useEffect(() => {
    if (purchaseSuccess === "success" && waxAmount) {
      setMessage(`+${waxAmount} Wax added to your wallet`)
    }
  }, [purchaseSuccess, waxAmount])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?redirect=/wallet")
      return
    }
  }, [status, router])

  useEffect(() => {
    const fetchData = async () => {
      if (!session) return

      try {
        const [statsRes, txRes] = await Promise.all([
          fetch("/api/wax/balance"),
          fetch("/api/wax/transactions?limit=30"),
        ])

        const statsData = await statsRes.json()
        const txData = await txRes.json()

        if (statsData.success) {
          setStats(statsData.data)
        }

        if (txData.success) {
          setTransactions(txData.data.transactions)
        }
      } catch (error) {
        console.error("Failed to fetch wallet data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session])

  const handleClaimDaily = async () => {
    setClaiming(true)
    setMessage("")

    try {
      const res = await fetch("/api/wax/claim-daily", {
        method: "POST",
      })

      const data = await res.json()

      if (data.success) {
        setMessage(`+${data.data.earned} Wax claimed`)
        setStats(data.data.stats)
        const txRes = await fetch("/api/wax/transactions?limit=30")
        const txData = await txRes.json()
        if (txData.success) {
          setTransactions(txData.data.transactions)
        }
      } else {
        setMessage(data.error || "Failed to claim")
      }
    } catch (error) {
      setMessage("Something went wrong")
    } finally {
      setClaiming(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <p className="text-[--muted]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <p className="text-[--muted]">Failed to load wallet.</p>
        </div>
      </div>
    )
  }

  const weeklyProgress = stats.weeklyCap
    ? Math.min((stats.weeklyEarned / stats.weeklyCap) * 100, 100)
    : 0

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Header */}
      <section style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[--muted] mb-3">
                Wallet
              </p>
              <div className="flex items-baseline gap-4">
                <span className="text-6xl lg:text-7xl font-bold tracking-tight tabular-nums">
                  {stats.balance.toLocaleString()}
                </span>
                <span className="text-2xl text-[--muted]">Wax</span>
              </div>
            </div>
            <div className="flex items-center gap-6 lg:gap-8">
              <div className="text-center">
                <p className="text-3xl font-light tabular-nums">{stats.currentStreak}</p>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[--muted]">Day Streak</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-light tabular-nums">{stats.earnMultiplier}x</p>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[--muted]">Multiplier</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">
                  {stats.tier === "WAX_PRO" ? "Pro" : stats.tier === "WAX_PLUS" ? "Wax+" : "Free"}
                </p>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[--muted]">Tier</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {message && (
        <div className="border-b border-[--border]">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <p className="text-sm">{message}</p>
          </div>
        </div>
      )}

      {/* Daily Claim + Stats */}
      <section className="border-b border-[--border]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-4">
            {/* Daily Claim */}
            <div className="px-6 py-8 lg:border-r border-b lg:border-b-0 border-[--border]">
              <p className="text-[10px] tracking-[0.3em] uppercase text-[--muted] mb-4">
                Daily Reward
              </p>
              <button
                onClick={handleClaimDaily}
                disabled={!stats.canClaimDaily || claiming}
                className={`w-full py-3 px-4 text-[11px] tracking-[0.15em] uppercase font-medium transition ${
                  stats.canClaimDaily
                    ? "bg-white text-black hover:bg-[#e5e5e5]"
                    : "border border-[--border] text-[--muted] cursor-not-allowed"
                }`}
              >
                {claiming ? "Claiming..." : stats.canClaimDaily ? "Claim Daily Wax" : "Claimed Today"}
              </button>
              {stats.currentStreak > 0 && (
                <p className="text-xs text-[--muted] mt-3">
                  +{Math.min(stats.currentStreak * 2, 20)} streak bonus
                </p>
              )}
            </div>

            {/* Lifetime Stats */}
            <div className="px-6 py-8 lg:border-r border-b lg:border-b-0 border-[--border]">
              <p className="text-[10px] tracking-[0.3em] uppercase text-[--muted] mb-4">
                Lifetime Earned
              </p>
              <p className="text-3xl font-light tabular-nums text-green-500">
                +{stats.lifetimeEarned.toLocaleString()}
              </p>
            </div>

            <div className="px-6 py-8 lg:border-r border-b lg:border-b-0 border-[--border]">
              <p className="text-[10px] tracking-[0.3em] uppercase text-[--muted] mb-4">
                Lifetime Spent
              </p>
              <p className="text-3xl font-light tabular-nums text-[#ff3b3b]">
                −{stats.lifetimeSpent.toLocaleString()}
              </p>
            </div>

            {/* Weekly Cap (Free users) */}
            <div className="px-6 py-8">
              <p className="text-[10px] tracking-[0.3em] uppercase text-[--muted] mb-4">
                {stats.weeklyCap !== null ? "Weekly Cap" : "Weekly Earned"}
              </p>
              {stats.weeklyCap !== null ? (
                <>
                  <p className="text-3xl font-light tabular-nums">
                    {stats.weeklyEarned}/{stats.weeklyCap}
                  </p>
                  <div className="mt-3 h-1 bg-[--border]">
                    <div 
                      className={`h-full transition-all ${weeklyProgress >= 100 ? 'bg-[#ff3b3b]' : 'bg-white'}`}
                      style={{ width: `${weeklyProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-[--muted] mt-2">
                    Resets in {stats.daysUntilReset}d
                  </p>
                </>
              ) : (
                <p className="text-3xl font-light tabular-nums">
                  {stats.weeklyEarned}
                  <span className="text-sm text-[--muted] ml-2">this week</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Upgrade prompt for capped users */}
      {stats.weeklyCap !== null && weeklyProgress >= 80 && (
        <section className="border-b border-[--border]">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-[--muted]">
              {weeklyProgress >= 100 ? "Weekly cap reached." : "Approaching weekly cap."}{" "}
              Upgrade for unlimited earning.
            </p>
            <Link
              href="/pricing"
              className="text-[11px] tracking-[0.15em] uppercase hover:underline"
            >
              View Plans →
            </Link>
          </div>
        </section>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row">
          {/* Transactions */}
          <section className="lg:w-2/3 px-6 py-10 lg:border-r border-[--border]">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[10px] tracking-[0.3em] uppercase text-[--muted]">
                Transactions
              </p>
              <p className="text-[10px] tracking-[0.15em] uppercase text-[--muted]">
                {transactions.length} recent
              </p>
            </div>

            {transactions.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-[--muted]">No transactions yet.</p>
                <p className="text-sm text-[--muted] mt-2">
                  Start earning Wax by reviewing albums.
                </p>
              </div>
            ) : (
              <div className="space-y-0">
                {transactions.map((tx, index) => (
                  <div 
                    key={tx.id} 
                    className="flex items-center gap-4 py-4 border-b border-[--border] last:border-b-0"
                  >
                    <div className="w-16 text-[10px] tracking-[0.15em] uppercase text-[--muted]">
                      {TX_TYPE_LABELS[tx.type] || tx.type}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{tx.description}</p>
                      <p className="text-[10px] text-[--muted]">
                        {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className={`font-bold tabular-nums ${tx.amount > 0 ? "text-green-500" : "text-[#ff3b3b]"}`}>
                      {tx.amount > 0 ? "+" : ""}{tx.amount}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Quick Actions */}
          <section className="lg:w-1/3 px-6 py-10 border-t lg:border-t-0 border-[--border]">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[--muted] mb-6">
              Quick Actions
            </p>

            <div className="space-y-4">
              <Link
                href="/shop"
                className="block p-4 border border-[--border] hover:border-white transition group"
              >
                <p className="text-sm font-medium group-hover:text-[--muted] transition">
                  Shop
                </p>
                <p className="text-xs text-[--muted] mt-1">
                  Buy Wax Pax & items
                </p>
              </Link>

              <Link
                href="/pricing"
                className="block p-4 border border-[--border] hover:border-white transition group"
              >
                <p className="text-sm font-medium group-hover:text-[--muted] transition">
                  Upgrade
                </p>
                <p className="text-xs text-[--muted] mt-1">
                  Get Wax+ or Pro
                </p>
              </Link>

              <Link
                href="/reviews"
                className="block p-4 border border-[--border] hover:border-white transition group"
              >
                <p className="text-sm font-medium group-hover:text-[--muted] transition">
                  Write Review
                </p>
                <p className="text-xs text-[--muted] mt-1">
                  Earn +10 Wax
                </p>
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-[--border]">
              <p className="text-[10px] tracking-[0.3em] uppercase text-[--muted] mb-4">
                How to Earn
              </p>
              <div className="space-y-3 text-sm text-[--muted]">
                <div className="flex justify-between">
                  <span>Daily login</span>
                  <span>+5</span>
                </div>
                <div className="flex justify-between">
                  <span>First review of day</span>
                  <span>+10</span>
                </div>
                <div className="flex justify-between">
                  <span>First album review</span>
                  <span>+15</span>
                </div>
                <div className="flex justify-between">
                  <span>Streak bonus</span>
                  <span>+2/day</span>
                </div>
                <div className="flex justify-between">
                  <span>Trending review</span>
                  <span>+50</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
