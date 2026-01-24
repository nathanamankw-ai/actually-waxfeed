"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"

type UserStats = {
  tastemakeScore: number
  goldSpinCount: number
  silverSpinCount: number
  bronzeSpinCount: number
  waxBalance: number
}

export function FirstSpinWidget() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!session?.user) {
        setLoading(false)
        return
      }
      try {
        const res = await fetch("/api/wax/balance")
        const data = await res.json()
        if (data.success) {
          setStats({
            tastemakeScore: data.data.tastemakeScore || 0,
            goldSpinCount: data.data.goldSpinCount || 0,
            silverSpinCount: data.data.silverSpinCount || 0,
            bronzeSpinCount: data.data.bronzeSpinCount || 0,
            waxBalance: data.data.balance || 0,
          })
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [session])

  if (!session) {
    return (
      <div className="border border-[--border]">
        {/* Header */}
        <div className="p-4 border-b border-[--border]">
          <h3 className="text-[10px] tracking-[0.3em] uppercase text-[--muted] mb-2">
            First Spin
          </h3>
          <p className="text-xl font-bold">Prove Your Taste</p>
        </div>

        {/* Value Prop */}
        <div className="p-4 border-b border-[--border]">
          <p className="text-sm text-[--muted] mb-4">
            Review albums early. If they blow up, you get credit.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 flex items-center justify-center border border-[#ffd700] text-[#ffd700] text-xs font-bold">G</span>
              <div>
                <p className="text-sm font-medium">Gold Spin</p>
                <p className="text-xs text-[--muted]">First 10 reviewers</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 flex items-center justify-center border border-gray-400 text-gray-400 text-xs font-bold">S</span>
              <div>
                <p className="text-sm font-medium">Silver Spin</p>
                <p className="text-xs text-[--muted]">First 50 reviewers</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 flex items-center justify-center border border-amber-700 text-amber-700 text-xs font-bold">B</span>
              <div>
                <p className="text-sm font-medium">Bronze Spin</p>
                <p className="text-xs text-[--muted]">First 100 reviewers</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="p-4">
          <Link
            href="/login"
            className="block w-full py-3 bg-white text-black text-center text-[10px] tracking-[0.15em] uppercase font-bold hover:bg-[#e5e5e5] transition no-underline"
          >
            Start Collecting Spins
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="border border-[--border] p-4">
        <p className="text-[10px] tracking-[0.3em] uppercase text-[--muted]">
          Loading...
        </p>
      </div>
    )
  }

  const hasAnySpins = stats && (stats.goldSpinCount > 0 || stats.silverSpinCount > 0 || stats.bronzeSpinCount > 0)

  return (
    <div className="border border-[--border]">
      {/* Header with Tastemaker Score */}
      <div className="p-4 border-b border-[--border]">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[10px] tracking-[0.3em] uppercase text-[--muted]">
            Tastemaker
          </h3>
          <span className="text-[10px] tracking-[0.2em] uppercase text-[--muted]">
            Score
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-3xl font-bold tabular-nums">{stats?.tastemakeScore || 0}</p>
          <div className="text-right">
            <p className="text-sm text-[--muted]">{stats?.waxBalance?.toLocaleString() || 0}</p>
            <p className="text-[10px] text-[--muted]">Wax</p>
          </div>
        </div>
      </div>

      {/* Spin Badges */}
      <div className="p-4 border-b border-[--border]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 text-center p-3 border border-[--border]">
            <div className="w-8 h-8 mx-auto mb-1 flex items-center justify-center border border-[#ffd700] text-[#ffd700] text-xs font-bold">
              G
            </div>
            <p className="text-2xl font-bold tabular-nums">{stats?.goldSpinCount || 0}</p>
            <p className="text-[9px] text-[--muted] uppercase tracking-wider">Gold</p>
          </div>
          <div className="flex-1 text-center p-3 border border-[--border]">
            <div className="w-8 h-8 mx-auto mb-1 flex items-center justify-center border border-gray-400 text-gray-400 text-xs font-bold">
              S
            </div>
            <p className="text-2xl font-bold tabular-nums">{stats?.silverSpinCount || 0}</p>
            <p className="text-[9px] text-[--muted] uppercase tracking-wider">Silver</p>
          </div>
          <div className="flex-1 text-center p-3 border border-[--border]">
            <div className="w-8 h-8 mx-auto mb-1 flex items-center justify-center border border-amber-700 text-amber-700 text-xs font-bold">
              B
            </div>
            <p className="text-2xl font-bold tabular-nums">{stats?.bronzeSpinCount || 0}</p>
            <p className="text-[9px] text-[--muted] uppercase tracking-wider">Bronze</p>
          </div>
        </div>
      </div>

      {/* How It Works / Call to Action */}
      <div className="p-4">
        {hasAnySpins ? (
          <div>
            <p className="text-sm text-[--muted] mb-3">
              You've called {stats?.goldSpinCount + stats?.silverSpinCount + stats?.bronzeSpinCount} trending album{(stats?.goldSpinCount + stats?.silverSpinCount + stats?.bronzeSpinCount) !== 1 ? 's' : ''} early.
            </p>
            <Link
              href="/discover"
              className="block w-full py-2.5 border border-[--border] text-center text-[10px] tracking-[0.15em] uppercase hover:border-white transition no-underline"
            >
              Find Your Next Call
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-sm text-[--muted] mb-3">
              Review albums before they trend. Earn badges when you're right.
            </p>
            <Link
              href="/discover"
              className="block w-full py-2.5 bg-white text-black text-center text-[10px] tracking-[0.15em] uppercase font-bold hover:bg-[#e5e5e5] transition no-underline"
            >
              Discover New Albums
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
