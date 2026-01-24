"use client"

import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"

type ShopItem = {
  id: string
  type: string
  name: string
  description: string | null
  waxPrice: number
  imageUrl: string | null
  isLimited: boolean
  stock: number | null
  soldCount: number
  expiresAt: string | null
  minTier: string
  owned: boolean
  available: boolean
  remaining: number | null
  metadata: Record<string, unknown> | null
}

const WAX_PAX = [
  { id: "starter", name: "Starter", wax: 100, price: "0.99", bonus: null },
  { id: "popular", name: "Popular", wax: 550, price: "4.99", bonus: 10, featured: true },
  { id: "value", name: "Value", wax: 1200, price: "9.99", bonus: 20 },
  { id: "super", name: "Super", wax: 2700, price: "19.99", bonus: 35 },
  { id: "mega", name: "Mega", wax: 6000, price: "39.99", bonus: 50 },
]

export default function ShopPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [items, setItems] = useState<ShopItem[]>([])
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [activeTab, setActiveTab] = useState<"wax" | "items">("wax")

  const canceled = searchParams.get("canceled")

  useEffect(() => {
    if (canceled) {
      setMessage("Purchase canceled.")
    }
  }, [canceled])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, balanceRes] = await Promise.all([
          fetch("/api/shop/items?limit=50"),
          session ? fetch("/api/wax/balance") : Promise.resolve(null),
        ])

        const itemsData = await itemsRes.json()
        if (itemsData.success) {
          setItems(itemsData.data.items)
        }

        if (balanceRes) {
          const balanceData = await balanceRes.json()
          if (balanceData.success) {
            setBalance(balanceData.data.balance)
          }
        }
      } catch (error) {
        console.error("Failed to fetch shop data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [session])

  const handleBuyWaxPax = async (paxId: string) => {
    if (!session) {
      router.push("/login?redirect=/shop")
      return
    }

    setPurchasing(paxId)
    setMessage("")

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "wax_pax",
          productId: paxId,
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
      setPurchasing(null)
    }
  }

  const handleBuyItem = async (itemId: string) => {
    if (!session) {
      router.push("/login?redirect=/shop")
      return
    }

    setPurchasing(itemId)
    setMessage("")

    try {
      const res = await fetch("/api/shop/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      })

      const data = await res.json()

      if (data.success) {
        setMessage(data.data.message || "Purchase successful")
        setBalance(data.data.newBalance)
        setItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, owned: true } : item
        ))
      } else {
        setMessage(data.error || "Failed to purchase")
      }
    } catch (error) {
      setMessage("Something went wrong")
    } finally {
      setPurchasing(null)
    }
  }

  const badges = items.filter(i => i.type === "BADGE")
  const frames = items.filter(i => i.type === "FRAME")
  const allItems = [...badges, ...frames]

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Header */}
      <section style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[--muted] mb-3">
                Shop
              </p>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-[-0.02em]">
                Wax Shop
              </h1>
            </div>
            {session && (
              <div className="flex items-baseline gap-3">
                <span className="text-[10px] tracking-[0.2em] uppercase text-[--muted]">Balance</span>
                <span className="text-3xl font-bold tabular-nums">{balance.toLocaleString()}</span>
                <span className="text-[--muted]">Wax</span>
              </div>
            )}
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

      {/* Tabs */}
      <section className="border-b border-[--border]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("wax")}
              className={`py-4 text-[11px] tracking-[0.15em] uppercase transition border-b-2 -mb-px ${
                activeTab === "wax"
                  ? "border-white text-white"
                  : "border-transparent text-[--muted] hover:text-white"
              }`}
            >
              Wax Pax
            </button>
            <button
              onClick={() => setActiveTab("items")}
              className={`py-4 text-[11px] tracking-[0.15em] uppercase transition border-b-2 -mb-px ${
                activeTab === "items"
                  ? "border-white text-white"
                  : "border-transparent text-[--muted] hover:text-white"
              }`}
            >
              Items {allItems.length > 0 && `(${allItems.length})`}
            </button>
          </div>
        </div>
      </section>

      {/* Wax Pax Tab */}
      {activeTab === "wax" && (
        <section className="max-w-7xl mx-auto">
          <div className="px-6 py-10">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[--muted] mb-6">
              Purchase Wax Instantly
            </p>
          </div>
          
          <div className="grid lg:grid-cols-5 border-t border-[--border]">
            {WAX_PAX.map((pax, index) => (
              <div
                key={pax.id}
                className={`px-6 py-8 border-b lg:border-b-0 border-[--border] ${
                  index < WAX_PAX.length - 1 ? 'lg:border-r' : ''
                } relative`}
              >
                {pax.featured && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-white" />
                )}
                
                <p className="text-[10px] tracking-[0.3em] uppercase text-[--muted] mb-4">
                  {String(index + 1).padStart(2, '0')} — {pax.name}
                </p>
                
                <div className="mb-6">
                  <p className="text-4xl font-bold tabular-nums mb-1">
                    {pax.wax.toLocaleString()}
                  </p>
                  <p className="text-sm text-[--muted]">Wax</p>
                  {pax.bonus && (
                    <p className="text-xs text-green-500 mt-2">
                      +{pax.bonus}% bonus
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleBuyWaxPax(pax.id)}
                  disabled={purchasing === pax.id}
                  className={`w-full py-3 px-4 text-[11px] tracking-[0.15em] uppercase font-medium transition disabled:opacity-50 ${
                    pax.featured
                      ? "bg-white text-black hover:bg-[#e5e5e5]"
                      : "border border-[--border] hover:border-white"
                  }`}
                >
                  {purchasing === pax.id ? "..." : `$${pax.price}`}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Items Tab */}
      {activeTab === "items" && (
        <section className="max-w-7xl mx-auto px-6 py-10">
          {loading ? (
            <p className="text-[--muted]">Loading items...</p>
          ) : allItems.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-[--muted] mb-2">No items available yet.</p>
              <p className="text-sm text-[--muted]">Check back soon for badges and frames.</p>
            </div>
          ) : (
            <>
              {/* Badges */}
              {badges.length > 0 && (
                <div className="mb-12">
                  <p className="text-[10px] tracking-[0.3em] uppercase text-[--muted] mb-6">
                    Badges
                  </p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[--border]">
                    {badges.map((item) => (
                      <div
                        key={item.id}
                        className="p-6 bg-[--background]"
                      >
                        {item.isLimited && item.remaining !== null && (
                          <p className="text-[10px] tracking-[0.15em] uppercase text-[#ff3b3b] mb-4">
                            Limited — {item.remaining} left
                          </p>
                        )}

                        <div className="mb-4">
                          {item.imageUrl ? (
                            <img 
                              src={item.imageUrl} 
                              alt={item.name} 
                              className="w-12 h-12 object-contain"
                            />
                          ) : (
                            <div className="w-12 h-12 border border-[--border] flex items-center justify-center">
                              <span className="text-xs font-bold">B</span>
                            </div>
                          )}
                        </div>

                        <p className="font-medium mb-1">{item.name}</p>
                        {item.description && (
                          <p className="text-sm text-[--muted] mb-4">{item.description}</p>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-sm tabular-nums">
                            {item.waxPrice.toLocaleString()} Wax
                          </span>
                          
                          {item.owned ? (
                            <span className="text-[10px] tracking-[0.15em] uppercase text-[--muted]">
                              Owned
                            </span>
                          ) : !item.available ? (
                            <span className="text-[10px] tracking-[0.15em] uppercase text-[--muted]">
                              Sold Out
                            </span>
                          ) : (
                            <button
                              onClick={() => handleBuyItem(item.id)}
                              disabled={purchasing === item.id || balance < item.waxPrice}
                              className="text-[10px] tracking-[0.15em] uppercase hover:underline disabled:opacity-50 disabled:no-underline"
                            >
                              {purchasing === item.id ? "..." : balance < item.waxPrice ? "Not enough" : "Buy"}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Frames */}
              {frames.length > 0 && (
                <div>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-[--muted] mb-6">
                    Profile Frames
                  </p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[--border]">
                    {frames.map((item) => (
                      <div
                        key={item.id}
                        className="p-6 bg-[--background]"
                      >
                        {item.isLimited && item.remaining !== null && (
                          <p className="text-[10px] tracking-[0.15em] uppercase text-[#ff3b3b] mb-4">
                            Limited — {item.remaining} left
                          </p>
                        )}

                        <div className="mb-4">
                          {item.imageUrl ? (
                            <img 
                              src={item.imageUrl} 
                              alt={item.name} 
                              className="w-16 h-16 object-contain"
                            />
                          ) : (
                            <div className="w-16 h-16 border-2 border-[--border]" />
                          )}
                        </div>

                        <p className="font-medium mb-1">{item.name}</p>
                        {item.description && (
                          <p className="text-sm text-[--muted] mb-4">{item.description}</p>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-sm tabular-nums">
                            {item.waxPrice.toLocaleString()} Wax
                          </span>
                          
                          {item.owned ? (
                            <span className="text-[10px] tracking-[0.15em] uppercase text-[--muted]">
                              Owned
                            </span>
                          ) : !item.available ? (
                            <span className="text-[10px] tracking-[0.15em] uppercase text-[--muted]">
                              Sold Out
                            </span>
                          ) : (
                            <button
                              onClick={() => handleBuyItem(item.id)}
                              disabled={purchasing === item.id || balance < item.waxPrice}
                              className="text-[10px] tracking-[0.15em] uppercase hover:underline disabled:opacity-50 disabled:no-underline"
                            >
                              {purchasing === item.id ? "..." : balance < item.waxPrice ? "Not enough" : "Buy"}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* Footer CTA */}
      <section className="border-t border-[--border]">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-sm text-[--muted]">
                Want to earn Wax faster? Upgrade for multipliers and monthly grants.
              </p>
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-5 py-3 bg-white text-black text-[11px] uppercase tracking-[0.15em] font-medium hover:bg-[#e5e5e5] transition"
            >
              View Plans
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
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
            Wallet
          </Link>
          <Link
            href="/pricing"
            className="text-[11px] tracking-[0.15em] uppercase text-[--muted] hover:text-white transition-colors flex items-center gap-2"
          >
            Pricing
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </footer>
    </div>
  )
}
