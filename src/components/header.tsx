"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useState, useEffect, useRef } from "react"
import { DefaultAvatar } from "./default-avatar"
import { WaxfeedLogo } from "./waxfeed-logo"
import { useTheme } from "./theme-provider"

export function Header() {
  const { data: session, status } = useSession()
  const { theme, toggleTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-colors duration-200" style={{ backgroundColor: 'var(--header-bg)', color: 'var(--header-text)', borderBottom: '1px solid var(--header-border)' }}>
      <div className="max-w-7xl mx-auto px-4 h-14 lg:h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline flex-shrink-0">
          <WaxfeedLogo size="md" />
          <span className="font-bold text-lg lg:text-xl tracking-tight">WAXFEED</span>
        </Link>

        {/* Desktop Search - only show on large screens */}
        <form onSubmit={handleSearch} className="hidden lg:block flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search albums, users, lists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 text-sm focus:outline-none transition-colors"
            style={{
              backgroundColor: 'var(--header-bg)',
              color: 'var(--header-text)',
              border: '1px solid var(--header-border)'
            }}
          />
        </form>

        {/* Desktop Navigation - only show on large screens */}
        <nav className="hidden lg:flex items-center gap-6 text-sm">
          <Link href="/" className="no-underline hover:underline">
            Home
          </Link>
          <Link href="/discover" className="no-underline hover:underline">
            Discover
          </Link>
          <Link href="/trending" className="no-underline hover:underline">
            Trending
          </Link>
          <Link href="/lists" className="no-underline hover:underline">
            Lists
          </Link>
          <Link href="/hot-takes" className="no-underline hover:underline">
            Hot Takes
          </Link>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:opacity-70 transition-opacity"
            aria-label="Toggle theme"
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>

          {status === "loading" ? (
            <span style={{ opacity: 0.5 }}>...</span>
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
                    className="w-8 h-8 object-cover"
                    style={{ border: '1px solid var(--header-border)' }}
                  />
                ) : (
                  <DefaultAvatar size="sm" />
                )}
              </button>

              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 min-w-48 py-2 shadow-lg" style={{ backgroundColor: 'var(--header-bg)', border: '1px solid var(--header-border)' }}>
                  <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--header-border)' }}>
                    <p className="font-bold">{session.user?.username || session.user?.name}</p>
                    <p className="text-xs" style={{ opacity: 0.6 }}>{session.user?.email}</p>
                  </div>
                  <Link
                    href={`/u/${session.user?.username || session.user?.id}`}
                    className="block px-4 py-2 no-underline hover:opacity-70"
                    onClick={() => setShowDropdown(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/notifications"
                    className="block px-4 py-2 no-underline hover:opacity-70"
                    onClick={() => setShowDropdown(false)}
                  >
                    Notifications
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 no-underline hover:opacity-70"
                    onClick={() => setShowDropdown(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="w-full text-left px-4 py-2 hover:opacity-70 mt-2"
                    style={{ borderTop: '1px solid var(--header-border)' }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-bold no-underline transition-colors inline-block"
              style={{ backgroundColor: 'var(--header-text)', color: 'var(--header-bg)' }}
            >
              Sign In
            </Link>
          )}
        </nav>

        {/* Mobile/Tablet: Search icon + Menu button */}
        <div className="flex lg:hidden items-center gap-2">
          {/* Search icon - links to search page */}
          <Link
            href="/search"
            className="p-2 hover:bg-gray-100 transition-colors"
            aria-label="Search"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>

          {/* Menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-gray-100 transition-colors"
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

      {/* Mobile/Tablet Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-14 z-40 overflow-y-auto" style={{ backgroundColor: 'var(--header-bg)', color: 'var(--header-text)' }}>
          {/* Search bar in menu */}
          <form onSubmit={handleSearch} className="p-4" style={{ borderBottom: '1px solid var(--header-border)' }}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search albums, artists, users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 text-base focus:outline-none"
                style={{
                  backgroundColor: 'var(--header-bg)',
                  color: 'var(--header-text)',
                  border: '1px solid var(--header-border)'
                }}
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ opacity: 0.6 }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Nav Links */}
          <nav>
            <Link
              href="/"
              className="flex items-center justify-between px-4 py-4 text-lg font-medium no-underline hover:opacity-70"
              style={{ borderBottom: '1px solid var(--header-border)' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Home</span>
              <svg className="w-5 h-5" style={{ opacity: 0.5 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/discover"
              className="flex items-center justify-between px-4 py-4 text-lg font-medium no-underline hover:opacity-70"
              style={{ borderBottom: '1px solid var(--header-border)' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Discover</span>
              <svg className="w-5 h-5" style={{ opacity: 0.5 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/trending"
              className="flex items-center justify-between px-4 py-4 text-lg font-medium no-underline hover:opacity-70"
              style={{ borderBottom: '1px solid var(--header-border)' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Trending</span>
              <svg className="w-5 h-5" style={{ opacity: 0.5 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/lists"
              className="flex items-center justify-between px-4 py-4 text-lg font-medium no-underline hover:opacity-70"
              style={{ borderBottom: '1px solid var(--header-border)' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Lists</span>
              <svg className="w-5 h-5" style={{ opacity: 0.5 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/hot-takes"
              className="flex items-center justify-between px-4 py-4 text-lg font-medium no-underline hover:opacity-70"
              style={{ borderBottom: '1px solid var(--header-border)' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Hot Takes</span>
              <svg className="w-5 h-5" style={{ opacity: 0.5 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {/* Theme toggle in mobile menu */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-between w-full px-4 py-4 text-lg font-medium hover:opacity-70"
              style={{ borderBottom: '1px solid var(--header-border)' }}
            >
              <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
              {theme === "light" ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            {/* User Section */}
            {status !== "loading" && (
              session ? (
                <div className="mt-4" style={{ borderTop: '1px solid var(--header-border)' }}>
                  {/* User info header */}
                  <div className="px-4 py-4 flex items-center gap-3" style={{ opacity: 0.9 }}>
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt=""
                        className="w-12 h-12 object-cover"
                        style={{ border: '1px solid var(--header-border)' }}
                      />
                    ) : (
                      <DefaultAvatar size="md" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-bold truncate">{session.user?.username || session.user?.name}</p>
                      <p className="text-sm truncate" style={{ opacity: 0.6 }}>{session.user?.email}</p>
                    </div>
                  </div>

                  <Link
                    href={`/u/${session.user?.username || session.user?.id}`}
                    className="flex items-center justify-between px-4 py-4 text-base no-underline hover:opacity-70"
                    style={{ borderBottom: '1px solid var(--header-border)' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Your Profile</span>
                    <svg className="w-5 h-5" style={{ opacity: 0.5 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    href="/notifications"
                    className="flex items-center justify-between px-4 py-4 text-base no-underline hover:opacity-70"
                    style={{ borderBottom: '1px solid var(--header-border)' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Notifications</span>
                    <svg className="w-5 h-5" style={{ opacity: 0.5 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center justify-between px-4 py-4 text-base no-underline hover:opacity-70"
                    style={{ borderBottom: '1px solid var(--header-border)' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Settings</span>
                    <svg className="w-5 h-5" style={{ opacity: 0.5 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => {
                      signOut()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full text-left px-4 py-4 text-base hover:opacity-70 text-red-600 font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="p-4 mt-4 space-y-3" style={{ borderTop: '1px solid var(--header-border)' }}>
                  <Link
                    href="/login"
                    className="block w-full px-4 py-4 text-base font-bold text-center no-underline transition-colors"
                    style={{ backgroundColor: 'var(--header-text)', color: 'var(--header-bg)' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="block w-full px-4 py-4 text-base font-bold text-center no-underline transition-colors"
                    style={{ border: '2px solid var(--header-text)' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Create Account
                  </Link>
                </div>
              )
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
