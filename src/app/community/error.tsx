"use client"

export default function CommunityError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <h2 className="text-xl font-bold mb-2">Community Unavailable</h2>
      <p className="text-gray-500 mb-6">
        {error.message || "Failed to load community. Please try again."}
      </p>
      <button
        onClick={() => reset()}
        className="bg-white text-black px-6 py-2 font-medium hover:bg-gray-100"
      >
        Retry
      </button>
    </div>
  )
}
