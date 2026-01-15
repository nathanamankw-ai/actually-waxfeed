"use client"

import { useState } from "react"
import Link from "next/link"

interface Feature {
  title: string
  description: string
  icon: string
  path: string
  howToUse: string[]
}

const mainFeatures: Feature[] = [
  {
    title: "Home",
    description: "Your personalized feed showing Billboard chart albums, recent reviews from the community, and friends' activity.",
    icon: "◉",
    path: "/",
    howToUse: [
      "View the #1 Billboard album featured prominently",
      "Browse top albums sorted by chart position",
      "See the latest reviews from the community",
      "Check what your friends have been listening to",
    ],
  },
  {
    title: "Discover",
    description: "Explore new music through curated collections, genre filters, and personalized recommendations.",
    icon: "◎",
    path: "/discover",
    howToUse: [
      "Browse albums by genre or release date",
      "Find hidden gems through user ratings",
      "Search for specific albums or artists",
      "Discover trending albums you might have missed",
    ],
  },
  {
    title: "Trending",
    description: "See what's hot right now - the most reviewed and highest-rated albums of the moment.",
    icon: "↗",
    path: "/trending",
    howToUse: [
      "View Billboard 200 chart rankings",
      "See average ratings from the community",
      "Click any album to read reviews or add yours",
      "Track chart movement over time",
    ],
  },
  {
    title: "Lists",
    description: "Create, share, and remix ranked lists of your favorite albums. Perfect for 'Top 10' or 'Best of Year' lists.",
    icon: "≡",
    path: "/lists",
    howToUse: [
      "Create your own ranked or unranked lists",
      "Add album notes to explain your choices",
      "Remix other users' lists with your own take",
      "Share lists with friends or make them public",
    ],
  },
  {
    title: "Community",
    description: "Join topic-based channels to discuss music with like-minded fans. Think Slack, but for music.",
    icon: "#",
    path: "/community",
    howToUse: [
      "Browse channels by genre, artist, or topic",
      "Join channels that interest you",
      "Post messages, share album cards, react to posts",
      "Create your own channel for a specific topic",
    ],
  },
  {
    title: "Live",
    description: "Real-time listening parties, DJ sets, and live discussions. Experience music together.",
    icon: "●",
    path: "/live",
    howToUse: [
      "Join live events with real-time chat",
      "See what's currently playing in the setlist",
      "React to songs and chat with other listeners",
      "Schedule or host your own listening party",
    ],
  },
]

const specialFeatures: Feature[] = [
  {
    title: "HomeBRU",
    description: "WBRU's flagship music show. Stream episodes, see playlists, and engage with the broadcast.",
    icon: "HB",
    path: "/homebru",
    howToUse: [
      "Watch or listen to HomeBRU episodes",
      "Browse past episode playlists",
      "Rate songs that were featured",
      "Join the live chat during broadcasts",
    ],
  },
  {
    title: "AVDP",
    description: "Album Vinyl Discussion Podcast - Deep dives into classic and new albums.",
    icon: "AV",
    path: "/avdp",
    howToUse: [
      "Listen to podcast episodes",
      "See which albums are being discussed",
      "Read along with episode notes",
      "Leave comments and reactions",
    ],
  },
  {
    title: "DJFeed",
    description: "For campus DJs - manage your profile, upload mixes, and get discovered.",
    icon: "DJ",
    path: "/dj-feed",
    howToUse: [
      "Create your DJ profile",
      "Upload mixes and setlists",
      "Get discovered by event organizers",
      "Track your plays and engagement",
    ],
  },
  {
    title: "Year in Music",
    description: "Your personalized year-end recap - top artists, genres, listening stats, and more.",
    icon: "YM",
    path: "/year-in-music",
    howToUse: [
      "View your listening statistics",
      "See your most reviewed artists and genres",
      "Share your year recap with friends",
      "Compare stats with the community",
    ],
  },
  {
    title: "Wax Shop",
    description: "Earn and spend Wax tokens - the WaxFeed reward system for active contributors.",
    icon: "WX",
    path: "/wax-shop",
    howToUse: [
      "Earn Wax by writing quality reviews",
      "Redeem Wax for premium features",
      "Gift Wax to reviewers you appreciate",
      "Check your Wax balance and history",
    ],
  },
]

const userFeatures = [
  {
    title: "Write Reviews",
    description: "Rate albums from 0-10 and write your thoughts. Your reviews contribute to the community score.",
    howToUse: [
      "Navigate to any album page",
      "Click 'Write a Review' or use the rating slider",
      "Give a score and optionally write your thoughts",
      "Your review appears on your profile and the album page",
    ],
  },
  {
    title: "Build Your Profile",
    description: "Your music identity on WaxFeed - showcase your reviews, lists, and taste.",
    howToUse: [
      "Go to Settings to customize your profile",
      "Add a bio and profile picture",
      "Link your social accounts",
      "Your reviews and lists appear on your profile",
    ],
  },
  {
    title: "Connect with Friends",
    description: "Add friends to see their activity and reviews in your feed.",
    howToUse: [
      "Search for users or find them on reviews",
      "Send a friend request",
      "Once accepted, see their activity on your home feed",
      "Direct message friends through the messaging system",
    ],
  },
  {
    title: "Direct Messages",
    description: "Private conversations with friends about music, lists, or anything.",
    howToUse: [
      "Click the Messages icon in the header",
      "Start a new conversation or continue existing ones",
      "Share albums directly in chat",
      "Create group chats for your music crew",
    ],
  },
]

export default function DemoPage() {
  const [activeSection, setActiveSection] = useState<string>("main")

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="border-b-2 border-black">
        <div className="max-w-5xl mx-auto px-4 py-12 lg:py-20">
          <Link href="/" className="text-sm text-gray-500 hover:text-black no-underline mb-6 inline-block">
            ← Back to WaxFeed
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] tracking-[0.3em] text-gray-500 border border-gray-300 px-2 py-1">DEMO</span>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-4">
            "HOW TO USE WAXFEED"
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            A complete guide to all the features, pages, and functionalities of WaxFeed — 
            the social music review platform.
          </p>
        </div>
      </div>

      {/* Quick Nav */}
      <div className="border-b border-gray-200 sticky top-16 bg-white z-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-8 overflow-x-auto py-4">
            <button
              onClick={() => setActiveSection("main")}
              className={`text-sm whitespace-nowrap pb-2 border-b-2 transition-colors ${
                activeSection === "main" ? "border-black font-bold" : "border-transparent text-gray-500 hover:text-black"
              }`}
            >
              Main Pages
            </button>
            <button
              onClick={() => setActiveSection("special")}
              className={`text-sm whitespace-nowrap pb-2 border-b-2 transition-colors ${
                activeSection === "special" ? "border-black font-bold" : "border-transparent text-gray-500 hover:text-black"
              }`}
            >
              Brand Features
            </button>
            <button
              onClick={() => setActiveSection("user")}
              className={`text-sm whitespace-nowrap pb-2 border-b-2 transition-colors ${
                activeSection === "user" ? "border-black font-bold" : "border-transparent text-gray-500 hover:text-black"
              }`}
            >
              User Features
            </button>
            <button
              onClick={() => setActiveSection("quickstart")}
              className={`text-sm whitespace-nowrap pb-2 border-b-2 transition-colors ${
                activeSection === "quickstart" ? "border-black font-bold" : "border-transparent text-gray-500 hover:text-black"
              }`}
            >
              Quick Start
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        
        {/* Main Pages */}
        {activeSection === "main" && (
          <div>
            <h2 className="text-2xl font-bold mb-2">"MAIN NAVIGATION"</h2>
            <p className="text-gray-500 text-sm mb-8">The core pages you'll use every day</p>
            
            <div className="grid gap-6">
              {mainFeatures.map((feature) => (
                <FeatureCard key={feature.path} feature={feature} />
              ))}
            </div>
          </div>
        )}

        {/* Special Features */}
        {activeSection === "special" && (
          <div>
            <h2 className="text-2xl font-bold mb-2">"BRAND FEATURES"</h2>
            <p className="text-gray-500 text-sm mb-8">WBRU-exclusive shows and special experiences</p>
            
            <div className="grid gap-6">
              {specialFeatures.map((feature) => (
                <FeatureCard key={feature.path} feature={feature} />
              ))}
            </div>
          </div>
        )}

        {/* User Features */}
        {activeSection === "user" && (
          <div>
            <h2 className="text-2xl font-bold mb-2">"USER FEATURES"</h2>
            <p className="text-gray-500 text-sm mb-8">Everything you can do on WaxFeed</p>
            
            <div className="grid gap-6">
              {userFeatures.map((feature, i) => (
                <div key={i} className="border border-gray-200 p-6 hover:border-black transition-colors">
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <div>
                    <p className="text-[10px] tracking-[0.2em] text-gray-500 mb-2">HOW TO USE:</p>
                    <ul className="space-y-2">
                      {feature.howToUse.map((step, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm">
                          <span className="text-gray-400 flex-shrink-0">{j + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Start */}
        {activeSection === "quickstart" && (
          <div>
            <h2 className="text-2xl font-bold mb-2">"QUICK START GUIDE"</h2>
            <p className="text-gray-500 text-sm mb-8">Get up and running in 5 minutes</p>
            
            <div className="space-y-8">
              <div className="border-2 border-black p-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold">1</span>
                  <h3 className="text-xl font-bold">Create Your Account</h3>
                </div>
                <p className="text-gray-600 mb-4">Sign up with email or Google. Choose a username that represents you.</p>
                <Link href="/signup" className="inline-block bg-black text-white px-4 py-2 text-sm no-underline hover:bg-gray-800">
                  Sign Up →
                </Link>
              </div>

              <div className="border-2 border-black p-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold">2</span>
                  <h3 className="text-xl font-bold">Find Albums to Review</h3>
                </div>
                <p className="text-gray-600 mb-4">Browse trending albums, search for favorites, or discover something new.</p>
                <div className="flex gap-2">
                  <Link href="/trending" className="inline-block border border-black px-4 py-2 text-sm no-underline hover:bg-gray-100">
                    Trending →
                  </Link>
                  <Link href="/discover" className="inline-block border border-black px-4 py-2 text-sm no-underline hover:bg-gray-100">
                    Discover →
                  </Link>
                </div>
              </div>

              <div className="border-2 border-black p-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold">3</span>
                  <h3 className="text-xl font-bold">Write Your First Review</h3>
                </div>
                <p className="text-gray-600 mb-4">Click on any album, slide to rate (0-10), and share your thoughts. It's that simple.</p>
                <div className="bg-gray-100 p-4 text-sm">
                  <p className="text-gray-500 mb-2">Pro tip:</p>
                  <p>Great reviews are specific. Mention standout tracks, production quality, or emotional impact.</p>
                </div>
              </div>

              <div className="border-2 border-black p-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold">4</span>
                  <h3 className="text-xl font-bold">Connect with the Community</h3>
                </div>
                <p className="text-gray-600 mb-4">Add friends, join channels, and engage with other music lovers.</p>
                <div className="flex gap-2">
                  <Link href="/community" className="inline-block border border-black px-4 py-2 text-sm no-underline hover:bg-gray-100">
                    Community →
                  </Link>
                </div>
              </div>

              <div className="border-2 border-black p-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold">5</span>
                  <h3 className="text-xl font-bold">Create Your First List</h3>
                </div>
                <p className="text-gray-600 mb-4">Curate your top albums into a shareable list. Great for "Best of 2025" or genre favorites.</p>
                <Link href="/lists" className="inline-block border border-black px-4 py-2 text-sm no-underline hover:bg-gray-100">
                  Create List →
                </Link>
              </div>
            </div>

            {/* Final CTA */}
            <div className="mt-12 text-center border-t-2 border-black pt-12">
              <h3 className="text-2xl font-bold mb-4">"READY TO START?"</h3>
              <p className="text-gray-600 mb-6">Join the community of music lovers.</p>
              <Link href="/signup" className="inline-block bg-black text-white px-8 py-4 text-sm tracking-wide no-underline hover:bg-gray-800">
                CREATE ACCOUNT →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-black py-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-[10px] tracking-[0.2em] text-gray-400">
            WAXFEED™ — "FOR THOSE WHO KNOW"
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ feature }: { feature: Feature }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="border border-gray-200 hover:border-black transition-colors">
      <div 
        className="p-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <span className="text-xs font-bold w-10 h-10 bg-black text-white flex items-center justify-center flex-shrink-0 tracking-tight">
              {feature.icon}
            </span>
            <div>
              <h3 className="text-xl font-bold mb-1">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          </div>
          <span className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ↓
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-100 pt-4">
          <p className="text-[10px] tracking-[0.2em] text-gray-500 mb-3">HOW TO USE:</p>
          <ul className="space-y-2 mb-4">
            {feature.howToUse.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-gray-400 flex-shrink-0">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
          <Link 
            href={feature.path}
            className="inline-flex items-center gap-2 text-sm font-bold hover:underline no-underline"
          >
            Go to {feature.title} <span>→</span>
          </Link>
        </div>
      )}
    </div>
  )
}
