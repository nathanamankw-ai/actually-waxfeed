import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const createChannelSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['public', 'private']).default('public'),
  category: z.enum(['genre', 'artist', 'event', 'show', 'release']).optional(),
})

// GET /api/channels - List channels
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'public'
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: Record<string, unknown> = {
      isArchived: false,
    }

    if (type) where.type = type
    if (category) where.category = category

    const [channels, total] = await Promise.all([
      prisma.channel.findMany({
        where,
        orderBy: { memberCount: 'desc' },
        skip: offset,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          type: true,
          category: true,
          imageUrl: true,
          memberCount: true,
          messageCount: true,
          createdAt: true,
        },
      }),
      prisma.channel.count({ where }),
    ])

    return NextResponse.json({
      channels,
      pagination: {
        total,
        offset,
        limit,
        hasMore: offset + channels.length < total,
      },
    })
  } catch (error) {
    console.error('Error fetching channels:', error)
    return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 })
  }
}

// POST /api/channels - Create a new channel
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const validation = createChannelSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }

    const { name, description, type, category } = validation.data

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // Check if slug already exists
    const existing = await prisma.channel.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json({ error: 'A channel with this name already exists' }, { status: 409 })
    }

    // Create channel and add creator as owner
    const channel = await prisma.channel.create({
      data: {
        name,
        slug,
        description,
        type,
        category,
        createdById: session.user.id,
        memberCount: 1,
        members: {
          create: {
            userId: session.user.id,
            role: 'owner',
          },
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(channel, { status: 201 })
  } catch (error) {
    console.error('Error creating channel:', error)
    return NextResponse.json({ error: 'Failed to create channel' }, { status: 500 })
  }
}
