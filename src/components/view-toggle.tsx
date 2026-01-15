"use client"

interface ViewToggleProps {
  view: "list" | "grid"
  onChange: (view: "list" | "grid") => void
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center justify-center gap-3 text-sm">
      <button
        onClick={() => onChange("list")}
        className={`transition-colors ${
          view === "list" ? "text-white" : "text-gray-400 hover:text-gray-500"
        }`}
      >
        List
      </button>
      <span className="text-[#333]">|</span>
      <button
        onClick={() => onChange("grid")}
        className={`transition-colors ${
          view === "grid" ? "text-white" : "text-gray-400 hover:text-gray-500"
        }`}
      >
        Grid
      </button>
    </div>
  )
}
