/**
 * Centralized TypeScript types for WaxFeed
 * Import types from this file to maintain consistency
 */

// ============================================
// USER TYPES
// ============================================

export interface User {
  id: string
  email: string
  username: string | null
  name: string | null
  image: string | null
  bio: string | null
  isVerified: boolean
  isPremium: boolean
  waxScore: number
  premiumWaxScore: number
  createdAt: Date
  updatedAt: Date
  // Presence
  lastSeenAt: Date
  isOnline: boolean
  // Streaks
  currentStreak: number
  longestStreak: number
}

export interface UserProfile extends User {
  socialLinks: SocialLinks | null
  friendCount?: number
  reviewCount?: number
  listCount?: number
}

export interface SocialLinks {
  instagram?: string
  twitter?: string
  spotify?: string
  soundcloud?: string
  website?: string
}

// ============================================
// ALBUM & MUSIC TYPES
// ============================================

export interface Album {
  id: string
  spotifyId: string
  title: string
  artistName: string
  artistSpotifyId: string | null
  releaseDate: Date
  coverArtUrl: string | null
  coverArtUrlSmall: string | null
  coverArtUrlMedium: string | null
  coverArtUrlLarge: string | null
  genres: string[]
  albumType: 'album' | 'single' | 'ep' | 'compilation'
  totalTracks: number
  spotifyUrl: string | null
  // Stats
  averageRating: number | null
  totalReviews: number
  totalRatings: number
  ratingDistribution: Record<string, number> | null
  // Billboard
  billboardRank: number | null
  billboardDate: Date | null
}

export interface Track {
  id: string
  spotifyId: string
  albumId: string
  name: string
  trackNumber: number
  discNumber: number
  durationMs: number
  previewUrl: string | null
  spotifyUrl: string | null
}

export interface Artist {
  id: string
  spotifyId: string
  name: string
  imageUrl: string | null
  genres: string[]
  popularity: number | null
}

// ============================================
// REVIEW TYPES
// ============================================

export interface Review {
  id: string
  userId: string
  albumId: string
  rating: number
  text: string | null
  isEdited: boolean
  createdAt: Date
  updatedAt: Date
  // Stats
  likeCount: number
  waxCount: number
  premiumWaxCount: number
  replyCount: number
  // Reactions
  fireCount: number
  insightfulCount: number
  funnyCount: number
  controversialCount: number
  // Relations (when included)
  user?: Pick<User, 'id' | 'username' | 'image' | 'isVerified'>
  album?: Pick<Album, 'id' | 'title' | 'artistName' | 'coverArtUrl'>
}

export type ReactionType = 'fire' | 'insightful' | 'funny' | 'controversial'

export interface Reply {
  id: string
  reviewId: string
  userId: string
  text: string
  isEdited: boolean
  createdAt: Date
  likeCount: number
  user?: Pick<User, 'id' | 'username' | 'image' | 'isVerified'>
}

// ============================================
// LIST TYPES
// ============================================

export interface List {
  id: string
  userId: string
  title: string
  description: string | null
  isRanked: boolean
  isPublic: boolean
  allowRemix: boolean
  createdAt: Date
  updatedAt: Date
  publishedAt: Date | null
  likeCount: number
  commentCount: number
  // Relations
  user?: Pick<User, 'id' | 'username' | 'image' | 'isVerified'>
  items?: ListItem[]
  _count?: { items: number }
}

export interface ListItem {
  id: string
  listId: string
  albumId: string
  position: number
  notes: string | null
  album?: Album
}

// ============================================
// MESSAGING TYPES
// ============================================

export interface Conversation {
  id: string
  type: 'direct' | 'group'
  name: string | null
  imageUrl: string | null
  updatedAt: Date
  participants: ConversationParticipant[]
  lastMessage: DirectMessage | null
  unreadCount?: number
  isMuted?: boolean
}

export interface ConversationParticipant {
  id: string
  userId: string
  role: 'admin' | 'member'
  lastReadAt: Date | null
  user?: Pick<User, 'id' | 'username' | 'image' | 'isVerified' | 'isOnline' | 'lastSeenAt'>
}

export interface DirectMessage {
  id: string
  conversationId: string
  userId: string
  content: string
  type: 'text' | 'image' | 'album'
  metadata: Record<string, unknown> | null
  isEdited: boolean
  isDeleted: boolean
  replyToId: string | null
  createdAt: Date
  updatedAt: Date
  // Relations
  user?: Pick<User, 'id' | 'username' | 'image'>
  reactions?: MessageReaction[]
  replyTo?: DirectMessage | null
}

export interface MessageReaction {
  id: string
  messageId: string
  userId: string
  emoji: string
  createdAt: Date
}

// ============================================
// CHANNEL TYPES
// ============================================

export interface Channel {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  category: 'genre' | 'artist' | 'event' | 'show' | 'release' | null
  type: 'public' | 'private'
  isArchived: boolean
  memberCount: number
  messageCount: number
  createdAt: Date
}

export interface ChannelMember {
  id: string
  channelId: string
  userId: string
  role: 'admin' | 'moderator' | 'member'
  joinedAt: Date
  lastReadAt: Date | null
  isMuted: boolean
  user?: Pick<User, 'id' | 'username' | 'image' | 'isVerified'>
}

export interface ChannelMessage {
  id: string
  channelId: string
  userId: string
  content: string
  type: 'text' | 'image' | 'album' | 'system'
  metadata: Record<string, unknown> | null
  isEdited: boolean
  isDeleted: boolean
  isPinned: boolean
  replyToId: string | null
  threadCount: number
  createdAt: Date
  // Relations
  user?: Pick<User, 'id' | 'username' | 'image' | 'isVerified'>
  reactions?: MessageReaction[]
}

// ============================================
// LIVE EVENT TYPES
// ============================================

export type EventType = 'dj_set' | 'listening_party' | 'interview' | 'podcast'
export type EventStatus = 'scheduled' | 'live' | 'ended' | 'cancelled'

export interface LiveEvent {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  type: EventType
  status: EventStatus
  streamUrl: string | null
  startTime: Date
  endTime: Date | null
  hostId: string | null
  attendeeCount: number
  messageCount: number
  createdAt: Date
  // Relations
  host?: Pick<User, 'id' | 'username' | 'image' | 'isVerified'>
  setlist?: SetlistItem[]
}

export interface SetlistItem {
  id: string
  eventId: string
  albumId: string | null
  trackName: string
  artistName: string
  position: number
  playedAt: Date | null
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType = 
  | 'reply' 
  | 'like' 
  | 'friend_request' 
  | 'friend_accept' 
  | 'friend_review' 
  | 'review_trending'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  content: Record<string, unknown>
  isRead: boolean
  createdAt: Date
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    offset: number
    limit: number
    hasMore: boolean
  }
}

// ============================================
// FORM TYPES
// ============================================

export interface ReviewFormData {
  rating: number
  text?: string
}

export interface ListFormData {
  title: string
  description?: string
  isRanked: boolean
  isPublic: boolean
  allowRemix: boolean
}

export interface ProfileFormData {
  username?: string
  name?: string
  bio?: string
  image?: string
  socialLinks?: SocialLinks
}
