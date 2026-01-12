export default function MessagesLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="h-8 w-32 bg-[#222] rounded animate-pulse mb-6" />
      
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-[#111] border border-[#222] p-4 rounded flex gap-3">
            <div className="w-12 h-12 bg-[#1a1a1a] rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-[#1a1a1a] rounded animate-pulse" />
              <div className="h-3 w-48 bg-[#1a1a1a] rounded animate-pulse" />
            </div>
            <div className="h-3 w-12 bg-[#1a1a1a] rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
