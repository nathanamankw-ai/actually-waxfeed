/**
 * Centralized lib exports for WaxFeed
 * Import utilities from this file for consistency
 */

// Core utilities
export { prisma } from './prisma'
export { auth, handlers, signIn, signOut } from './auth'

// API helpers
export {
  successResponse,
  errorResponse,
  getAuthenticatedUser,
  requireAuth,
  isBlocked,
  areFriends,
  updateAlbumStats,
  createNotification,
  getPagination,
  type ApiResponse,
} from './api-utils'

// Rate limiting
export {
  checkRateLimit,
  getClientIp,
  rateLimits,
  rateLimitResponse,
  type RateLimitConfig,
} from './rate-limit'

// Logging
export { logger } from './logger'

// Spotify integration
export {
  searchAlbums as searchSpotifyAlbums,
  getAlbum as getSpotifyAlbum,
  importAlbumToDatabase as importAlbumFromSpotify,
  bulkImportAlbums,
  searchAndImportAlbums,
  cleanupExpiredCache,
} from './spotify'

// Album description fetching
export {
  fetchAlbumDescription,
  type AlbumDescriptionResult,
} from './album-description'
