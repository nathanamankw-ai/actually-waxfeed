import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const createEventSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  type: z.enum(['dj_set', 'listening_party', 'interview', 'podcast']).default('listening_party'),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  streamUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
})

// GET /api/live - List events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // live, scheduled, ended
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const now = new Date()
    const where: Record<string, unknown> = {}

    if (status === 'live') {
      where.status = 'live'
    } else if (status === 'scheduled') {
      where.status = 'scheduled'
      where.startTime = { gte: now }
    } else if (status === 'ended') {
      where.status = 'ended'
    } else if (status === 'upcoming') {
      // Live or scheduled in next 24 hours
      where.OR = [
        { status: 'live' },
        {
          status: 'scheduled',
          startTime: {
            gte: now,
            lte: new Date(now.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      ]
    }

    if (type) {
      where.type = type
    }

    const [events, total] = await Promise.all([
      prisma.liveEvent.findMany({
        where,
        orderBy: [
          { status: 'asc' }, // live first
          { startTime: 'asc' },
        ],
        skip: offset,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          type: true,
          status: true,
          startTime: true,
          endTime: true,
          streamUrl: true,
          imageUrl: true,
          hostId: true,
          attendeeCount: true,
          messageCount: true,
          createdAt: true,
        },
      }),
      prisma.liveEvent.count({ where }),
    ])

    return NextResponse.json({
      events,
      pagination: {
        total,
        offset,
        limit,
        hasMore: offset + events.length < total,
      },
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

// POST /api/live - Create a new event
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const validation = createEventSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }

    const { name, description, type, startTime, endTime, streamUrl, imageUrl } = validation.data

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') +
      '-' +
      Date.now().toString(36)

    // Create event
    const event = await prisma.liveEvent.create({
      data: {
        name,
        slug,
        description,
        type,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        streamUrl,
        imageUrl,
        hostId: session.user.id,
        status: 'scheduled',
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}
