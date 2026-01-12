"use client"

export default function MessagesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="text-5xl mb-4">✉️</div>
      <h2 className="text-xl font-bold mb-2">Messages Unavailable</h2>
      <p className="text-[#888] mb-6">
        {error.message || "Failed to load messages. Please try again."}
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
