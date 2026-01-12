import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

const DEFAULT_CHANNELS = [
  { name: "Hip-Hop", slug: "hip-hop", category: "genre", description: "Discuss all things hip-hop and rap" },
  { name: "R&B", slug: "r-and-b", category: "genre", description: "R&B, soul, and neo-soul discussions" },
  { name: "Pop", slug: "pop", category: "genre", description: "Pop music conversations" },
  { name: "Rock", slug: "rock", category: "genre", description: "Rock, alternative, and indie rock" },
  { name: "Electronic", slug: "electronic", category: "genre", description: "EDM, house, techno, and electronic music" },
  { name: "Jazz", slug: "jazz", category: "genre", description: "Jazz, fusion, and improvisational music" },
  { name: "Country", slug: "country", category: "genre", description: "Country and Americana music" },
  { name: "Latin", slug: "latin", category: "genre", description: "Latin, reggaeton, and Spanish-language music" },
  { name: "New Releases", slug: "new-releases", category: "release", description: "Discuss the latest album drops" },
  { name: "Friday Drops", slug: "friday-drops", category: "release", description: "Weekly new music Friday discussions" },
  { name: "360 Sound", slug: "360-sound", category: "event", description: "Live event discussions and updates" },
  { name: "HomeBRU", slug: "homebru", category: "show", description: "HomeBRU show companion chat" },
  { name: "AVDP", slug: "avdp", category: "show", description: "A Very Distant Perspective discussions" },
  { name: "WBRU Picks", slug: "wbru-picks", category: "show", description: "Staff picks and recommendations" },
]

export async function GET() {
  try {
    const session = await auth()
    
    // Get or create a system user for seeding
    let systemUser = await prisma.user.findFirst({
      where: { email: 'system@waxfeed.com' }
    })
    
    if (!systemUser && session?.user?.id) {
      // Use the logged-in user if no system user exists
      systemUser = await prisma.user.findUnique({
        where: { id: session.user.id }
      })
    }
    
    if (!systemUser) {
      return NextResponse.json({ 
        error: 'No user available for seeding. Please log in first.' 
      }, { status: 401 })
    }

    const results = []
    
    for (const channel of DEFAULT_CHANNELS) {
      // Check if channel already exists
      const existing = await prisma.channel.findUnique({
        where: { slug: channel.slug }
      })
      
      if (existing) {
        results.push({ ...channel, status: 'exists' })
        continue
      }
      
      // Create channel
      await prisma.channel.create({
        data: {
          name: channel.name,
          slug: channel.slug,
          description: channel.description,
          category: channel.category,
          type: 'public',
          createdById: systemUser.id,
          memberCount: 1,
          members: {
            create: {
              userId: systemUser.id,
              role: 'owner',
            },
          },
        },
      })
      
      results.push({ ...channel, status: 'created' })
    }
    
    return NextResponse.json({
      success: true,
      results,
      summary: {
        created: results.filter(r => r.status === 'created').length,
        existing: results.filter(r => r.status === 'exists').length,
      }
    })
  } catch (error) {
    console.error('Error seeding channels:', error)
    return NextResponse.json({ error: 'Failed to seed channels' }, { status: 500 })
  }
}

export async function POST() {
  return GET()
}
