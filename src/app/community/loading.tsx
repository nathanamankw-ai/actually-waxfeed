export default function CommunityLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="h-8 w-48 bg-gray-200 animate-pulse mb-2" />
        <div className="h-4 w-64 bg-gray-200 animate-pulse" />
      </div>

      {/* Live events skeleton */}
      <div className="mb-8">
        <div className="h-6 w-32 bg-gray-200 animate-pulse mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-gray-50 border border-gray-200 p-4 rounded">
              <div className="h-4 w-3/4 bg-gray-200 animate-pulse mb-2" />
              <div className="h-3 w-1/2 bg-gray-200 animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Channels skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-gray-50 border border-gray-200 p-4 rounded">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-200 animate-pulse" />
              <div className="flex-1">
                <div className="h-4 w-24 bg-gray-200 animate-pulse mb-1" />
                <div className="h-3 w-16 bg-gray-200 animate-pulse" />
              </div>
            </div>
            <div className="h-3 w-full bg-gray-200 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
