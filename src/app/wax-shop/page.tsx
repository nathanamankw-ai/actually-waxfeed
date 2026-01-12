import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export const dynamic = "force-dynamic"

const WAX_REWARDS = [
  {
    id: "badge-1",
    name: "Gold Reviewer Badge",
    description: "Show off your dedication with a gold badge on your profile",
    cost: 500,
    category: "badge",
    icon: "🏅",
  },
  {
    id: "badge-2",
    name: "Platinum Reviewer Badge",
    description: "The ultimate badge for the most dedicated reviewers",
    cost: 1000,
    category: "badge",
    icon: "💎",
  },
  {
    id: "theme-1",
    name: "Dark Purple Theme",
    description: "Customize your profile with a sleek purple theme",
    cost: 300,
    category: "theme",
    icon: "🎨",
  },
  {
    id: "theme-2",
    name: "Sunset Orange Theme",
    description: "Warm and vibrant orange theme for your profile",
    cost: 300,
    category: "theme",
    icon: "🌅",
  },
  {
    id: "feature-1",
    name: "Custom Username Color",
    description: "Make your username stand out with a custom color",
    cost: 750,
    category: "feature",
    icon: "✨",
  },
  {
    id: "feature-2",
    name: "Animated Avatar Border",
    description: "Add a cool animated border to your profile picture",
    cost: 1500,
    category: "feature",
    icon: "💫",
  },
  {
    id: "perk-1",
    name: "Early Access Pass",
    description: "Get early access to new features for 30 days",
    cost: 2000,
    category: "perk",
    icon: "🚀",
  },
  {
    id: "perk-2",
    name: "Spotlight Boost",
    description: "Your next review gets featured on the homepage for 24 hours",
    cost: 2500,
    category: "perk",
    icon: "📣",
  },
]

const WAX_EARNING_METHODS = [
  { action: "Write a review", wax: 10, icon: "📝" },
  { action: "Maintain a streak (per day)", wax: 5, icon: "🔥" },
  { action: "Get a like on your review", wax: 2, icon: "❤️" },
  { action: "Get a Wax award", wax: 25, icon: "🏆" },
  { action: "Refer a friend", wax: 100, icon: "👥" },
  { action: "Complete your profile", wax: 50, icon: "✅" },
]

async function getUserWaxData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      waxScore: true,
      premiumWaxScore: true,
      currentStreak: true,
      _count: {
        select: {
          reviews: true,
          waxGiven: true,
        },
      },
    },
  })

  // Get total wax earned from receiving awards
  const waxReceived = await prisma.waxAward.count({
    where: {
      review: {
        userId,
      },
    },
  })

  return {
    waxScore: user?.waxScore || 0,
    premiumWaxScore: user?.premiumWaxScore || 0,
    currentStreak: user?.currentStreak || 0,
    totalReviews: user?._count.reviews || 0,
    waxGiven: user?._count.waxGiven || 0,
    waxReceived,
  }
}

export default async function WaxShopPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/wax-shop")
  }

  const waxData = await getUserWaxData(session.user.id)
  const categories = ["badge", "theme", "feature", "perk"]

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 lg:py-8">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-amber-900/50 via-yellow-900/40 to-orange-900/30 rounded-2xl p-8 mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">💰</span>
              <h1 className="text-3xl lg:text-4xl font-bold">Wax Shop</h1>
            </div>
            <p className="text-lg text-[#ccc] max-w-xl">
              Spend your hard-earned Wax on exclusive badges, themes, and perks. 
              Keep reviewing to earn more!
            </p>
          </div>
          
          {/* Wax Balance Card */}
          <div className="bg-black/30 backdrop-blur rounded-xl p-6 min-w-[200px]">
            <p className="text-sm text-amber-200/80 mb-1">Your Balance</p>
            <div className="flex items-center gap-2">
              <span className="text-4xl">🪙</span>
              <span className="text-4xl font-bold text-amber-400">{waxData.waxScore}</span>
            </div>
            <p className="text-xs text-[#888] mt-2">Wax Points</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Shop */}
        <div className="lg:col-span-2 space-y-8">
          {categories.map((category) => {
            const items = WAX_REWARDS.filter((r) => r.category === category)
            if (items.length === 0) return null

            return (
              <section key={category}>
                <h2 className="text-xl font-bold mb-4 capitalize flex items-center gap-2">
                  {category === "badge" && "🏅"}
                  {category === "theme" && "🎨"}
                  {category === "feature" && "✨"}
                  {category === "perk" && "🎁"}
                  {category}s
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {items.map((item) => {
                    const canAfford = waxData.waxScore >= item.cost

                    return (
                      <div
                        key={item.id}
                        className={`bg-[#111] border rounded-lg p-4 transition-colors ${
                          canAfford ? "border-[#222] hover:border-amber-500/50" : "border-[#222] opacity-60"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <span className="text-4xl">{item.icon}</span>
                          <div className="flex-1">
                            <h3 className="font-bold">{item.name}</h3>
                            <p className="text-sm text-[#888] mt-1">{item.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#222]">
                          <div className="flex items-center gap-1">
                            <span>🪙</span>
                            <span className="font-bold text-amber-400">{item.cost}</span>
                          </div>
                          <button
                            disabled={!canAfford}
                            className={`px-4 py-2 font-bold text-sm rounded transition-colors ${
                              canAfford
                                ? "bg-amber-500 text-black hover:bg-amber-400"
                                : "bg-[#333] text-[#666] cursor-not-allowed"
                            }`}
                          >
                            {canAfford ? "Redeem" : "Not enough Wax"}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Your Stats */}
          <div className="bg-[#111] border border-[#222] rounded-lg p-4">
            <h3 className="font-bold mb-4">📊 Your Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#888]">Total Reviews</span>
                <span className="font-bold">{waxData.totalReviews}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888]">Current Streak</span>
                <span className="font-bold">{waxData.currentStreak} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888]">Wax Given</span>
                <span className="font-bold">{waxData.waxGiven}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888]">Wax Received</span>
                <span className="font-bold">{waxData.waxReceived}</span>
              </div>
            </div>
          </div>

          {/* How to Earn */}
          <div className="bg-[#111] border border-[#222] rounded-lg p-4">
            <h3 className="font-bold mb-4">🌟 How to Earn Wax</h3>
            <div className="space-y-3">
              {WAX_EARNING_METHODS.map((method) => (
                <div key={method.action} className="flex items-center gap-3">
                  <span className="text-xl">{method.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm">{method.action}</p>
                  </div>
                  <span className="text-amber-400 font-bold">+{method.wax}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Premium Wax */}
          <div className="bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 rounded-lg p-4">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              💎 Premium Wax
            </h3>
            <p className="text-sm text-[#888] mb-3">
              Get Premium Wax to unlock exclusive items and support WaxFeed!
            </p>
            <p className="text-2xl font-bold text-violet-400 mb-3">
              {waxData.premiumWaxScore} Premium Wax
            </p>
            <Link
              href="/settings#premium"
              className="block w-full text-center bg-violet-500 text-white py-2 font-bold rounded hover:bg-violet-400 transition-colors no-underline"
            >
              Get Premium
            </Link>
          </div>

          {/* Quick Links */}
          <div className="bg-[#111] border border-[#222] rounded-lg p-4">
            <h3 className="font-bold mb-4">🔗 Quick Links</h3>
            <div className="space-y-2">
              <Link href="/year-in-music" className="flex items-center gap-2 p-2 hover:bg-[#181818] rounded transition-colors no-underline text-sm">
                <span>📊</span> Year in Music
              </Link>
              <Link href="/discover" className="flex items-center gap-2 p-2 hover:bg-[#181818] rounded transition-colors no-underline text-sm">
                <span>🔍</span> Discover Albums
              </Link>
              <Link href={`/u/${session.user.username}`} className="flex items-center gap-2 p-2 hover:bg-[#181818] rounded transition-colors no-underline text-sm">
                <span>👤</span> Your Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
