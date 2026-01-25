"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"

type WalletStats = {
  balance: number
  canClaimDaily: boolean
  currentStreak: number
  tier: string
  weeklyRemaining: number | null
  weeklyCap: number | null
}

export function WaxBalance() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<WalletStats | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    const fetchBalance = async () => {
      if (!session?.user) return
      try {
        const res = await fetch("/api/wax/balance")
        const data = await res.json()
        if (data.success) {
          setStats(data.data)
        }
      } catch (error) {
        console.error("Failed to fetch balance:", error)
      }
    }
    fetchBalance()
  }, [session])

  if (!session || !stats) return null

  const hasNotification = stats.canClaimDaily

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-1.5 border border-[--header-border] hover:opacity-70 transition"
        style={{ color: 'var(--header-text)' }}
      >
        <span className="text-[10px] tracking-[0.1em] uppercase">Wax</span>
        <span className="font-bold tabular-nums">{stats.balance.toLocaleString()}</span>
        {hasNotification && (
          <span className="w-1.5 h-1.5 bg-[#ff3b3b]" />
        )}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div 
            className="absolute right-0 mt-2 w-56 border border-[--border] shadow-xl z-50"
            style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
          >
            {/* Balance */}
            <div className="p-4 border-b border-[--border]">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[--muted] mb-1">Balance</p>
              <p className="text-2xl font-bold tabular-nums">{stats.balance.toLocaleString()}</p>
              {stats.currentStreak > 0 && (
                <p className="text-xs text-[--muted] mt-1">
                  {stats.currentStreak} day streak
                </p>
              )}
            </div>

            {/* Daily Reward */}
            {stats.canClaimDaily && (
              <Link
                href="/wallet"
                onClick={() => setShowDropdown(false)}
                className="block p-3 border-b border-[--border] hover:bg-[--border]/20 transition"
              >
                <p className="text-[10px] tracking-[0.15em] uppercase text-green-500">
                  Daily Wax Ready
                </p>
                <p className="text-xs text-[--muted]">Tap to claim</p>
              </Link>
            )}

            {/* Weekly Cap Warning */}
            {stats.weeklyCap !== null && stats.weeklyRemaining !== null && stats.weeklyRemaining <= 20 && (
              <div className="p-3 border-b border-[--border]">
                <p className="text-[10px] tracking-[0.15em] uppercase text-[#ff3b3b]">
                  {stats.weeklyRemaining === 0 ? "Weekly cap reached" : `${stats.weeklyRemaining} Wax remaining`}
                </p>
                <Link 
                  href="/pricing" 
                  onClick={() => setShowDropdown(false)}
                  className="text-xs text-[--muted] hover:underline"
                >
                  Upgrade for unlimited →
                </Link>
              </div>
            )}

            {/* Actions */}
            <div className="p-2">
              <Link
                href="/wallet"
                onClick={() => setShowDropdown(false)}
                className="block px-3 py-2 text-sm hover:bg-[--border]/20 transition"
              >
                Wallet
              </Link>
              <Link
                href="/shop"
                onClick={() => setShowDropdown(false)}
                className="block px-3 py-2 text-sm hover:bg-[--border]/20 transition"
              >
                Shop
              </Link>
              <Link
                href="/pricing"
                onClick={() => setShowDropdown(false)}
                className="block px-3 py-2 text-sm hover:bg-[--border]/20 transition flex items-center justify-between"
              >
                <span>Upgrade</span>
                {stats.tier === "FREE" && (
                  <span className="text-[10px] text-[--muted]">2x earning</span>
                )}
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
