"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="bg-black text-white">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">💥</div>
            <h2 className="text-2xl font-bold mb-2">Critical Error</h2>
            <p className="text-gray-400 mb-6">
              Something went seriously wrong. Please refresh the page.
            </p>
            <button
              onClick={() => reset()}
              className="bg-white text-black px-6 py-2 font-medium hover:bg-gray-100 transition-colors"
            >
              Refresh Page
            </button>
            {error.digest && (
              <p className="text-xs text-gray-600 mt-4">Error ID: {error.digest}</p>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}
