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
    const body = await request.json()
    const { status } = body // interested, going, checked_in

    // Get event
    const event = await prisma.liveEvent.findUnique({
      where: { slug: eventSlug },
      select: { id: true, status: true, channelId: true },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check if already attending
    const existingAttendance = await prisma.eventAttendee.findUnique({
      where: {
        eventId_userId: {
          eventId: event.id,
          userId: session.user.id,
        },
      },
    })

    if (existingAttendance) {
      // Update attendance status
      const updated = await prisma.eventAttendee.update({
        where: { id: existingAttendance.id },
        data: {
          status,
          checkedInAt: status === 'checked_in' ? new Date() : existingAttendance.checkedInAt,
        },
      })

      return NextResponse.json({ attendance: updated, isNew: false })
    }

    // Create new attendance
    const [attendance] = await prisma.$transaction([
      prisma.eventAttendee.create({
        data: {
          eventId: event.id,
          userId: session.user.id,
          status,
          checkedInAt: status === 'checked_in' ? new Date() : null,
        },
      }),
      prisma.liveEvent.update({
        where: { id: event.id },
        data: { attendeeCount: { increment: 1 } },
      }),
    ])

    // Auto-join event channel if exists
    if (event.channelId) {
      const existingMembership = await prisma.channelMember.findUnique({
        where: {
          channelId_userId: {
            channelId: event.channelId,
            userId: session.user.id,
          },
        },
      })

      if (!existingMembership) {
        await prisma.$transaction([
          prisma.channelMember.create({
            data: {
              channelId: event.channelId,
              userId: session.user.id,
              role: 'member',
            },
          }),
          prisma.channel.update({
            where: { id: event.channelId },
            data: { memberCount: { increment: 1 } },
          }),
        ])
      }
    }

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
      prisma.eventAttendee.delete({
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
