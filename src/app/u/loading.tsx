export default function ProfileLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 pb-8 border-b border-gray-200">
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 animate-pulse" />
        <div className="flex-1 text-center sm:text-left space-y-3">
          <div className="h-8 w-40 bg-gray-200 animate-pulse mx-auto sm:mx-0" />
          <div className="h-4 w-24 bg-gray-200 animate-pulse mx-auto sm:mx-0" />
          <div className="h-3 w-64 bg-gray-200 animate-pulse mx-auto sm:mx-0" />
          <div className="flex gap-6 justify-center sm:justify-start">
            <div className="h-4 w-16 bg-gray-200 animate-pulse" />
            <div className="h-4 w-16 bg-gray-200 animate-pulse" />
            <div className="h-4 w-16 bg-gray-200 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Reviews skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-gray-50 border border-gray-200 p-4 rounded">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-gray-200 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-gray-200 animate-pulse" />
                <div className="h-3 w-32 bg-gray-200 animate-pulse" />
                <div className="h-3 w-full bg-gray-200 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
