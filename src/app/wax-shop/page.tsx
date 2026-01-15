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
  },
  {
    id: "badge-2",
    name: "Platinum Reviewer Badge",
    description: "The ultimate badge for the most dedicated reviewers",
    cost: 1000,
    category: "badge",
  },
  {
    id: "theme-1",
    name: "Dark Purple Theme",
    description: "Customize your profile with a sleek purple theme",
    cost: 300,
    category: "theme",
  },
  {
    id: "theme-2",
    name: "Sunset Orange Theme",
    description: "Warm and vibrant orange theme for your profile",
    cost: 300,
    category: "theme",
  },
  {
    id: "feature-1",
    name: "Custom Username Color",
    description: "Make your username stand out with a custom color",
    cost: 750,
    category: "feature",
  },
  {
    id: "feature-2",
    name: "Animated Avatar Border",
    description: "Add a cool animated border to your profile picture",
    cost: 1500,
    category: "feature",
  },
  {
    id: "perk-1",
    name: "Early Access Pass",
    description: "Get early access to new features for 30 days",
    cost: 2000,
    category: "perk",
  },
  {
    id: "perk-2",
    name: "Spotlight Boost",
    description: "Your next review gets featured on the homepage for 24 hours",
    cost: 2500,
    category: "perk",
  },
]

const WAX_EARNING_METHODS = [
  { action: "Write a review", wax: 10 },
  { action: "Maintain a streak (per day)", wax: 5 },
  { action: "Get a like on your review", wax: 2 },
  { action: "Get a Wax award", wax: 25 },
  { action: "Refer a friend", wax: 100 },
  { action: "Complete your profile", wax: 50 },
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
      <div className="border-b border-gray-200 pb-8 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-black mb-4">Wax Shop</h1>
            <p className="text-gray-600 max-w-xl">
              Spend your hard-earned Wax on exclusive badges, themes, and perks. 
              Keep reviewing to earn more!
            </p>
          </div>
          
          {/* Wax Balance Card */}
          <div className="bg-gray-50 border border-gray-200 p-6 min-w-[200px]">
            <p className="text-sm text-gray-500 mb-1">Your Balance</p>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold text-black">{waxData.waxScore}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Wax Points</p>
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
                <h2 className="text-xl font-bold mb-4 capitalize">
                  {category}s
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {items.map((item) => {
                    const canAfford = waxData.waxScore >= item.cost

                    return (
                      <div
                        key={item.id}
                        className={`bg-gray-50 border  p-4 transition-colors ${
                          canAfford ? "border-gray-200 hover:border-amber-500/50" : "border-gray-200 opacity-60"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <h3 className="font-bold">{item.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-black">{item.cost} Wax</span>
                          </div>
                          <button
                            disabled={!canAfford}
                            className={`px-4 py-2 font-bold text-sm transition-colors ${
                              canAfford
                                ? "bg-black text-black hover:bg-gray-800"
                                : "bg-gray-300 text-gray-400 cursor-not-allowed"
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
          <div className="bg-gray-50 border border-gray-200  p-4">
            <h3 className="font-bold mb-4">Your Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Reviews</span>
                <span className="font-bold">{waxData.totalReviews}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Current Streak</span>
                <span className="font-bold">{waxData.currentStreak} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Wax Given</span>
                <span className="font-bold">{waxData.waxGiven}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Wax Received</span>
                <span className="font-bold">{waxData.waxReceived}</span>
              </div>
            </div>
          </div>

          {/* How to Earn */}
          <div className="bg-gray-50 border border-gray-200  p-4">
            <h3 className="font-bold mb-4">How to Earn Wax</h3>
            <div className="space-y-3">
              {WAX_EARNING_METHODS.map((method) => (
                <div key={method.action} className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm">{method.action}</p>
                  </div>
                  <span className="text-black font-bold">+{method.wax}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Premium Wax */}
          <div className="bg-gradient-to-br from-violet-100 to-purple-100 border border-gray-200  p-4">
            <h3 className="font-bold mb-2">Premium Wax</h3>
            <p className="text-sm text-gray-500 mb-3">
              Get Premium Wax to unlock exclusive items and support WaxFeed!
            </p>
            <p className="text-2xl font-bold text-black mb-3">
              {waxData.premiumWaxScore} Premium Wax
            </p>
            <Link
              href="/settings#premium"
              className="block w-full text-center bg-black text-white py-2 font-bold hover:bg-gray-800 transition-colors no-underline"
            >
              Get Premium
            </Link>
          </div>

          {/* Quick Links */}
          <div className="bg-gray-50 border border-gray-200  p-4">
            <h3 className="font-bold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/year-in-music" className="flex items-center gap-2 p-2 hover:bg-gray-100 transition-colors no-underline text-sm">
                Year in Music
              </Link>
              <Link href="/discover" className="flex items-center gap-2 p-2 hover:bg-gray-100 transition-colors no-underline text-sm">
                Discover Albums
              </Link>
              <Link href={`/u/${session.user.username}`} className="flex items-center gap-2 p-2 hover:bg-gray-100 transition-colors no-underline text-sm">
                Your Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
