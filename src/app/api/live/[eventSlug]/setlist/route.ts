import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const addTrackSchema = z.object({
  trackName: z.string().min(1).max(200),
  artistName: z.string().max(200),
  albumId: z.string().optional(),
})

// GET /api/live/[eventSlug]/setlist - Get event setlist
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventSlug: string }> }
) {
  try {
    const { eventSlug } = await params

    const event = await prisma.liveEvent.findUnique({
      where: { slug: eventSlug },
      select: { id: true },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const setlist = await prisma.liveEventSetlistItem.findMany({
      where: { eventId: event.id },
      orderBy: { position: 'asc' },
    })

    return NextResponse.json({ setlist })
  } catch (error) {
    console.error('Error fetching setlist:', error)
    return NextResponse.json({ error: 'Failed to fetch setlist' }, { status: 500 })
  }
}

// POST /api/live/[eventSlug]/setlist - Add track to setlist
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventSlug: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { eventSlug } = await params
    const body = await request.json()

    const validation = addTrackSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }

    const { trackName, artistName, albumId } = validation.data

    // Get event and check if user is host
    const event = await prisma.liveEvent.findUnique({
      where: { slug: eventSlug },
      select: { id: true, hostId: true, status: true },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.hostId !== session.user.id) {
      return NextResponse.json({ error: 'Only the host can manage the setlist' }, { status: 403 })
    }

    if (event.status !== 'live') {
      return NextResponse.json({ error: 'Can only add tracks during live events' }, { status: 400 })
    }

    // Get next position
    const lastTrack = await prisma.liveEventSetlistItem.findFirst({
      where: { eventId: event.id },
      orderBy: { position: 'desc' },
    })

    const nextPosition = (lastTrack?.position ?? 0) + 1

    // Add track
    const track = await prisma.liveEventSetlistItem.create({
      data: {
        eventId: event.id,
        trackName,
        artistName,
        albumId,
        position: nextPosition,
        addedById: session.user.id,
      },
    })

    return NextResponse.json(track, { status: 201 })
  } catch (error) {
    console.error('Error adding track:', error)
    return NextResponse.json({ error: 'Failed to add track' }, { status: 500 })
  }
}
