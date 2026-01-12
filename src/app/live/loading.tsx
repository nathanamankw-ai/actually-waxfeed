export default function LiveLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="h-8 w-40 bg-[#222] rounded animate-pulse mb-2" />
        <div className="h-4 w-64 bg-[#1a1a1a] rounded animate-pulse" />
      </div>

      {/* Live Now */}
      <div className="mb-10">
        <div className="h-6 w-24 bg-[#222] rounded animate-pulse mb-4" />
        <div className="bg-[#111] border border-red-500/30 p-6 rounded">
          <div className="flex gap-4">
            <div className="w-32 h-32 bg-[#1a1a1a] rounded animate-pulse" />
            <div className="flex-1 space-y-3">
              <div className="h-5 w-48 bg-[#1a1a1a] rounded animate-pulse" />
              <div className="h-4 w-32 bg-[#1a1a1a] rounded animate-pulse" />
              <div className="h-3 w-24 bg-[#1a1a1a] rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-[#111] border border-[#222] p-4 rounded">
            <div className="h-4 w-3/4 bg-[#1a1a1a] rounded animate-pulse mb-2" />
            <div className="h-3 w-1/2 bg-[#1a1a1a] rounded animate-pulse mb-3" />
            <div className="h-3 w-1/3 bg-[#1a1a1a] rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
