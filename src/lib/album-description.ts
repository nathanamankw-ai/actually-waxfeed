/**
 * Album Description Fetcher Service
 * 
 * Goal: Fetch descriptions that feel PERSONAL - what the artist wanted fans to know.
 * Priority: Genius (artist annotations) → Wikipedia (factual + quotes) → AI (artist-intent focused)
 */

interface DescriptionResult {
  description: string
  source: "wikipedia" | "genius" | "ai"
}

/**
 * Fetch from Genius - THE BEST SOURCE for artist intent
 * Genius has verified artist annotations where artists explain their own work
 */
async function fetchFromGenius(
  albumTitle: string,
  artistName: string
): Promise<string | null> {
  const geniusToken = process.env.GENIUS_ACCESS_TOKEN

  if (!geniusToken) {
    console.log("No Genius API token configured - skipping Genius")
    return null
  }

  try {
    // Search for the album on Genius
    const searchQuery = encodeURIComponent(`${albumTitle} ${artistName}`)
    const searchUrl = `https://api.genius.com/search?q=${searchQuery}`

    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${geniusToken}` },
    })

    if (!searchRes.ok) return null

    const searchData = await searchRes.json()
    const hits = searchData?.response?.hits

    if (!hits || hits.length === 0) return null

    // Find song by this artist to get album/artist info
    const artistHit = hits.find((hit: any) => 
      hit.result?.primary_artist?.name?.toLowerCase().includes(artistName.toLowerCase().split(' ')[0])
    )
    
    const songResult = artistHit?.result || hits[0]?.result
    if (!songResult) return null

    // Try to get the song's full data which might have album description
    const songId = songResult.id
    const songUrl = `https://api.genius.com/songs/${songId}`
    
    const songRes = await fetch(songUrl, {
      headers: { Authorization: `Bearer ${geniusToken}` },
    })
    
    if (songRes.ok) {
      const songData = await songRes.json()
      const song = songData?.response?.song
      
      // Check for album description
      if (song?.album?.description_annotation?.annotations?.[0]?.body?.plain) {
        let desc = song.album.description_annotation.annotations[0].body.plain
        return cleanDescription(desc, 600)
      }
      
      // Check for song description that might give album context
      if (song?.description?.plain && song.description.plain.length > 100) {
        let desc = song.description.plain
        return cleanDescription(desc, 600)
      }
    }

    return null
  } catch (error) {
    console.error("Genius fetch error:", error)
    return null
  }
}

/**
 * Fetch album description from Wikipedia
 * Good for factual info, often includes artist quotes and context
 */
async function fetchFromWikipedia(
  albumTitle: string,
  artistName: string
): Promise<string | null> {
  try {
    // Search specifically for the album page
    const searchQuery = encodeURIComponent(`${albumTitle} ${artistName} album`)
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchQuery}&format=json&origin=*`

    const searchRes = await fetch(searchUrl)
    if (!searchRes.ok) return null

    const searchData = await searchRes.json()
    const pages = searchData?.query?.search

    if (!pages || pages.length === 0) return null

    // Find the best match - prefer pages with "album" in title
    const albumPage = pages.find((p: any) => 
      p.title.toLowerCase().includes('album') || 
      p.title.toLowerCase().includes(albumTitle.toLowerCase())
    ) || pages[0]

    const pageTitle = albumPage.title

    // Fetch the extract for this page
    const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
      pageTitle
    )}&prop=extracts&exintro=true&explaintext=true&format=json&origin=*`

    const extractRes = await fetch(extractUrl)
    if (!extractRes.ok) return null

    const extractData = await extractRes.json()
    const pageData = Object.values(extractData?.query?.pages || {})[0] as {
      extract?: string
    }

    if (!pageData?.extract) return null

    return cleanDescription(pageData.extract, 700)
  } catch (error) {
    console.error("Wikipedia fetch error:", error)
    return null
  }
}

/**
 * Generate album description using AI - FOCUSED ON ARTIST INTENT
 * This prompt is crafted to give the "artist's perspective" not generic critic speak
 */
async function generateWithAI(
  albumTitle: string,
  artistName: string,
  releaseYear: number,
  genres: string[]
): Promise<string | null> {
  const openaiKey = process.env.OPENAI_API_KEY

  if (!openaiKey) {
    console.log("No OpenAI API key configured - skipping AI generation")
    return null
  }

  try {
    const genreText = genres.length > 0 ? genres.slice(0, 3).join(", ") : "music"

    const prompt = `You are writing a brief album description for "${albumTitle}" by ${artistName} (${releaseYear}, ${genreText}).

Write 2-3 sentences that capture what the ARTIST wanted listeners to experience. Focus on:
- The themes or story the artist was exploring
- The emotional journey or message
- What inspired the album or what the artist has said about it

Write in a warm, direct tone - like you're sharing insider knowledge with a fellow music fan. Avoid generic critic language like "masterful" or "sonic landscape."

If you don't have specific info about this album, write about the artist's general artistic vision and what fans can expect from their work in this era.

Start directly with the content - no "This album..." or similar openings.`

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a music insider who knows what artists want their fans to understand about their work. You write like you're sharing knowledge with a friend, not reviewing for a publication.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 200,
        temperature: 0.8,
      }),
    })

    if (!response.ok) {
      console.error("OpenAI API error:", response.status)
      return null
    }

    const data = await response.json()
    return data?.choices?.[0]?.message?.content?.trim() || null
  } catch (error) {
    console.error("OpenAI generation error:", error)
    return null
  }
}

/**
 * Helper: Clean and truncate description text
 */
function cleanDescription(text: string, maxLength: number): string {
  let description = text.trim()
  
  // Take first 2 paragraphs max
  const paragraphs = description.split("\n\n").filter((p) => p.trim())
  description = paragraphs.slice(0, 2).join("\n\n")
  
  // Truncate if needed, ending at sentence
  if (description.length > maxLength) {
    description = description.substring(0, maxLength).trim()
    const lastPeriod = description.lastIndexOf(".")
    if (lastPeriod > maxLength * 0.5) {
      description = description.substring(0, lastPeriod + 1)
    }
  }
  
  return description || null as any
}

/**
 * Main function to fetch album description
 * Priority: Genius (artist voice) → Wikipedia (factual) → AI (artist-intent focused)
 */
export async function fetchAlbumDescription(
  albumTitle: string,
  artistName: string,
  releaseYear: number,
  genres: string[]
): Promise<DescriptionResult | null> {
  console.log(`\n🎵 Fetching description for "${albumTitle}" by ${artistName}...`)

  // 1. Try Genius FIRST - best source for artist's own words
  const geniusDescription = await fetchFromGenius(albumTitle, artistName)
  if (geniusDescription) {
    console.log("✓ Found description from Genius (artist annotations)")
    return { description: geniusDescription, source: "genius" }
  }

  // 2. Try Wikipedia - good factual info, often has artist quotes
  const wikiDescription = await fetchFromWikipedia(albumTitle, artistName)
  if (wikiDescription) {
    console.log("✓ Found description from Wikipedia")
    return { description: wikiDescription, source: "wikipedia" }
  }

  // 3. AI fallback - generate with artist-intent focus
  const aiDescription = await generateWithAI(albumTitle, artistName, releaseYear, genres)
  if (aiDescription) {
    console.log("✓ Generated artist-focused description with AI")
    return { description: aiDescription, source: "ai" }
  }

  console.log("✗ Could not fetch description from any source")
  return null
}
