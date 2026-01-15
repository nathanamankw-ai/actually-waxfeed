import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { notFound } from "next/navigation"
import Link from "next/link"
import { format, formatDistanceToNow } from "date-fns"
import { DefaultAvatar } from "@/components/default-avatar"
import { EventChat } from "./event-chat"
import { AttendButton } from "./attend-button"
import { QuickRating } from "./quick-rating"
import { SetlistManager } from "./setlist-manager"

export const dynamic = "force-dynamic"

async function getEvent(slug: string, userId: string | undefined) {
  const event = await prisma.liveEvent.findUnique({
    where: { slug },
    include: {
      attendees: {
        take: 20,
        orderBy: { joinedAt: "desc" },
      },
      setlist: {
        orderBy: { position: "asc" },
      },
      _count: {
        select: {
          attendees: true,
          setlist: true,
        },
      },
    },
  })

  if (!event) return null

  // Get host info if hostId exists
  let host = null
  if (event.hostId) {
    host = await prisma.user.findUnique({
      where: { id: event.hostId },
      select: {
        id: true,
        username: true,
        image: true,
        isVerified: true,
      },
    })
  }

  // Get attendee user info
  const attendeeUserIds = event.attendees.map(a => a.userId)
  const attendeeUsers = attendeeUserIds.length > 0 
    ? await prisma.user.findMany({
        where: { id: { in: attendeeUserIds } },
        select: { id: true, username: true, image: true },
      })
    : []
  const userMap = new Map(attendeeUsers.map(u => [u.id, u]))

  // Check if user is attending
  let isAttending = false
  if (userId) {
    isAttending = event.attendees.some(a => a.userId === userId)
  }

  return {
    ...event,
    host,
    attendees: event.attendees.map(a => ({
      ...a,
      user: userMap.get(a.userId) || { id: a.userId, username: 'Unknown', image: null },
    })),
    isAttending,
  }
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ eventSlug: string }>
}) {
  const { eventSlug } = await params
  const session = await auth()
  const event = await getEvent(eventSlug, session?.user?.id)

  if (!event) {
    notFound()
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "listening_party": return "LP"
      case "concert": return "C"
      case "dj_set": return "DJ"
      case "radio_show": return "R"
      case "podcast_live": return "P"
      default: return ""
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

  const isLive = event.status === "live"
  const isUpcoming = event.status === "scheduled"
  const isEnded = event.status === "ended"

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Link href="/live" className="text-sm text-gray-500 hover:text-black no-underline">
          ← Back to Events
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Header */}
          <div className="bg-gray-50 border border-gray-200  overflow-hidden">
            {/* Event Image */}
            {event.imageUrl ? (
              <img src={event.imageUrl} alt="" className="w-full h-48 lg:h-64 object-cover" />
            ) : (
              <div className="w-full h-48 lg:h-64 bg-gradient-to-br from-[#222] to-[#111] flex items-center justify-center text-6xl">
                {getEventTypeIcon(event.type)}
              </div>
            )}

            <div className="p-6">
              {/* Status Badge */}
              <div className="flex items-center gap-3 mb-4">
                {isLive && (
                  <span className="flex items-center gap-2 bg-red-500 text-white text-sm px-3 py-1  font-bold">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full  bg-white opacity-75"></span>
                      <span className="relative inline-flex  h-2 w-2 bg-white"></span>
                    </span>
                    LIVE
                  </span>
                )}
                {isUpcoming && (
                  <span className="bg-yellow-500/20 text-yellow-500 text-sm px-3 py-1 ">
                    {formatDistanceToNow(new Date(event.startTime), { addSuffix: true })}
                  </span>
                )}
                {isEnded && (
                  <span className="bg-gray-300 text-gray-500 text-sm px-3 py-1 ">
                    Ended
                  </span>
                )}
                <span className="text-sm text-gray-500">{getEventTypeName(event.type)}</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl lg:text-3xl font-bold mb-4">{event.name}</h1>

              {/* Host */}
              {event.host && (
                <div className="flex items-center gap-3 mb-4">
                  <Link href={`/u/${event.host.username}`} className="flex items-center gap-2 no-underline">
                    {event.host.image ? (
                      <img src={event.host.image} alt="" className="w-10 h-10 " />
                    ) : (
                      <DefaultAvatar size="md" />
                    )}
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium hover:underline">{event.host.username}</span>
                        {event.host.isVerified && (
                          <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">Host</span>
                    </div>
                  </Link>
                </div>
              )}

              {/* Time */}
              <div className="space-y-2 text-sm mb-6">
                <div className="flex items-center gap-2 text-gray-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{format(new Date(event.startTime), "EEEE, MMMM d, yyyy 'at' h:mm a")}</span>
                </div>
              </div>

              {/* Description */}
              {event.description && (
                <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
              )}

              {/* Attend Button */}
              {session && !isEnded && (
                <div className="mt-6">
                  <AttendButton
                    eventSlug={event.slug}
                    isAttending={event.isAttending}
                    currentStatus={null}
                    isLive={isLive}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Live Chat */}
          {(isLive || isUpcoming) && (
            <div className="bg-gray-50 border border-gray-200  overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-bold">Live Chat</h2>
              </div>
              <div style={{ height: "400px" }}>
                <EventChat
                  eventSlug={event.slug}
                  currentUserId={session?.user?.id}
                  isLive={isLive}
                />
              </div>
            </div>
          )}

          {/* Setlist */}
          {event.setlist.length > 0 && (
            <div className="bg-gray-50 border border-gray-200  p-4">
              <h2 className="font-bold mb-4">Setlist ({event._count.setlist} tracks)</h2>
              <div className="space-y-2">
                {event.setlist.map((track, index) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-gray-400 w-6 text-right">{index + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{track.trackName || "Unknown Track"}</p>
                      <p className="text-sm text-gray-500 truncate">{track.artistName || "Unknown Artist"}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {track.playedAt ? format(new Date(track.playedAt), "h:mm a") : "-"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Rating - Only show for live events */}
          {isLive && (
            <QuickRating
              eventSlug={event.slug}
              currentUserId={session?.user?.id}
            />
          )}

          {/* Setlist Manager */}
          <SetlistManager
            eventId={event.id}
            eventSlug={event.slug}
            initialSetlist={event.setlist}
            isHost={event.hostId === session?.user?.id}
            isLive={isLive}
          />

          {/* Stats */}
          <div className="bg-gray-50 border border-gray-200  p-4">
            <h3 className="font-bold mb-4">Event Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-100 rounded">
                <p className="text-2xl font-bold">{event._count.attendees}</p>
                <p className="text-xs text-gray-500">{isLive ? "Watching" : "Interested"}</p>
              </div>
              <div className="text-center p-3 bg-gray-100 rounded">
                <p className="text-2xl font-bold">{event._count.setlist}</p>
                <p className="text-xs text-gray-500">Tracks</p>
              </div>
            </div>
          </div>

          {/* Attendees */}
          <div className="bg-gray-50 border border-gray-200  p-4">
            <h3 className="font-bold mb-4">
              {isLive ? "Watching Now" : "Going"} ({event._count.attendees})
            </h3>
            {event.attendees.length === 0 ? (
              <p className="text-sm text-gray-500">No attendees yet</p>
            ) : (
              <div className="space-y-2">
                {event.attendees.map((attendee) => (
                  <Link
                    key={attendee.user.id}
                    href={`/u/${attendee.user.username}`}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 transition-colors no-underline"
                  >
                    {attendee.user.image ? (
                      <img src={attendee.user.image} alt="" className="w-8 h-8 " />
                    ) : (
                      <DefaultAvatar size="sm" />
                    )}
                    <span className="text-sm font-medium truncate">{attendee.user.username}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-50 border border-gray-200  p-4">
            <h3 className="font-bold mb-4">Quick Links</h3>
            <div className="space-y-2">
              {event.streamUrl && (
                <a
                  href={event.streamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 transition-colors no-underline text-sm"
                >
                  Stream Link
                </a>
              )}
              <Link
                href="/community"
                className="flex items-center gap-2 p-2 hover:bg-gray-100 transition-colors no-underline text-sm"
              >
                Community Hub
              </Link>
              <Link
                href="/live"
                className="flex items-center gap-2 p-2 hover:bg-gray-100 transition-colors no-underline text-sm"
              >
                All Events
              </Link>
            </div>
          </div>

          {/* Sign In Prompt */}
          {!session && (
            <div className="bg-gray-50 border border-gray-200  p-4 text-center">
              <p className="text-sm text-gray-500 mb-3">Sign in to join this event</p>
              <Link
                href="/login"
                className="inline-block bg-white text-black px-4 py-2 font-bold text-sm no-underline hover:bg-gray-100"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
