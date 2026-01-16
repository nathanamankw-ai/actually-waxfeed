export function WaxfeedLogo({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: 24,
    md: 32,
    lg: 48,
  }

  const dimension = sizes[size]

  // Simplified vinyl disc logo - only the disc spins, not the whole thing
  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 100 100"
      className={className}
    >
      {/* Spinning disc */}
      <g className="animate-spin-slow origin-center">
        {/* Disc base - holographic gradient */}
        <defs>
          <linearGradient id="holoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e4a8c8"/>
            <stop offset="25%" stopColor="#98d8b8"/>
            <stop offset="50%" stopColor="#88c8d8"/>
            <stop offset="75%" stopColor="#b898d8"/>
            <stop offset="100%" stopColor="#e8c8d8"/>
          </linearGradient>
          <radialGradient id="discShine" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
          </radialGradient>
        </defs>

        {/* Main disc */}
        <circle cx="50" cy="50" r="45" fill="url(#holoGrad)"/>
        <circle cx="50" cy="50" r="45" fill="url(#discShine)"/>

        {/* Track grooves */}
        <circle cx="50" cy="50" r="40" fill="none" stroke="#00000015" strokeWidth="2"/>
        <circle cx="50" cy="50" r="35" fill="none" stroke="#00000010" strokeWidth="1.5"/>
        <circle cx="50" cy="50" r="30" fill="none" stroke="#00000015" strokeWidth="1"/>
        <circle cx="50" cy="50" r="25" fill="none" stroke="#00000010" strokeWidth="1"/>

        {/* Center hub */}
        <circle cx="50" cy="50" r="15" fill="#d0d0d0"/>
        <circle cx="50" cy="50" r="12" fill="#b0b0b0"/>
        <circle cx="50" cy="50" r="8" fill="#909090"/>
        <circle cx="50" cy="50" r="4" fill="#404040"/>

        {/* Hub highlight */}
        <ellipse cx="45" cy="45" rx="5" ry="3" fill="#ffffff" opacity="0.6" transform="rotate(-45 45 45)"/>
      </g>
    </svg>
  )
}
