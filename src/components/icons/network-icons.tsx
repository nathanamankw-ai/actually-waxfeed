"use client"

/**
 * Custom Network Icons - No emojis, pure SVG
 * Designed for the Polarity taste matching system
 */

interface IconProps {
  size?: number
  className?: string
  color?: string
}

// Discovery - Compass/explore icon
export function DiscoveryIcon({ size = 20, className = "", color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
      <path
        d="M12 2v2M12 20v2M2 12h2M20 12h2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"
        fill={color}
        fillOpacity="0.2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2" fill={color} />
    </svg>
  )
}

// Comfort - Home/shelter icon
export function ComfortIcon({ size = 20, className = "", color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3 10.5L12 3l9 7.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 20v-6a1 1 0 011-1h4a1 1 0 011 1v6"
        stroke={color}
        strokeWidth="1.5"
        fill={color}
        fillOpacity="0.15"
      />
    </svg>
  )
}

// Deep Dive - Layers/depth icon
export function DeepDiveIcon({ size = 20, className = "", color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3v18"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="2 3"
      />
      <rect x="4" y="5" width="16" height="4" rx="1" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.3" />
      <rect x="6" y="11" width="12" height="4" rx="1" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.2" />
      <rect x="8" y="17" width="8" height="3" rx="1" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.1" />
    </svg>
  )
}

// Reactive - Lightning/pulse icon
export function ReactiveIcon({ size = 20, className = "", color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"
        fill={color}
        fillOpacity="0.2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Emotional - Heart wave icon
export function EmotionalIcon({ size = 20, className = "", color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={color}
        fillOpacity="0.15"
        stroke={color}
        strokeWidth="1.5"
      />
      <path
        d="M6 12h3l1.5-3 2 6 1.5-3h4"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Social - Connected nodes icon
export function SocialIcon({ size = 20, className = "", color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="5" r="3" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.2" />
      <circle cx="5" cy="18" r="3" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.2" />
      <circle cx="19" cy="18" r="3" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.2" />
      <path
        d="M12 8v4M9 14l-2 2M15 14l2 2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="14" r="2" fill={color} />
    </svg>
  )
}

// Aesthetic - Eye/vision icon
export function AestheticIcon({ size = 20, className = "", color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"
        fill={color}
        fillOpacity="0.1"
        stroke={color}
        strokeWidth="1.5"
      />
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.3" />
      <circle cx="12" cy="12" r="1" fill={color} />
    </svg>
  )
}

// Match Type Icons

// Taste Twin - Mirror/reflection
export function TasteTwinIcon({ size = 20, className = "", color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="8" cy="10" r="5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.2" />
      <circle cx="16" cy="10" r="5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.2" />
      <path
        d="M12 5v14"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="2 2"
      />
      <circle cx="8" cy="10" r="1.5" fill={color} />
      <circle cx="16" cy="10" r="1.5" fill={color} />
    </svg>
  )
}

// Opposite Attracts - Yin yang style
export function OppositeAttractsIcon({ size = 20, className = "", color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
      <path
        d="M12 2a10 10 0 010 20 5 5 0 010-10 5 5 0 000-10z"
        fill={color}
        fillOpacity="0.3"
      />
      <circle cx="12" cy="7" r="2" fill={color} />
      <circle cx="12" cy="17" r="2" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

// Explorer Guide - Path/trail
export function ExplorerGuideIcon({ size = 20, className = "", color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3 17l6-6 4 4 8-8"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 7h7v7"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="3" cy="17" r="2" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1" />
      <circle cx="21" cy="7" r="2" fill={color} stroke={color} strokeWidth="1" />
    </svg>
  )
}

// Network Resonance - Wave interference
export function NetworkResonanceIcon({ size = 20, className = "", color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="7" cy="12" r="5" stroke={color} strokeWidth="1.5" strokeOpacity="0.5" />
      <circle cx="7" cy="12" r="3" stroke={color} strokeWidth="1.5" strokeOpacity="0.7" />
      <circle cx="17" cy="12" r="5" stroke={color} strokeWidth="1.5" strokeOpacity="0.5" />
      <circle cx="17" cy="12" r="3" stroke={color} strokeWidth="1.5" strokeOpacity="0.7" />
      <ellipse cx="12" cy="12" rx="2" ry="4" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

// Genre Buddy - Music note duo
export function GenreBuddyIcon({ size = 20, className = "", color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="7" cy="18" r="3" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1.5" />
      <circle cx="17" cy="16" r="3" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1.5" />
      <path d="M10 18V6l10-2v12" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 10l10-2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// Complementary - Puzzle pieces
export function ComplementaryIcon({ size = 20, className = "", color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 8h4v-2a2 2 0 114 0v2h4v4h2a2 2 0 110 4h-2v4H4V8z"
        fill={color}
        fillOpacity="0.15"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M20 8h-4v-2a2 2 0 10-4 0"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.5"
      />
    </svg>
  )
}

// Challenge Icons

// Battle/Versus
export function ChallengeIcon({ size = 20, className = "", color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M6 4l-2 2 6 6-6 6 2 2 8-8-8-8z"
        fill={color}
        fillOpacity="0.3"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M18 4l2 2-6 6 6 6-2 2-8-8 8-8z"
        fill={color}
        fillOpacity="0.15"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Discover Together - Binoculars
export function DiscoverTogetherIcon({ size = 20, className = "", color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="6" cy="14" r="4" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.2" />
      <circle cx="18" cy="14" r="4" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.2" />
      <path d="M10 14h4" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M6 10V6M18 10V6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="6" cy="14" r="1.5" fill={color} />
      <circle cx="18" cy="14" r="1.5" fill={color} />
    </svg>
  )
}

// Genre Swap - Refresh/exchange
export function GenreSwapIcon({ size = 20, className = "", color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 12a8 8 0 0114-5.3"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M20 12a8 8 0 01-14 5.3"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M14 4l4 3-4 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={color} fillOpacity="0.2" />
      <path d="M10 20l-4-3 4-3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={color} fillOpacity="0.2" />
    </svg>
  )
}

// Decade Dive - Calendar/timeline
export function DecadeDiveIcon({ size = 20, className = "", color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="1.5" />
      <path d="M3 10h18" stroke={color} strokeWidth="1.5" />
      <path d="M8 2v4M16 2v4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <rect x="6" y="13" width="4" height="3" rx="0.5" fill={color} fillOpacity="0.3" />
      <rect x="14" y="13" width="4" height="3" rx="0.5" fill={color} fillOpacity="0.5" />
      <rect x="6" y="17" width="4" height="3" rx="0.5" fill={color} fillOpacity="0.2" />
    </svg>
  )
}

// Rate Same Album - Target
export function RateSameAlbumIcon({ size = 20, className = "", color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
      <circle cx="12" cy="12" r="6" stroke={color} strokeWidth="1.5" strokeOpacity="0.7" />
      <circle cx="12" cy="12" r="2" fill={color} />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// BrainID/Cognitive icons

// Brain network
export function BrainNetworkIcon({ size = 20, className = "", color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <ellipse cx="12" cy="12" rx="9" ry="8" stroke={color} strokeWidth="1.5" />
      <path
        d="M12 4c-2 2-3 4-3 8s1 6 3 8"
        stroke={color}
        strokeWidth="1.5"
        strokeOpacity="0.6"
      />
      <path
        d="M12 4c2 2 3 4 3 8s-1 6-3 8"
        stroke={color}
        strokeWidth="1.5"
        strokeOpacity="0.6"
      />
      <ellipse cx="12" cy="12" rx="9" ry="3" stroke={color} strokeWidth="1.5" strokeOpacity="0.5" />
      <circle cx="7" cy="10" r="1.5" fill={color} />
      <circle cx="17" cy="10" r="1.5" fill={color} />
      <circle cx="12" cy="7" r="1.5" fill={color} />
      <circle cx="10" cy="15" r="1.5" fill={color} fillOpacity="0.7" />
      <circle cx="14" cy="15" r="1.5" fill={color} fillOpacity="0.7" />
    </svg>
  )
}

// Listening session - Headphones with wave
export function ListeningSessionIcon({ size = 20, className = "", color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 15v-3a8 8 0 1116 0v3"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect x="2" y="14" width="4" height="6" rx="1" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1.5" />
      <rect x="18" y="14" width="4" height="6" rx="1" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1.5" />
      <path
        d="M9 12h1.5l1 -2 1 4 1-2H15"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Lock/Paywall
export function LockIcon({ size = 20, className = "", color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4" y="10" width="16" height="12" rx="2" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.5" />
      <path
        d="M8 10V7a4 4 0 118 0v3"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16" r="2" fill={color} />
    </svg>
  )
}

// Export all icons mapping
export const NETWORK_ICONS = {
  discovery: DiscoveryIcon,
  comfort: ComfortIcon,
  deep_dive: DeepDiveIcon,
  reactive: ReactiveIcon,
  emotional: EmotionalIcon,
  social: SocialIcon,
  aesthetic: AestheticIcon,
}

export const MATCH_TYPE_ICONS = {
  taste_twin: TasteTwinIcon,
  opposite_attracts: OppositeAttractsIcon,
  explorer_guide: ExplorerGuideIcon,
  network_resonance: NetworkResonanceIcon,
  genre_buddy: GenreBuddyIcon,
  complementary: ComplementaryIcon,
}

export const CHALLENGE_TYPE_ICONS = {
  discover_together: DiscoverTogetherIcon,
  rate_same_album: RateSameAlbumIcon,
  genre_swap: GenreSwapIcon,
  decade_dive: DecadeDiveIcon,
}
