import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as cheerio from "cheerio"

// Cron secret to prevent unauthorized access
const CRON_SECRET = process.env.CRON_SECRET

async function getSpotifyToken(): Promise<string> {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  })

  const data = await response.json()
  return data.access_token
}

interface SpotifyAlbum {
  id: string
  name: string
  artists: { name: string }[]
  images: { url: string }[]
  release_date: string
  album_type: string
  total_tracks: number
  external_urls: { spotify: string }
}

async function searchAlbum(token: string, query: string): Promise<SpotifyAlbum | null> {
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=1`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const data = await response.json()
  return data.albums?.items?.[0] || null
}

async function importAlbum(album: SpotifyAlbum, rank: number, chartDate: Date): Promise<boolean> {
  if (album.album_type === "single" && album.total_tracks < 4) return false

  try {
    await prisma.album.upsert({
      where: { spotifyId: album.id },
      update: {
        billboardRank: rank,
        billboardDate: chartDate,
      },
      create: {
        spotifyId: album.id,
        title: album.name,
        artistName: album.artists.map((a) => a.name).join(", "),
        coverArtUrl: album.images[0]?.url || null,
        releaseDate: album.release_date ? new Date(album.release_date) : new Date(),
        genres: [],
        totalTracks: album.total_tracks,
        spotifyUrl: album.external_urls.spotify,
        billboardRank: rank,
        billboardDate: chartDate,
      },
    })
    return true
  } catch {
    return false
  }
}

interface BillboardEntry {
  rank: number
  title: string
  artist: string
}

async function fetchBillboard200(): Promise<BillboardEntry[]> {
  const response = await fetch("https://www.billboard.com/charts/billboard-200/", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  })

  if (!response.ok) {
    throw new Error(`Billboard fetch failed: ${response.status}`)
  }

  const html = await response.text()
  const $ = cheerio.load(html)
  const albums: BillboardEntry[] = []

  // Billboard uses data-detail-target for chart entries
  $("div.o-chart-results-list-row-container").each((i, el) => {
    const rank = i + 1
    const title = $(el).find("h3#title-of-a-story").first().text().trim()
    const artist = $(el).find("span.c-label.a-no-trucate").first().text().trim()

    if (title && artist && rank <= 50) {
      albums.push({ rank, title, artist })
    }
  })

  // Fallback selector if the above doesn't work
  if (albums.length === 0) {
    $("li.o-chart-results-list__item").each((i, el) => {
      const rank = i + 1
      const title = $(el).find("h3").first().text().trim()
      const artist = $(el).find("span").first().text().trim()

      if (title && artist && rank <= 50) {
        albums.push({ rank, title, artist })
      }
    })
  }

  if (albums.length === 0) {
    throw new Error("Could not parse Billboard chart - website structure may have changed")
  }

  return albums
}

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sends this automatically for cron jobs)
  const authHeader = request.headers.get("authorization")
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Fetch live Billboard 200 chart
    console.log("Fetching Billboard 200 chart...")
    const billboardAlbums = await fetchBillboard200()
    console.log(`Found ${billboardAlbums.length} albums on chart`)

    // Clear previous Billboard rankings
    await prisma.album.updateMany({
      where: { billboardRank: { not: null } },
      data: { billboardRank: null, billboardDate: null },
    })

    const token = await getSpotifyToken()
    const chartDate = new Date()
    let imported = 0
    let failed = 0

    for (const { rank, title, artist } of billboardAlbums) {
      const spotifyAlbum = await searchAlbum(token, `${title} ${artist}`)
      if (spotifyAlbum) {
        const success = await importAlbum(spotifyAlbum, rank, chartDate)
        if (success) {
          imported++
        } else {
          failed++
        }
      } else {
        failed++
      }
      // Rate limiting for Spotify API
      await new Promise((r) => setTimeout(r, 50))
    }

    console.log(`Billboard import complete: ${imported} imported, ${failed} failed`)

    return NextResponse.json({
      success: true,
      imported,
      failed,
      total: billboardAlbums.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Billboard import failed:", error)
    return NextResponse.json(
      { error: "Import failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
