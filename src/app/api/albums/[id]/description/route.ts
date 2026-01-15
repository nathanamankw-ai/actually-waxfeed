import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { fetchAlbumDescription } from "@/lib/album-description"

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/albums/[id]/description
 * Fetches album description from Wikipedia/Genius/AI
 * No database caching - fetches fresh each time (until migration is run)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Find the album - only select fields that definitely exist in all versions
    const album = await prisma.album.findFirst({
      where: {
        OR: [{ id }, { spotifyId: id }],
      },
      select: {
        id: true,
        title: true,
        artistName: true,
        releaseDate: true,
        genres: true,
      },
    })

    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 })
    }

    // Fetch description from external sources (Wikipedia, Genius, AI)
    const releaseYear = new Date(album.releaseDate).getFullYear()
    const result = await fetchAlbumDescription(
      album.title,
      album.artistName,
      releaseYear,
      album.genres
    )

    if (!result) {
      return NextResponse.json({
        description: null,
        source: null,
        error: "Could not fetch description from any source",
      })
    }

    return NextResponse.json({
      description: result.description,
      source: result.source,
      fetchedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching album description:", error)
    return NextResponse.json(
      { error: "Failed to fetch description" },
      { status: 500 }
    )
  }
}

