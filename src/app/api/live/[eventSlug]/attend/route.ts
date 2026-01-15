import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// POST /api/live/[eventSlug]/attend - Mark attendance
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

    // Get event
    const event = await prisma.liveEvent.findUnique({
      where: { slug: eventSlug },
      select: { id: true, status: true },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check if already attending
    const existingAttendance = await prisma.liveEventAttendee.findUnique({
      where: {
        eventId_userId: {
          eventId: event.id,
          userId: session.user.id,
        },
      },
    })

    if (existingAttendance) {
      // Already attending, return existing
      return NextResponse.json({ attendance: existingAttendance, isNew: false })
    }

    // Create new attendance
    const [attendance] = await prisma.$transaction([
      prisma.liveEventAttendee.create({
        data: {
          eventId: event.id,
          userId: session.user.id,
        },
      }),
      prisma.liveEvent.update({
        where: { id: event.id },
        data: { attendeeCount: { increment: 1 } },
      }),
    ])

    return NextResponse.json({ attendance, isNew: true }, { status: 201 })
  } catch (error) {
    console.error('Error updating attendance:', error)
    return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 })
  }
}

// DELETE /api/live/[eventSlug]/attend - Remove attendance
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventSlug: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { eventSlug } = await params

    // Get event
    const event = await prisma.liveEvent.findUnique({
      where: { slug: eventSlug },
      select: { id: true },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Delete attendance
    await prisma.$transaction([
      prisma.liveEventAttendee.delete({
        where: {
          eventId_userId: {
            eventId: event.id,
            userId: session.user.id,
          },
        },
      }),
      prisma.liveEvent.update({
        where: { id: event.id },
        data: { attendeeCount: { decrement: 1 } },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing attendance:', error)
    return NextResponse.json({ error: 'Failed to remove attendance' }, { status: 500 })
  }
}
