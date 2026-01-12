import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET /api/live/[eventSlug] - Get event details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventSlug: string }> }
) {
  try {
    const { eventSlug } = await params
    const session = await auth()

    const event = await prisma.liveEvent.findUnique({
      where: { slug: eventSlug },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },
        channel: {
          select: {
            id: true,
            slug: true,
            memberCount: true,
          },
        },
        attendees: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                image: true,
              },
            },
          },
        },
        setlist: {
          orderBy: { position: 'asc' },
        },
        _count: {
          select: {
            attendees: true,
            setlist: true,
            ratings: true,
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check if user is attending
    let userAttendance = null
    if (session?.user?.id) {
      userAttendance = await prisma.eventAttendee.findUnique({
        where: {
          eventId_userId: {
            eventId: event.id,
            userId: session.user.id,
          },
        },
      })
    }

    return NextResponse.json({
      ...event,
      isAttending: !!userAttendance,
      userAttendance,
    })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
  }
}

// PATCH /api/live/[eventSlug] - Update event (status, etc.)
export async function PATCH(
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

    // Get event and check ownership
    const event = await prisma.liveEvent.findUnique({
      where: { slug: eventSlug },
      select: { id: true, createdById: true },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to update this event' }, { status: 403 })
    }

    const { status, ...updateData } = body

    // Validate status transition
    if (status) {
      const validTransitions: Record<string, string[]> = {
        scheduled: ['live', 'cancelled'],
        live: ['ended'],
        ended: [],
        cancelled: [],
      }

      const currentEvent = await prisma.liveEvent.findUnique({
        where: { id: event.id },
        select: { status: true },
      })

      if (currentEvent && !validTransitions[currentEvent.status]?.includes(status)) {
        return NextResponse.json({ error: `Cannot change status from ${currentEvent.status} to ${status}` }, { status: 400 })
      }
    }

    const updated = await prisma.liveEvent.update({
      where: { id: event.id },
      data: {
        ...updateData,
        status,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}
