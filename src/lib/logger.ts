/**
 * Centralized logging utility
 * In production, these could be replaced with a proper logging service
 * like Sentry, LogRocket, or Datadog
 */

const isDev = process.env.NODE_ENV === "development"

export const logger = {
  /**
   * Debug messages - only in development
   */
  debug: (...args: unknown[]) => {
    if (isDev) {
      console.log("[DEBUG]", ...args)
    }
  },

  /**
   * Info messages - only in development
   */
  info: (...args: unknown[]) => {
    if (isDev) {
      console.info("[INFO]", ...args)
    }
  },

  /**
   * Warning messages - always logged
   */
  warn: (...args: unknown[]) => {
    console.warn("[WARN]", ...args)
  },

  /**
   * Error messages - always logged
   * In production, these should be sent to an error tracking service
   */
  error: (message: string, error?: unknown) => {
    console.error("[ERROR]", message, error)
    
    // TODO: In production, send to error tracking service
    // if (!isDev && typeof window !== "undefined") {
    //   Sentry.captureException(error, { extra: { message } })
    // }
  },

  /**
   * API request logging - only in development
   */
  api: (method: string, path: string, status?: number) => {
    if (isDev) {
      const statusColor = status && status >= 400 ? "🔴" : "🟢"
      console.log(`[API] ${method} ${path} ${status ? `${statusColor} ${status}` : ""}`)
    }
  },
}

export default logger
