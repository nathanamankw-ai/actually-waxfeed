"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useState, useEffect, useRef } from "react"
import { DefaultAvatar } from "./default-avatar"
import { WaxfeedLogo } from "./waxfeed-logo"
import { useTheme } from "./theme-provider"

type WaxStats = {
  balance: number
  tastemakeScore: number
  goldSpinCount: number
  silverSpinCount: number
  bronzeSpinCount: number
  tier: string
  hasTasteID?: boolean
  reviewCount?: number
}

export function Header() {
  const { data: session, status } = useSession()
  const { theme, toggleTheme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [waxStats, setWaxStats] = useState<WaxStats | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Fetch Wax stats
  useEffect(() => {
    const fetchWax = async () => {
      if (!session?.user) return
      try {
        const res = await fetch("/api/wax/balance")
        const data = await res.json()
        if (data.success) {
          setWaxStats({
            balance: data.data.balance || 0,
            tastemakeScore: data.data.tastemakeScore || 0,
            goldSpinCount: data.data.goldSpinCount || 0,
            silverSpinCount: data.data.silverSpinCount || 0,
            bronzeSpinCount: data.data.bronzeSpinCount || 0,
            tier: data.data.tier || 'FREE',
            hasTasteID: data.data.hasTasteID || false,
            reviewCount: data.data.reviewCount || 0,
          })
        }
      } catch (error) {
        console.error("Failed to fetch wax:", error)
      }
    }
    fetchWax()
  }, [session])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
      setMobileMenuOpen(false)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a] border-b border-[#222]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline flex-shrink-0">
          <WaxfeedLogo size="md" />
          <span className="font-bold text-xl tracking-tight text-white">WAXFEED</span>
        </Link>

        {/* Desktop Search */}
        <form onSubmit={handleSearch} className="hidden lg:block flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search albums, artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 text-sm bg-[#111] border border-[#333] text-white placeholder-[#666] focus:outline-none focus:border-[#555] transition-colors"
          />
        </form>

        {/* Desktop Navigation - Simplified */}
        <nav className="hidden lg:flex items-center gap-6">
          {/* Core Navigation */}
          <Link href="/discover" className="text-sm text-[#888] hover:text-white transition-colors">
            Discover
          </Link>
          <Link href="/trending" className="text-sm text-[#888] hover:text-white transition-colors">
            Trending
          </Link>
          
          {/* Quick Rate CTA - for users building TasteID */}
          {isMounted && session && waxStats && !waxStats.hasTasteID && (waxStats.reviewCount || 0) < 20 && (
            <Link
              href="/quick-rate"
              className="px-4 py-2 bg-[#ffd700] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#ffed4a] transition-colors"
            >
              Build TasteID
            </Link>
          )}
          
          {/* WAX Balance */}
          {isMounted && session && waxStats && (
            <Link
              href="/wallet"
              className="flex items-center gap-2 px-3 py-1.5 border border-[#333] hover:border-[#555] transition-colors"
            >
              <span className="text-xs text-[#888]">WAX</span>
              <span className="text-sm font-bold text-[#ffd700]">{waxStats.balance.toLocaleString()}</span>
            </Link>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-[#888] hover:text-white transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>

          {/* User Menu */}
          {!isMounted || status === "loading" ? (
            <span className="text-[#555]">...</span>
          ) : session ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2"
              >
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt=""
                    className="w-9 h-9 object-cover border border-[#333]"
                  />
                ) : (
                  <DefaultAvatar size="sm" />
                )}
              </button>

              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 min-w-52 py-2 bg-[#111] border border-[#333] shadow-xl">
                  <div className="px-4 py-3 border-b border-[#333]">
                    <p className="font-bold text-white">{session.user?.username || session.user?.name}</p>
                    <p className="text-xs text-[#666] mt-0.5">{session.user?.email}</p>
                  </div>

                  <Link
                    href={`/u/${session.user?.username || session.user?.id}`}
                    className="block px-4 py-2.5 text-sm text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/wallet"
                    className="block px-4 py-2.5 text-sm text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    Wallet & Badges
                  </Link>
                  <Link
                    href="/friends"
                    className="block px-4 py-2.5 text-sm text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    Friends
                  </Link>
                  <Link
                    href="/messages"
                    className="block px-4 py-2.5 text-sm text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    Messages
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2.5 text-sm text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    Settings
                  </Link>
                  
                  <div className="border-t border-[#333] mt-2 pt-2">
                    <button
                      onClick={() => signOut()}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-[#1a1a1a] transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-5 py-2 bg-white text-black text-sm font-bold hover:bg-[#eee] transition-colors"
            >
              Sign In
            </Link>
          )}
        </nav>

        {/* Mobile Navigation */}
        <div className="flex lg:hidden items-center gap-2">
          {/* WAX Balance - Mobile */}
          {isMounted && session && waxStats && (
            <Link
              href="/wallet"
              className="flex items-center gap-1 px-2 py-1 text-[#ffd700]"
            >
              <span className="text-xs">{waxStats.balance}</span>
            </Link>
          )}
          
          {/* Search */}
          <Link href="/search" className="p-2 text-[#888]" aria-label="Search">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>

          {/* Menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-40 bg-[#0a0a0a] overflow-y-auto">
          {/* Search */}
          <form onSubmit={handleSearch} className="p-4 border-b border-[#222]">
            <input
              type="text"
              placeholder="Search albums, artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 text-base bg-[#111] border border-[#333] text-white placeholder-[#666] focus:outline-none"
              autoFocus
            />
          </form>

          {/* TasteID CTA */}
          {isMounted && session && waxStats && !waxStats.hasTasteID && (waxStats.reviewCount || 0) < 20 && (
            <div className="p-4 border-b border-[#222]">
              <Link
                href="/quick-rate"
                className="block w-full px-4 py-4 text-center text-sm font-bold bg-[#ffd700] text-black"
                onClick={() => setMobileMenuOpen(false)}
              >
                Build Your TasteID ({waxStats?.reviewCount || 0}/20)
              </Link>
            </div>
          )}

          {/* Main Navigation */}
          <nav className="py-2">
            <Link
              href="/"
              className="flex items-center justify-between px-6 py-4 text-base font-medium text-white border-b border-[#222]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
              <svg className="w-5 h-5 text-[#444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/discover"
              className="flex items-center justify-between px-6 py-4 text-base font-medium text-white border-b border-[#222]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Discover
              <svg className="w-5 h-5 text-[#444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/trending"
              className="flex items-center justify-between px-6 py-4 text-base font-medium text-white border-b border-[#222]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Trending
              <svg className="w-5 h-5 text-[#444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/lists"
              className="flex items-center justify-between px-6 py-4 text-base font-medium text-white border-b border-[#222]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Lists
              <svg className="w-5 h-5 text-[#444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-between w-full px-6 py-4 text-base font-medium text-white border-b border-[#222]"
            >
              {theme === "dark" ? "Dark Mode" : "Light Mode"}
              {theme === "dark" ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
          </nav>

          {/* User Section */}
          {status !== "loading" && (
            session ? (
              <div className="border-t border-[#222] mt-4 pt-4">
                {/* User Info */}
                <div className="px-6 py-4 flex items-center gap-4">
                  {session.user?.image ? (
                    <img src={session.user.image} alt="" className="w-14 h-14 object-cover border border-[#333]" />
                  ) : (
                    <DefaultAvatar size="md" />
                  )}
                  <div>
                    <p className="font-bold text-white">{session.user?.username || session.user?.name}</p>
                    <p className="text-sm text-[#666]">{session.user?.email}</p>
                  </div>
                </div>

                {/* WAX Stats */}
                {waxStats && (
                  <div className="mx-6 p-4 bg-[#111] border border-[#333] mb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-[#666] uppercase">WAX Balance</p>
                        <p className="text-2xl font-bold text-[#ffd700]">{waxStats.balance.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#666] uppercase">Score</p>
                        <p className="text-2xl font-bold">{waxStats.tastemakeScore}</p>
                      </div>
                    </div>
                  </div>
                )}

                <Link
                  href={`/u/${session.user?.username || session.user?.id}`}
                  className="flex items-center justify-between px-6 py-4 text-base text-white border-b border-[#222]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                  <svg className="w-5 h-5 text-[#444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/wallet"
                  className="flex items-center justify-between px-6 py-4 text-base text-white border-b border-[#222]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Wallet & Badges
                  <svg className="w-5 h-5 text-[#444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/friends"
                  className="flex items-center justify-between px-6 py-4 text-base text-white border-b border-[#222]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Friends
                  <svg className="w-5 h-5 text-[#444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/messages"
                  className="flex items-center justify-between px-6 py-4 text-base text-white border-b border-[#222]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Messages
                  <svg className="w-5 h-5 text-[#444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center justify-between px-6 py-4 text-base text-white border-b border-[#222]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Settings
                  <svg className="w-5 h-5 text-[#444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <button
                  onClick={() => { signOut(); setMobileMenuOpen(false) }}
                  className="w-full text-left px-6 py-4 text-base text-red-500 font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="p-6 mt-4 space-y-3 border-t border-[#222]">
                <Link
                  href="/login"
                  className="block w-full px-4 py-4 text-sm font-bold text-center bg-white text-black"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="block w-full px-4 py-4 text-sm font-bold text-center border-2 border-white text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Create Account
                </Link>
              </div>
            )
          )}
        </div>
      )}
    </header>
  )
}
