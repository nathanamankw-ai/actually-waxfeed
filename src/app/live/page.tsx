import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { formatDistanceToNow, format } from "date-fns"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Live Events",
  description: "Join live music events, listening parties, and 360 Sound sessions on WAXFEED.",
  openGraph: {
    title: "Live Events | WAXFEED",
    description: "Join live music events and listening parties.",
  },
}

export const dynamic = "force-dynamic"

async function getEvents() {
  const now = new Date()

  const [liveEvents, upcomingEvents, pastEvents] = await Promise.all([
    // Currently live
    prisma.liveEvent.findMany({
      where: { status: "live" },
      orderBy: { startTime: "asc" },
      include: {
        createdBy: {
          select: { id: true, username: true, image: true },
        },
        _count: {
          select: { attendees: true },
        },
      },
    }),
    // Upcoming (next 7 days)
    prisma.liveEvent.findMany({
      where: {
        status: "scheduled",
        startTime: {
          gte: now,
          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { startTime: "asc" },
      take: 10,
      include: {
        createdBy: {
          select: { id: true, username: true, image: true },
        },
        _count: {
          select: { attendees: true },
        },
      },
    }),
    // Recent past events
    prisma.liveEvent.findMany({
      where: { status: "ended" },
      orderBy: { startTime: "desc" },
      take: 6,
      include: {
        createdBy: {
          select: { id: true, username: true, image: true },
        },
        _count: {
          select: { attendees: true, setlist: true },
        },
      },
    }),
  ])

  return { liveEvents, upcomingEvents, pastEvents }
}

export default async function LiveEventsPage() {
  const session = await auth()
  const { liveEvents, upcomingEvents, pastEvents } = await getEvents()

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "listening_party": return "🎧"
      case "concert": return "🎤"
      case "dj_set": return "🎛️"
      case "radio_show": return "📻"
      case "podcast_live": return "🎙️"
      default: return "🎵"
    }
  }

  const getEventTypeName = (type: string) => {
    switch (type) {
      case "listening_party": return "Listening Party"
      case "concert": return "Concert"
      case "dj_set": return "DJ Set"
      case "radio_show": return "Radio Show"
      case "podcast_live": return "Live Podcast"
      default: return "Event"
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Live Events</h1>
          <p className="text-[#888] text-sm mt-1">360 Sound • Listening Parties • Live Shows</p>
        </div>
        {session && (
          <Link
            href="/live/new"
            className="flex items-center gap-2 bg-white text-black px-4 py-2 font-bold text-sm no-underline hover:bg-gray-100"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Event
          </Link>
        )}
      </div>

      {/* Live Now Section */}
      {liveEvents.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <h2 className="text-lg font-bold text-red-500">Live Now</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveEvents.map((event) => (
              <Link
                key={event.id}
                href={`/live/${event.slug}`}
                className="relative overflow-hidden bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-lg p-4 hover:border-red-500/50 transition-colors no-underline"
              >
                <div className="absolute top-3 right-3">
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                    LIVE
                  </span>
                </div>
                
                {event.imageUrl ? (
                  <img src={event.imageUrl} alt="" className="w-full h-32 object-cover rounded mb-3" />
                ) : (
                  <div className="w-full h-32 bg-[#222] rounded mb-3 flex items-center justify-center text-4xl">
                    {getEventTypeIcon(event.type)}
                  </div>
                )}

                <h3 className="font-bold text-lg mb-1">{event.name}</h3>
                <p className="text-sm text-[#888] mb-2">{getEventTypeName(event.type)}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {event.createdBy.image ? (
                      <img src={event.createdBy.image} alt="" className="w-5 h-5 rounded-full" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-[#333]" />
                    )}
                    <span className="text-[#888]">{event.createdBy.username}</span>
                  </div>
                  <span className="text-red-400">
                    {event._count.attendees} watching
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      <section className="mb-10">
        <h2 className="text-lg font-bold mb-4">Upcoming Events</h2>
        {upcomingEvents.length === 0 ? (
          <div className="text-center py-12 border border-[#222] rounded-lg">
            <p className="text-[#888] mb-2">No upcoming events</p>
            <p className="text-sm text-[#666]">Check back later or create your own event!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.map((event) => (
              <Link
                key={event.id}
                href={`/live/${event.slug}`}
                className="bg-[#111] border border-[#222] rounded-lg p-4 hover:border-[#444] transition-colors no-underline"
              >
                {event.imageUrl ? (
                  <img src={event.imageUrl} alt="" className="w-full h-32 object-cover rounded mb-3" />
                ) : (
                  <div className="w-full h-32 bg-[#222] rounded mb-3 flex items-center justify-center text-4xl">
                    {getEventTypeIcon(event.type)}
                  </div>
                )}

                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-yellow-500/20 text-yellow-500 text-xs px-2 py-0.5 rounded">
                    {formatDistanceToNow(new Date(event.startTime), { addSuffix: true })}
                  </span>
                  <span className="text-xs text-[#666]">{getEventTypeName(event.type)}</span>
                </div>

                <h3 className="font-bold mb-1">{event.name}</h3>
                
                <p className="text-sm text-[#888] mb-3">
                  {format(new Date(event.startTime), "EEEE, MMM d 'at' h:mm a")}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {event.createdBy.image ? (
                      <img src={event.createdBy.image} alt="" className="w-5 h-5 rounded-full" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-[#333]" />
                    )}
                    <span className="text-[#888]">{event.createdBy.username}</span>
                  </div>
                  <span className="text-[#666]">
                    {event._count.attendees} interested
                  </span>
                </div>

                {event.city && (
                  <p className="text-xs text-[#666] mt-2 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event.city}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <section>
          <h2 className="text-lg font-bold mb-4">Recent Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastEvents.map((event) => (
              <Link
                key={event.id}
                href={`/live/${event.slug}`}
                className="bg-[#111] border border-[#222] rounded-lg p-4 hover:border-[#444] transition-colors no-underline opacity-80"
              >
                {event.imageUrl ? (
                  <img src={event.imageUrl} alt="" className="w-full h-32 object-cover rounded mb-3 grayscale" />
                ) : (
                  <div className="w-full h-32 bg-[#222] rounded mb-3 flex items-center justify-center text-4xl opacity-50">
                    {getEventTypeIcon(event.type)}
                  </div>
                )}

                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#333] text-[#888] text-xs px-2 py-0.5 rounded">
                    Ended
                  </span>
                  <span className="text-xs text-[#666]">{getEventTypeName(event.type)}</span>
                </div>

                <h3 className="font-bold mb-1">{event.name}</h3>
                
                <p className="text-sm text-[#666] mb-3">
                  {format(new Date(event.startTime), "MMM d, yyyy")}
                </p>

                <div className="flex items-center justify-between text-sm text-[#666]">
                  <span>{event._count.attendees} attended</span>
                  <span>{event._count.setlist} tracks</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA for non-logged in users */}
      {!session && (
        <section className="mt-10 p-6 bg-[#111] border border-[#222] rounded-lg text-center">
          <h3 className="font-bold mb-2">Want to host your own event?</h3>
          <p className="text-sm text-[#888] mb-4">Sign in to create listening parties and live events</p>
          <Link
            href="/login"
            className="inline-block bg-white text-black px-6 py-2 font-bold text-sm no-underline hover:bg-gray-100"
          >
            Sign In
          </Link>
        </section>
      )}
    </div>
  )
}
