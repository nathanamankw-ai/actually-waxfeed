import Link from "next/link"

export const dynamic = "force-dynamic"

// Featured DJs - In production from database
const FEATURED_DJS = [
  {
    id: "dj-1",
    name: "DJ Homebase",
    username: "djhomebase",
    image: null,
    bio: "Resident DJ at HomeBRU. Spinning everything from underground hip-hop to neo-soul.",
    genres: ["Hip-Hop", "Neo-Soul", "R&B"],
    followers: 2450,
    mixes: 34,
    isVerified: true,
    isAvailable: true,
    hourlyRate: 150,
  },
  {
    id: "dj-2",
    name: "Melody Maven",
    username: "melodymaven",
    image: null,
    bio: "Producer and DJ specializing in electronic and experimental sounds.",
    genres: ["Electronic", "Experimental", "Ambient"],
    followers: 1820,
    mixes: 28,
    isVerified: true,
    isAvailable: true,
    hourlyRate: 200,
  },
  {
    id: "dj-3",
    name: "Beat Architect",
    username: "beatarchitect",
    image: null,
    bio: "Building sonic experiences one beat at a time. House, techno, and everything in between.",
    genres: ["House", "Techno", "Deep House"],
    followers: 3100,
    mixes: 45,
    isVerified: true,
    isAvailable: false,
    hourlyRate: 250,
  },
  {
    id: "dj-4",
    name: "Vinyl Queen",
    username: "vinylqueen",
    image: null,
    bio: "Old school vinyl collector. Rare grooves and classic cuts only.",
    genres: ["Soul", "Funk", "Disco"],
    followers: 1560,
    mixes: 22,
    isVerified: false,
    isAvailable: true,
    hourlyRate: 175,
  },
]

const RECENT_MIXES = [
  {
    id: "mix-1",
    title: "Friday Night Vibes Vol. 23",
    dj: FEATURED_DJS[0],
    duration: "1h 30m",
    plays: 1240,
    genre: "Hip-Hop",
    date: "2026-01-10",
  },
  {
    id: "mix-2",
    title: "Deep House Journey",
    dj: FEATURED_DJS[2],
    duration: "2h 00m",
    plays: 890,
    genre: "House",
    date: "2026-01-08",
  },
  {
    id: "mix-3",
    title: "Ambient Dreams",
    dj: FEATURED_DJS[1],
    duration: "1h 15m",
    plays: 650,
    genre: "Ambient",
    date: "2026-01-05",
  },
]

export default async function DJFeedPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
      {/* Hero Section */}
      <div className="border-b border-gray-200 pb-8 mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-black mb-2">DJFeed</h1>
        <p className="text-gray-500 mb-4">Discover DJs, book talent, share mixes</p>
        
        <p className="text-gray-600 max-w-2xl mb-6">
          The ultimate platform for DJs and music lovers. Browse mixes, discover new talent, 
          and book DJs for your next event.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/dj-feed/apply"
            className="flex items-center gap-2 bg-black text-white px-6 py-3 font-bold hover:bg-gray-800 transition-colors no-underline"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Apply as DJ
          </Link>
          <Link
            href="/live"
            className="flex items-center gap-2 border border-black text-black px-6 py-3 font-bold hover:bg-gray-100 transition-colors no-underline"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Live Events
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Featured DJs */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Featured DJs</h2>
              <Link href="/dj-feed/all" className="text-sm text-gray-500 hover:text-black no-underline">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FEATURED_DJS.map((dj) => (
                <Link
                  key={dj.id}
                  href={`/dj-feed/${dj.username}`}
                  className="bg-gray-50 border border-gray-200  p-4 hover:border-gray-300 transition-colors no-underline"
                >
                  <div className="flex items-start gap-4">
                    {dj.image ? (
                      <img src={dj.image} alt="" className="w-16 h-16 " />
                    ) : (
                      <div className="w-16 h-16  bg-black flex items-center justify-center text-2xl font-bold text-white">
                        {dj.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold truncate">{dj.name}</h3>
                        {dj.isVerified && (
                          <svg className="w-4 h-4 text-black flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1">{dj.bio}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {dj.genres.slice(0, 3).map((genre) => (
                          <span key={genre} className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded">
                            {genre}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                        <span>{dj.followers.toLocaleString()} followers</span>
                        <span>{dj.mixes} mixes</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <span className={`text-sm ${dj.isAvailable ? "text-black" : "text-gray-400"}`}>
                      {dj.isAvailable ? "Available for booking" : "Currently unavailable"}
                    </span>
                    <span className="text-sm text-gray-500">${dj.hourlyRate}/hr</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Recent Mixes */}
          <section>
            <h2 className="text-xl font-bold mb-4"> Recent Mixes</h2>
            <div className="space-y-3">
              {RECENT_MIXES.map((mix) => (
                <div
                  key={mix.id}
                  className="bg-gray-50 border border-gray-200  p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 border border-gray-200 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate">{mix.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{mix.dj.name}</span>
                        <span>•</span>
                        <span>{mix.genre}</span>
                        <span>•</span>
                        <span>{mix.duration}</span>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-400">
                      <p>{mix.plays.toLocaleString()} plays</p>
                      <p>{mix.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Book a DJ CTA */}
          <section className="bg-gray-50 border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-2">Need a DJ for your event?</h2>
            <p className="text-gray-600 mb-4">
              Browse our roster of talented DJs and book the perfect artist for your next party, 
              wedding, corporate event, or listening session.
            </p>
            <Link
              href="/dj-feed/book"
              className="inline-block bg-black text-white px-6 py-3 font-bold hover:bg-gray-800 transition-colors no-underline"
            >
              Browse & Book DJs
            </Link>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Genre Filter */}
          <div className="bg-gray-50 border border-gray-200  p-4">
            <h3 className="font-bold mb-4">Browse by Genre</h3>
            <div className="flex flex-wrap gap-2">
              {["Hip-Hop", "House", "Techno", "R&B", "Electronic", "Soul", "Funk", "Ambient"].map((genre) => (
                <Link
                  key={genre}
                  href={`/dj-feed?genre=${encodeURIComponent(genre)}`}
                  className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1.5  transition-colors no-underline"
                >
                  {genre}
                </Link>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gray-50 border border-gray-200 p-4">
            <h3 className="font-bold mb-4">Platform Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white border border-gray-200">
                <p className="text-2xl font-bold text-black">150+</p>
                <p className="text-xs text-gray-500">DJs</p>
              </div>
              <div className="text-center p-3 bg-white border border-gray-200">
                <p className="text-2xl font-bold text-black">500+</p>
                <p className="text-xs text-gray-500">Mixes</p>
              </div>
              <div className="text-center p-3 bg-white border border-gray-200">
                <p className="text-2xl font-bold text-black">50K+</p>
                <p className="text-xs text-gray-500">Plays</p>
              </div>
              <div className="text-center p-3 bg-white border border-gray-200">
                <p className="text-2xl font-bold text-black">200+</p>
                <p className="text-xs text-gray-500">Bookings</p>
              </div>
            </div>
          </div>

          {/* Become a DJ */}
          <div className="bg-gray-50 border border-gray-200 p-4">
            <h3 className="font-bold mb-2">Are you a DJ?</h3>
            <p className="text-sm text-gray-500 mb-4">
              Join DJFeed to showcase your mixes, grow your following, and get booked for events.
            </p>
            <Link
              href="/dj-feed/apply"
              className="block w-full text-center bg-black text-white py-2 font-bold hover:bg-gray-800 transition-colors no-underline"
            >
              Apply Now
            </Link>
          </div>

          {/* Quick Links */}
          <div className="bg-gray-50 border border-gray-200  p-4">
            <h3 className="font-bold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/homebru" className="flex items-center gap-2 p-2 hover:bg-gray-100 transition-colors no-underline text-sm">
                HomeBRU Radio
              </Link>
              <Link href="/avdp" className="flex items-center gap-2 p-2 hover:bg-gray-100 transition-colors no-underline text-sm">
                AVDP Podcast
              </Link>
              <Link href="/live" className="flex items-center gap-2 p-2 hover:bg-gray-100 transition-colors no-underline text-sm">
                Live Events
              </Link>
              <Link href="/community" className="flex items-center gap-2 p-2 hover:bg-gray-100 transition-colors no-underline text-sm">
                Community
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
