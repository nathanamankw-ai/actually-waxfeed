"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">💿</div>
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-[#888] mb-6">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="bg-white text-black px-6 py-2 font-medium hover:bg-gray-100 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="border border-[#333] px-6 py-2 font-medium hover:border-white transition-colors"
          >
            Go Home
          </Link>
        </div>
        {error.digest && (
          <p className="text-xs text-[#555] mt-4">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  )
}
