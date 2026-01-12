"use client"

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ")
}

export type AccountType = "user" | "artist" | "org" | "editor" | "dj" | "staff"

interface RoleBadgeProps {
  accountType: AccountType
  isVerified?: boolean
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
  customColor?: string | null
}

const ROLE_CONFIG: Record<AccountType, { icon: string; label: string; color: string; bgColor: string }> = {
  user: {
    icon: "👤",
    label: "User",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
  artist: {
    icon: "🎵",
    label: "Artist",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  org: {
    icon: "🏢",
    label: "Organization",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  editor: {
    icon: "✍️",
    label: "Editor",
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  dj: {
    icon: "🎧",
    label: "DJ",
    color: "text-pink-600",
    bgColor: "bg-pink-100",
  },
  staff: {
    icon: "⭐",
    label: "Staff",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
}

const SIZE_CLASSES = {
  sm: "text-xs px-1.5 py-0.5 gap-0.5",
  md: "text-sm px-2 py-1 gap-1",
  lg: "text-base px-3 py-1.5 gap-1.5",
}

export function RoleBadge({
  accountType,
  isVerified = false,
  showLabel = true,
  size = "sm",
  className,
  customColor,
}: RoleBadgeProps) {
  const config = ROLE_CONFIG[accountType] || ROLE_CONFIG.user
  
  // Don't show badge for regular users unless verified
  if (accountType === "user" && !isVerified) {
    return null
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        SIZE_CLASSES[size],
        config.bgColor,
        config.color,
        className
      )}
      style={customColor ? { backgroundColor: `${customColor}20`, color: customColor } : undefined}
    >
      <span>{config.icon}</span>
      {showLabel && <span>{config.label}</span>}
      {isVerified && (
        <svg
          className="w-3 h-3 ml-0.5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </span>
  )
}

// Verified checkmark only (for inline use)
export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span title="Verified">
      <svg
        className={cn("w-4 h-4 text-blue-500 inline-block", className)}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  )
}

// Combined username + badges display
interface UserBadgesProps {
  username: string
  accountType?: AccountType
  isVerified?: boolean
  showRoleLabel?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function UserWithBadges({
  username,
  accountType = "user",
  isVerified = false,
  showRoleLabel = false,
  size = "sm",
  className,
}: UserBadgesProps) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="font-medium">{username}</span>
      {isVerified && <VerifiedBadge />}
      <RoleBadge
        accountType={accountType}
        isVerified={false} // Don't show checkmark twice
        showLabel={showRoleLabel}
        size={size}
      />
    </span>
  )
}
