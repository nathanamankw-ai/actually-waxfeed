import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// POST /api/channels/[slug]/join - Join a channel
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { slug } = await params

    // Get channel
    const channel = await prisma.channel.findUnique({
      where: { slug },
      select: { id: true, type: true, name: true },
    })

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
    }

    // Check if already a member
    const existingMembership = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId: channel.id,
          userId: session.user.id,
        },
      },
    })

    if (existingMembership) {
      return NextResponse.json({ error: 'Already a member' }, { status: 409 })
    }

    // For private channels, would need invite system (TODO)
    if (channel.type === 'private') {
      return NextResponse.json({ error: 'This is a private channel. You need an invite to join.' }, { status: 403 })
    }

    // Join the channel
    const [membership] = await prisma.$transaction([
      prisma.channelMember.create({
        data: {
          channelId: channel.id,
          userId: session.user.id,
          role: 'member',
        },
      }),
      prisma.channel.update({
        where: { id: channel.id },
        data: { memberCount: { increment: 1 } },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: `Joined #${channel.name}`,
      membership,
    })
  } catch (error) {
    console.error('Error joining channel:', error)
    return NextResponse.json({ error: 'Failed to join channel' }, { status: 500 })
  }
}

// DELETE /api/channels/[slug]/join - Leave a channel
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { slug } = await params

    // Get channel
    const channel = await prisma.channel.findUnique({
      where: { slug },
      select: { id: true, name: true },
    })

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
    }

    // Check membership
    const membership = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId: channel.id,
          userId: session.user.id,
        },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this channel' }, { status: 404 })
    }

    // Owners can't leave (must transfer ownership first)
    if (membership.role === 'owner') {
      return NextResponse.json({ error: 'Channel owners cannot leave. Transfer ownership first.' }, { status: 403 })
    }

    // Leave the channel
    await prisma.$transaction([
      prisma.channelMember.delete({
        where: {
          channelId_userId: {
            channelId: channel.id,
            userId: session.user.id,
          },
        },
      }),
      prisma.channel.update({
        where: { id: channel.id },
        data: { memberCount: { decrement: 1 } },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: `Left #${channel.name}`,
    })
  } catch (error) {
    console.error('Error leaving channel:', error)
    return NextResponse.json({ error: 'Failed to leave channel' }, { status: 500 })
  }
}
