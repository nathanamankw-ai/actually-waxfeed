/**
 * TASTEID - Music Taste Fingerprint System
 *
 * Core algorithm for computing persistent taste profiles.
 * Connects WaxFeed to Polarity's CCX (Conversational Connectomics) research.
 * Taste graphs ARE knowledge graphs.
 */

import { prisma } from '@/lib/prisma'

// ============================================
// ARCHETYPES
// ============================================

export const ARCHETYPES = {
  // Genre-based archetypes
  HIP_HOP_HEAD: {
    id: 'hip-hop-head',
    name: 'Hip-Hop Head',
    description: 'Lives and breathes hip-hop culture',
    genres: ['hip-hop', 'rap', 'trap', 'southern hip hop', 'east coast hip hop', 'west coast hip hop'],
    icon: '🎤',
  },
  JAZZ_EXPLORER: {
    id: 'jazz-explorer',
    name: 'Jazz Explorer',
    description: 'Drawn to improvisation and complexity',
    genres: ['jazz', 'jazz fusion', 'bebop', 'modal jazz', 'free jazz', 'contemporary jazz'],
    icon: '🎷',
  },
  ROCK_PURIST: {
    id: 'rock-purist',
    name: 'Rock Purist',
    description: 'Guitar-driven music runs through their veins',
    genres: ['rock', 'classic rock', 'hard rock', 'alternative rock', 'indie rock', 'punk rock'],
    icon: '🎸',
  },
  ELECTRONIC_PIONEER: {
    id: 'electronic-pioneer',
    name: 'Electronic Pioneer',
    description: 'Synths, beats, and futuristic sounds',
    genres: ['electronic', 'house', 'techno', 'ambient', 'edm', 'drum and bass', 'dubstep'],
    icon: '🎹',
  },
  SOUL_SEARCHER: {
    id: 'soul-searcher',
    name: 'Soul Searcher',
    description: 'Connects with music on an emotional level',
    genres: ['soul', 'r&b', 'neo soul', 'motown', 'funk', 'gospel'],
    icon: '💜',
  },
  METAL_MAVEN: {
    id: 'metal-maven',
    name: 'Metal Maven',
    description: 'Heavy riffs and intense energy',
    genres: ['metal', 'heavy metal', 'death metal', 'black metal', 'thrash metal', 'metalcore'],
    icon: '🤘',
  },
  INDIE_DEVOTEE: {
    id: 'indie-devotee',
    name: 'Indie Devotee',
    description: 'Champions the underground and obscure',
    genres: ['indie', 'indie pop', 'indie folk', 'lo-fi', 'bedroom pop', 'art pop'],
    icon: '🎧',
  },
  POP_CONNOISSEUR: {
    id: 'pop-connoisseur',
    name: 'Pop Connoisseur',
    description: 'Appreciates craft in mainstream music',
    genres: ['pop', 'synth-pop', 'dance pop', 'electropop', 'k-pop', 'j-pop'],
    icon: '⭐',
  },
  COUNTRY_SOUL: {
    id: 'country-soul',
    name: 'Country Soul',
    description: 'Stories, twang, and heartland vibes',
    genres: ['country', 'americana', 'bluegrass', 'folk', 'country rock', 'outlaw country'],
    icon: '🤠',
  },
  CLASSICAL_MIND: {
    id: 'classical-mind',
    name: 'Classical Mind',
    description: 'Appreciates composition and orchestration',
    genres: ['classical', 'orchestral', 'chamber music', 'opera', 'contemporary classical', 'baroque'],
    icon: '🎻',
  },

  // Behavior-based archetypes
  GENRE_FLUID: {
    id: 'genre-fluid',
    name: 'Genre Fluid',
    description: 'Refuses to be boxed in - listens to everything',
    genres: [],
    behavioral: true,
    icon: '🌈',
  },
  DECADE_DIVER: {
    id: 'decade-diver',
    name: 'Decade Diver',
    description: 'Obsessed with a specific era of music',
    genres: [],
    behavioral: true,
    icon: '⏰',
  },
  DEEP_CUTTER: {
    id: 'deep-cutter',
    name: 'Deep Cutter',
    description: 'Goes beyond the hits, finds the gems',
    genres: [],
    behavioral: true,
    icon: '💎',
  },
  CHART_CHASER: {
    id: 'chart-chaser',
    name: 'Chart Chaser',
    description: 'Always on top of what\'s hot',
    genres: [],
    behavioral: true,
    icon: '📈',
  },
  THE_CRITIC: {
    id: 'the-critic',
    name: 'The Critic',
    description: 'High standards, few 10s given',
    genres: [],
    behavioral: true,
    icon: '🧐',
  },
  THE_ENTHUSIAST: {
    id: 'the-enthusiast',
    name: 'The Enthusiast',
    description: 'Finds joy in almost everything',
    genres: [],
    behavioral: true,
    icon: '🎉',
  },
  ESSAY_WRITER: {
    id: 'essay-writer',
    name: 'Essay Writer',
    description: 'Reviews are mini dissertations',
    genres: [],
    behavioral: true,
    icon: '📝',
  },
  ALBUM_ARCHAEOLOGIST: {
    id: 'album-archaeologist',
    name: 'Album Archaeologist',
    description: 'Digs into music history',
    genres: [],
    behavioral: true,
    icon: '🏛️',
  },
  NEW_RELEASE_HUNTER: {
    id: 'new-release-hunter',
    name: 'New Release Hunter',
    description: 'First to review the latest drops',
    genres: [],
    behavioral: true,
    icon: '🆕',
  },
  TASTE_TWIN_SEEKER: {
    id: 'taste-twin-seeker',
    name: 'Taste Twin Seeker',
    description: 'Always comparing and connecting with others',
    genres: [],
    behavioral: true,
    icon: '👯',
  },
} as const

export type ArchetypeId = keyof typeof ARCHETYPES

// ============================================
// TYPES
// ============================================

export interface GenreVector {
  [genre: string]: number // 0-1 affinity score
}

export interface ArtistDNA {
  artistName: string
  weight: number // 0-1 importance
  avgRating: number
  reviewCount: number
}

export interface DecadePreferences {
  [decade: string]: number // 0-1 preference
}

export interface TasteIDComputation {
  genreVector: GenreVector
  artistDNA: ArtistDNA[]
  decadePreferences: DecadePreferences
  primaryArchetype: string
  secondaryArchetype: string | null
  archetypeConfidence: number
  adventurenessScore: number
  ratingSkew: 'harsh' | 'lenient' | 'balanced'
  averageRating: number
  ratingStdDev: number
  reviewDepth: 'rater' | 'writer' | 'essayist'
  reviewCount: number
  avgReviewLength: number
  topGenres: string[]
  topArtists: string[]
  signatureAlbums: string[]
  polarityScore: number
}

interface ReviewWithAlbum {
  id: string
  rating: number
  text: string | null
  createdAt: Date
  album: {
    id: string
    genres: string[]
    artistName: string
    releaseDate: Date
    title: string
    averageRating: number | null
    totalReviews: number
  }
}

// ============================================
// COMPUTATION ENGINE
// ============================================

/**
 * Compute a user's complete TasteID from their reviews
 */
export async function computeTasteID(userId: string): Promise<TasteIDComputation | null> {
  // Fetch all user reviews with album data
  const reviews = await prisma.review.findMany({
    where: { userId },
    include: {
      album: {
        select: {
          id: true,
          genres: true,
          artistName: true,
          releaseDate: true,
          title: true,
          averageRating: true,
          totalReviews: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (reviews.length === 0) {
    return null
  }

  // Apply recency weighting - more recent reviews matter more
  const weightedReviews = applyRecencyWeighting(reviews)

  // 1. Compute genre vector
  const genreVector = computeGenreVector(weightedReviews)

  // 2. Compute artist DNA
  const artistDNA = computeArtistDNA(weightedReviews)

  // 3. Compute decade preferences
  const decadePreferences = computeDecadePreferences(weightedReviews)

  // 4. Rating analysis
  const ratings = reviews.map(r => r.rating)
  const averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length
  const ratingStdDev = Math.sqrt(
    ratings.reduce((sum, r) => sum + Math.pow(r - averageRating, 2), 0) / ratings.length
  )
  const ratingSkew = getRatingSkew(averageRating)

  // 5. Review depth analysis
  const reviewLengths = reviews.map(r => (r.text?.split(/\s+/).length || 0))
  const avgReviewLength = reviewLengths.reduce((a, b) => a + b, 0) / reviewLengths.length
  const reviewDepth = getReviewDepth(avgReviewLength)

  // 6. Adventureness score (genre diversity)
  const adventurenessScore = computeAdventurenessScore(genreVector)

  // 7. Classify archetype
  const { primary, secondary, confidence } = classifyArchetype(
    genreVector,
    adventurenessScore,
    ratingSkew,
    reviewDepth,
    avgReviewLength,
    reviews
  )

  // 8. Extract display data
  const topGenres = Object.entries(genreVector)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([genre]) => genre)

  const topArtists = artistDNA
    .slice(0, 10)
    .map(a => a.artistName)

  // 9. Find signature albums (highly rated, distinctly theirs)
  const signatureAlbums = findSignatureAlbums(reviews)

  // 10. Compute Polarity Score (Bayesian edge strength)
  const polarityScore = computePolarityScore(reviews, genreVector, adventurenessScore)

  return {
    genreVector,
    artistDNA,
    decadePreferences,
    primaryArchetype: primary,
    secondaryArchetype: secondary,
    archetypeConfidence: confidence,
    adventurenessScore,
    ratingSkew,
    averageRating,
    ratingStdDev,
    reviewDepth,
    reviewCount: reviews.length,
    avgReviewLength: Math.round(avgReviewLength),
    topGenres,
    topArtists,
    signatureAlbums,
    polarityScore,
  }
}

/**
 * Apply recency weighting - recent reviews weighted more heavily
 */
function applyRecencyWeighting(reviews: ReviewWithAlbum[]): Array<ReviewWithAlbum & { weight: number }> {
  const now = new Date()
  const maxAge = 365 * 2 // 2 years for decay

  return reviews.map(review => {
    const ageInDays = (now.getTime() - review.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    // Exponential decay with half-life of 180 days
    const weight = Math.exp(-ageInDays / 180)
    // Bonus for written reviews (stronger signal)
    const textBonus = review.text && review.text.length > 50 ? 1.3 : 1
    return { ...review, weight: weight * textBonus }
  })
}

/**
 * Compute genre affinity vector
 */
function computeGenreVector(reviews: Array<ReviewWithAlbum & { weight: number }>): GenreVector {
  const genreScores: Record<string, { total: number; count: number }> = {}

  for (const review of reviews) {
    for (const genre of review.album.genres) {
      const normalizedGenre = genre.toLowerCase()
      if (!genreScores[normalizedGenre]) {
        genreScores[normalizedGenre] = { total: 0, count: 0 }
      }
      // Weight by both recency and rating
      const ratingFactor = review.rating / 10 // 0-1
      genreScores[normalizedGenre].total += review.weight * ratingFactor
      genreScores[normalizedGenre].count += review.weight
    }
  }

  // Normalize to 0-1 scale
  const maxScore = Math.max(...Object.values(genreScores).map(g => g.total / g.count), 0.001)
  const vector: GenreVector = {}

  for (const [genre, { total, count }] of Object.entries(genreScores)) {
    vector[genre] = (total / count) / maxScore
  }

  return vector
}

/**
 * Compute artist DNA - top defining artists
 */
function computeArtistDNA(reviews: Array<ReviewWithAlbum & { weight: number }>): ArtistDNA[] {
  const artistScores: Record<string, { totalWeight: number; totalRating: number; count: number }> = {}

  for (const review of reviews) {
    const artist = review.album.artistName
    if (!artistScores[artist]) {
      artistScores[artist] = { totalWeight: 0, totalRating: 0, count: 0 }
    }
    artistScores[artist].totalWeight += review.weight
    artistScores[artist].totalRating += review.rating
    artistScores[artist].count += 1
  }

  const artists = Object.entries(artistScores)
    .map(([artistName, data]) => ({
      artistName,
      weight: data.totalWeight,
      avgRating: data.totalRating / data.count,
      reviewCount: data.count,
    }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 20)

  // Normalize weights
  const maxWeight = Math.max(...artists.map(a => a.weight), 0.001)
  return artists.map(a => ({
    ...a,
    weight: a.weight / maxWeight,
  }))
}

/**
 * Compute decade preferences
 */
function computeDecadePreferences(reviews: Array<ReviewWithAlbum & { weight: number }>): DecadePreferences {
  const decadeScores: Record<string, { total: number; count: number }> = {}

  for (const review of reviews) {
    const year = new Date(review.album.releaseDate).getFullYear()
    const decade = `${Math.floor(year / 10) * 10}s`
    if (!decadeScores[decade]) {
      decadeScores[decade] = { total: 0, count: 0 }
    }
    decadeScores[decade].total += review.weight * (review.rating / 10)
    decadeScores[decade].count += review.weight
  }

  const maxScore = Math.max(...Object.values(decadeScores).map(d => d.total / d.count), 0.001)
  const preferences: DecadePreferences = {}

  for (const [decade, { total, count }] of Object.entries(decadeScores)) {
    preferences[decade] = (total / count) / maxScore
  }

  return preferences
}

/**
 * Determine rating skew
 */
function getRatingSkew(averageRating: number): 'harsh' | 'lenient' | 'balanced' {
  if (averageRating < 5.5) return 'harsh'
  if (averageRating > 7.5) return 'lenient'
  return 'balanced'
}

/**
 * Determine review depth
 */
function getReviewDepth(avgWordCount: number): 'rater' | 'writer' | 'essayist' {
  if (avgWordCount < 20) return 'rater'
  if (avgWordCount < 100) return 'writer'
  return 'essayist'
}

/**
 * Compute adventureness score (how diverse is their taste)
 */
function computeAdventurenessScore(genreVector: GenreVector): number {
  const genres = Object.keys(genreVector)
  if (genres.length <= 1) return 0

  // Shannon entropy normalized
  const values = Object.values(genreVector)
  const sum = values.reduce((a, b) => a + b, 0)
  if (sum === 0) return 0

  const probs = values.map(v => v / sum)
  const entropy = -probs.reduce((acc, p) => {
    if (p > 0) acc += p * Math.log2(p)
    return acc
  }, 0)

  // Normalize by max possible entropy (uniform distribution)
  const maxEntropy = Math.log2(genres.length)
  return maxEntropy > 0 ? entropy / maxEntropy : 0
}

/**
 * Classify user archetype based on taste profile
 */
function classifyArchetype(
  genreVector: GenreVector,
  adventurenessScore: number,
  ratingSkew: string,
  reviewDepth: string,
  avgReviewLength: number,
  reviews: ReviewWithAlbum[]
): { primary: string; secondary: string | null; confidence: number } {
  const scores: Record<string, number> = {}

  // Check behavioral archetypes first
  if (adventurenessScore > 0.75) {
    scores['genre-fluid'] = adventurenessScore
  }

  if (ratingSkew === 'harsh') {
    scores['the-critic'] = 0.8
  } else if (ratingSkew === 'lenient') {
    scores['the-enthusiast'] = 0.8
  }

  if (reviewDepth === 'essayist' || avgReviewLength > 150) {
    scores['essay-writer'] = 0.85
  }

  // Check decade obsession
  const decadeCount: Record<string, number> = {}
  for (const review of reviews) {
    const year = new Date(review.album.releaseDate).getFullYear()
    const decade = `${Math.floor(year / 10) * 10}s`
    decadeCount[decade] = (decadeCount[decade] || 0) + 1
  }
  const totalReviews = reviews.length
  for (const [decade, count] of Object.entries(decadeCount)) {
    if (count / totalReviews > 0.6) {
      scores['decade-diver'] = count / totalReviews
    }
  }

  // Check genre-based archetypes
  for (const [key, archetype] of Object.entries(ARCHETYPES)) {
    if ('behavioral' in archetype && archetype.behavioral) continue

    let matchScore = 0
    for (const genre of archetype.genres) {
      if (genreVector[genre]) {
        matchScore += genreVector[genre]
      }
    }
    if (archetype.genres.length > 0) {
      scores[archetype.id] = matchScore / archetype.genres.length
    }
  }

  // Sort and pick top 2
  const sorted = Object.entries(scores)
    .filter(([, score]) => score > 0.1)
    .sort((a, b) => b[1] - a[1])

  if (sorted.length === 0) {
    return { primary: 'genre-fluid', secondary: null, confidence: 0.5 }
  }

  return {
    primary: sorted[0][0],
    secondary: sorted[1]?.[0] || null,
    confidence: sorted[0][1],
  }
}

/**
 * Find signature albums that define user's taste
 */
function findSignatureAlbums(reviews: ReviewWithAlbum[]): string[] {
  // High rating + written review + not super mainstream
  return reviews
    .filter(r => r.rating >= 8 && r.text && r.text.length > 50)
    .filter(r => !r.album.averageRating || r.album.totalReviews < 100) // Not super mainstream
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5)
    .map(r => r.album.id)
}

/**
 * Compute Polarity Score - Bayesian edge strength from CCX
 * Measures how distinctive and confident the taste profile is
 */
function computePolarityScore(
  reviews: ReviewWithAlbum[],
  genreVector: GenreVector,
  adventurenessScore: number
): number {
  // Factors that contribute to Polarity Score:
  // 1. Review count (more data = more confident)
  const countFactor = Math.min(reviews.length / 50, 1) // Max out at 50 reviews

  // 2. Rating consistency (consistent raters have clearer preferences)
  const ratings = reviews.map(r => r.rating)
  const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length
  const variance = ratings.reduce((sum, r) => sum + Math.pow(r - avgRating, 2), 0) / ratings.length
  const consistencyFactor = 1 - Math.min(variance / 10, 1) // Lower variance = higher consistency

  // 3. Genre distinctiveness (focused taste = higher polarity)
  const distinctivenessFactor = 1 - adventurenessScore * 0.5 // Being focused gives higher score, but not penalize adventurous too much

  // 4. Engagement depth (written reviews = stronger signal)
  const writtenCount = reviews.filter(r => r.text && r.text.length > 50).length
  const engagementFactor = Math.min(writtenCount / reviews.length + 0.3, 1)

  // Combine with Bayesian-style weighting
  const polarityScore =
    countFactor * 0.3 +
    consistencyFactor * 0.25 +
    distinctivenessFactor * 0.25 +
    engagementFactor * 0.2

  return Math.round(polarityScore * 100) / 100
}

// ============================================
// MATCHING ENGINE
// ============================================

/**
 * Compute taste compatibility between two users
 */
export async function computeTasteMatch(
  userId1: string,
  userId2: string
): Promise<{
  overallScore: number
  genreOverlap: number
  artistOverlap: number
  ratingAlignment: number
  sharedGenres: string[]
  sharedArtists: string[]
  sharedAlbums: string[]
  matchType: string
} | null> {
  // Get both TasteIDs
  const [taste1, taste2] = await Promise.all([
    prisma.tasteID.findUnique({ where: { userId: userId1 } }),
    prisma.tasteID.findUnique({ where: { userId: userId2 } }),
  ])

  if (!taste1 || !taste2) return null

  const genre1 = taste1.genreVector as GenreVector
  const genre2 = taste2.genreVector as GenreVector

  // 1. Genre overlap (cosine similarity)
  const genreOverlap = computeCosineSimilarity(genre1, genre2)

  // 2. Artist overlap
  const artists1 = new Set(taste1.topArtists)
  const artists2 = new Set(taste2.topArtists)
  const sharedArtists = [...artists1].filter(a => artists2.has(a))
  const artistOverlap = sharedArtists.length / Math.max(artists1.size, artists2.size, 1)

  // 3. Rating alignment
  const ratingDiff = Math.abs(taste1.averageRating - taste2.averageRating)
  const ratingAlignment = Math.max(0, 1 - ratingDiff / 5)

  // 4. Shared genres (top overlap)
  const sharedGenres = taste1.topGenres.filter(g => taste2.topGenres.includes(g))

  // 5. Find shared highly-rated albums
  const reviews1 = await prisma.review.findMany({
    where: { userId: userId1, rating: { gte: 8 } },
    select: { albumId: true },
  })
  const reviews2 = await prisma.review.findMany({
    where: { userId: userId2, rating: { gte: 8 } },
    select: { albumId: true },
  })
  const albums1 = new Set(reviews1.map(r => r.albumId))
  const albums2 = new Set(reviews2.map(r => r.albumId))
  const sharedAlbums = [...albums1].filter(a => albums2.has(a)).slice(0, 10)

  // 6. Compute overall score
  const overallScore = Math.round(
    (genreOverlap * 40 + artistOverlap * 30 + ratingAlignment * 20 + (sharedAlbums.length / 10) * 10)
  )

  // 7. Determine match type
  let matchType = 'genre_buddy'
  if (overallScore > 80) {
    matchType = 'taste_twin'
  } else if (genreOverlap < 0.3 && artistOverlap < 0.2) {
    matchType = 'complementary'
  } else if (
    (taste1.adventurenessScore > 0.7 && taste2.adventurenessScore < 0.4) ||
    (taste2.adventurenessScore > 0.7 && taste1.adventurenessScore < 0.4)
  ) {
    matchType = 'explorer_guide'
  }

  return {
    overallScore,
    genreOverlap: Math.round(genreOverlap * 100),
    artistOverlap: Math.round(artistOverlap * 100),
    ratingAlignment: Math.round(ratingAlignment * 100),
    sharedGenres,
    sharedArtists,
    sharedAlbums,
    matchType,
  }
}

/**
 * Compute cosine similarity between two genre vectors
 */
function computeCosineSimilarity(vec1: GenreVector, vec2: GenreVector): number {
  const allGenres = new Set([...Object.keys(vec1), ...Object.keys(vec2)])

  let dotProduct = 0
  let norm1 = 0
  let norm2 = 0

  for (const genre of allGenres) {
    const v1 = vec1[genre] || 0
    const v2 = vec2[genre] || 0
    dotProduct += v1 * v2
    norm1 += v1 * v1
    norm2 += v2 * v2
  }

  if (norm1 === 0 || norm2 === 0) return 0
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2))
}

/**
 * Find users with similar taste
 */
export async function findSimilarTasters(
  userId: string,
  limit: number = 10
): Promise<Array<{
  userId: string
  username: string
  image: string | null
  compatibility: number
  sharedGenres: string[]
  archetype: string
}>> {
  const userTaste = await prisma.tasteID.findUnique({
    where: { userId },
    include: { user: { select: { id: true } } },
  })

  if (!userTaste) return []

  // Get all other TasteIDs
  const otherTastes = await prisma.tasteID.findMany({
    where: { userId: { not: userId } },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          image: true,
        },
      },
    },
    take: 100, // Sample for performance
  })

  const userGenres = userTaste.genreVector as GenreVector

  // Score each user
  const scored = otherTastes.map(taste => {
    const theirGenres = taste.genreVector as GenreVector
    const similarity = computeCosineSimilarity(userGenres, theirGenres)
    const sharedGenres = userTaste.topGenres.filter(g => taste.topGenres.includes(g))

    return {
      userId: taste.userId,
      username: taste.user.username || 'Unknown',
      image: taste.user.image,
      compatibility: Math.round(similarity * 100),
      sharedGenres,
      archetype: taste.primaryArchetype,
    }
  })

  return scored
    .sort((a, b) => b.compatibility - a.compatibility)
    .slice(0, limit)
}

// ============================================
// DATABASE OPERATIONS
// ============================================

/**
 * Save or update a user's TasteID
 */
export async function saveTasteID(userId: string, computation: TasteIDComputation) {
  return prisma.tasteID.upsert({
    where: { userId },
    create: {
      userId,
      genreVector: computation.genreVector as object,
      artistDNA: computation.artistDNA as unknown as object,
      decadePreferences: computation.decadePreferences as object,
      primaryArchetype: computation.primaryArchetype,
      secondaryArchetype: computation.secondaryArchetype,
      archetypeConfidence: computation.archetypeConfidence,
      adventurenessScore: computation.adventurenessScore,
      ratingSkew: computation.ratingSkew,
      averageRating: computation.averageRating,
      ratingStdDev: computation.ratingStdDev,
      reviewDepth: computation.reviewDepth,
      reviewCount: computation.reviewCount,
      avgReviewLength: computation.avgReviewLength,
      topGenres: computation.topGenres,
      topArtists: computation.topArtists,
      signatureAlbums: computation.signatureAlbums,
      polarityScore: computation.polarityScore,
    },
    update: {
      genreVector: computation.genreVector as object,
      artistDNA: computation.artistDNA as unknown as object,
      decadePreferences: computation.decadePreferences as object,
      primaryArchetype: computation.primaryArchetype,
      secondaryArchetype: computation.secondaryArchetype,
      archetypeConfidence: computation.archetypeConfidence,
      adventurenessScore: computation.adventurenessScore,
      ratingSkew: computation.ratingSkew,
      averageRating: computation.averageRating,
      ratingStdDev: computation.ratingStdDev,
      reviewDepth: computation.reviewDepth,
      reviewCount: computation.reviewCount,
      avgReviewLength: computation.avgReviewLength,
      topGenres: computation.topGenres,
      topArtists: computation.topArtists,
      signatureAlbums: computation.signatureAlbums,
      polarityScore: computation.polarityScore,
      lastComputedAt: new Date(),
    },
  })
}

/**
 * Create a monthly snapshot of TasteID
 */
export async function createTasteIDSnapshot(tasteId: string) {
  const taste = await prisma.tasteID.findUnique({ where: { id: tasteId } })
  if (!taste) return null

  const now = new Date()

  return prisma.tasteIDSnapshot.upsert({
    where: {
      tasteIdId_year_month: {
        tasteIdId: tasteId,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
      },
    },
    create: {
      tasteIdId: tasteId,
      genreVector: taste.genreVector as object,
      artistDNA: taste.artistDNA as object,
      primaryArchetype: taste.primaryArchetype,
      adventurenessScore: taste.adventurenessScore,
      reviewCount: taste.reviewCount,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    },
    update: {
      genreVector: taste.genreVector as object,
      artistDNA: taste.artistDNA as object,
      primaryArchetype: taste.primaryArchetype,
      adventurenessScore: taste.adventurenessScore,
      reviewCount: taste.reviewCount,
    },
  })
}

/**
 * Get archetype display info
 */
export function getArchetypeInfo(archetypeId: string) {
  const archetype = Object.values(ARCHETYPES).find(a => a.id === archetypeId)
  return archetype || {
    id: archetypeId,
    name: archetypeId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    description: 'Unique taste profile',
    genres: [],
    icon: '🎵',
  }
}
