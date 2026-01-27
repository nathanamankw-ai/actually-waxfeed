"use client"

import { 
  getCurrentTier, 
  getProgressToNextTier, 
  TASTEID_TIERS 
} from "@/lib/tasteid-tiers"

interface TierProgressProps {
  ratingCount: number
  variant?: 'compact' | 'full' | 'inline' | 'steps'
  showMilestones?: boolean
  className?: string
}

export function TierProgress({ 
  ratingCount, 
  variant = 'compact',
  showMilestones = false,
  className = ''
}: TierProgressProps) {
  const { progress, ratingsToNext, currentTier, nextTier } = getProgressToNextTier(ratingCount)
  const tiers = TASTEID_TIERS.slice(1) // Skip 'locked'
  
  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-xs font-bold" style={{ color: currentTier.color }}>
          {currentTier.name}
        </span>
        <div className="flex-1 h-1.5 bg-[#222] rounded-full overflow-hidden max-w-[100px]">
          <div 
            className="h-full transition-all duration-500"
            style={{ 
              width: `${progress}%`,
              backgroundColor: nextTier?.color || currentTier.color 
            }}
          />
        </div>
        {nextTier && (
          <span className="text-[10px] text-[#666]">
            {ratingsToNext} to {nextTier.name}
          </span>
        )}
      </div>
    )
  }
  
  if (variant === 'steps') {
    return (
      <div className={className}>
        {/* Step progress indicator */}
        <div className="flex items-center justify-between mb-2">
          {tiers.map((tier, index) => {
            const isCompleted = ratingCount >= tier.minRatings
            const isCurrent = tier.id === currentTier.id
            const isLast = index === tiers.length - 1
            
            return (
              <div key={tier.id} className="flex items-center flex-1">
                {/* Step circle */}
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      isCompleted ? 'text-black' : 'text-[#666]'
                    }`}
                    style={{ 
                      backgroundColor: isCompleted ? tier.color : 'transparent',
                      borderColor: isCompleted || isCurrent ? tier.color : '#333'
                    }}
                  >
                    {isCompleted ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      tier.shortName
                    )}
                  </div>
                  <span 
                    className={`text-[9px] mt-1 uppercase tracking-wider ${isCurrent ? 'font-bold' : ''}`}
                    style={{ color: isCompleted || isCurrent ? tier.color : '#555' }}
                  >
                    {tier.name}
                  </span>
                </div>
                
                {/* Connecting line */}
                {!isLast && (
                  <div className="flex-1 h-0.5 mx-2 mt-[-16px]">
                    <div 
                      className="h-full transition-all duration-500"
                      style={{ 
                        backgroundColor: isCompleted ? tier.color : '#333'
                      }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        {/* Progress text */}
        <div className="flex justify-between text-xs text-[#666] mt-3">
          <span>{ratingCount} ratings</span>
          {nextTier && (
            <span>
              <span className="font-bold text-white">{ratingsToNext}</span> to {nextTier.name}
            </span>
          )}
        </div>
      </div>
    )
  }
  
  if (variant === 'compact') {
    return (
      <div className={`p-3 border border-[#333] bg-[#111] ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-black"
              style={{ backgroundColor: currentTier.color }}
            >
              {currentTier.shortName}
            </div>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: currentTier.color }}>
              {currentTier.name}
            </span>
            <span className="text-[10px] text-[#666]">{currentTier.maxConfidence}%</span>
          </div>
          {nextTier && (
            <span className="text-[10px] text-[#888]">
              {ratingsToNext} to {nextTier.name}
            </span>
          )}
        </div>
        
        {/* Segmented bar */}
        <div className="flex gap-0.5 h-2">
          {tiers.map((tier) => {
            const isCompleted = ratingCount >= tier.minRatings
            const isCurrent = tier.id === currentTier.id
            
            let fillPercent = 0
            if (isCompleted && !isCurrent) fillPercent = 100
            else if (isCurrent) fillPercent = progress
            
            return (
              <div 
                key={tier.id}
                className="flex-1 bg-[#222] rounded-sm overflow-hidden"
                title={`${tier.name}: ${tier.minRatings}+ ratings`}
              >
                <div 
                  className="h-full transition-all duration-500"
                  style={{ 
                    width: `${fillPercent}%`,
                    backgroundColor: tier.color
                  }}
                />
              </div>
            )
          })}
        </div>
        
        {/* Tier labels */}
        <div className="flex justify-between mt-1.5">
          {tiers.map((tier) => {
            const isCompleted = ratingCount >= tier.minRatings
            const isCurrent = tier.id === currentTier.id
            return (
              <span 
                key={tier.id}
                className={`text-[8px] uppercase tracking-wider ${isCurrent ? 'font-bold' : ''}`}
                style={{ 
                  color: isCompleted || isCurrent ? tier.color : '#444',
                  width: `${100 / tiers.length}%`,
                  textAlign: 'center'
                }}
              >
                {tier.shortName}
              </span>
            )
          })}
        </div>
      </div>
    )
  }
  
  // Full variant
  return (
    <div className={`p-4 border border-[#333] bg-[#111] ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-black"
          style={{ backgroundColor: currentTier.color }}
        >
          {currentTier.shortName}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider" style={{ color: currentTier.color }}>
              {currentTier.name}
            </span>
            <span className="text-xs px-2 py-0.5 border border-[#444] text-[#888]">
              {currentTier.maxConfidence}% accuracy
            </span>
          </div>
          <p className="text-xs text-[#888] mt-0.5">{currentTier.description}</p>
        </div>
      </div>
      
      {/* Segmented progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] text-[#666] mb-1">
          <span>{ratingCount} ratings</span>
          {nextTier && <span>{nextTier.minRatings} for {nextTier.name}</span>}
        </div>
        
        <div className="flex gap-1 h-3">
          {tiers.map((tier) => {
            const isCompleted = ratingCount >= tier.minRatings
            const isCurrent = tier.id === currentTier.id
            
            let fillPercent = 0
            if (isCompleted && !isCurrent) fillPercent = 100
            else if (isCurrent) fillPercent = progress
            
            return (
              <div 
                key={tier.id}
                className="flex-1 bg-[#222] rounded-sm overflow-hidden"
                title={`${tier.name}: ${tier.minRatings}+ ratings`}
              >
                <div 
                  className="h-full transition-all duration-500"
                  style={{ 
                    width: `${fillPercent}%`,
                    backgroundColor: tier.color
                  }}
                />
              </div>
            )
          })}
        </div>
        
        {/* Tier labels with checkmarks */}
        <div className="flex justify-between mt-2">
          {tiers.map((tier) => {
            const isCompleted = ratingCount >= tier.minRatings
            const isCurrent = tier.id === currentTier.id
            
            return (
              <div 
                key={tier.id}
                className="flex flex-col items-center"
                style={{ width: `${100 / tiers.length}%` }}
              >
                <div 
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${
                    isCompleted ? 'text-black' : 'text-[#666]'
                  }`}
                  style={{ 
                    backgroundColor: isCompleted ? tier.color : 'transparent',
                    borderColor: isCompleted || isCurrent ? tier.color : '#333'
                  }}
                >
                  {isCompleted ? '✓' : tier.shortName}
                </div>
                <span 
                  className={`text-[9px] mt-1 uppercase tracking-wider ${isCurrent ? 'font-bold' : ''}`}
                  style={{ color: isCompleted || isCurrent ? tier.color : '#555' }}
                >
                  {tier.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Next tier preview */}
      {nextTier && (
        <div className="flex items-center gap-3 p-3 bg-[#0a0a0a] border border-[#222]">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black opacity-50"
            style={{ backgroundColor: nextTier.color }}
          >
            {nextTier.shortName}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#666]">
                NEXT: {nextTier.name}
              </span>
              <span className="text-[10px] text-[#555]">{ratingsToNext} ratings away</span>
            </div>
            <p className="text-[10px] text-[#555] mt-0.5">
              Unlocks: {nextTier.perks.slice(0, 2).join(', ')}
            </p>
          </div>
          <div 
            className="text-lg font-bold"
            style={{ color: nextTier.color }}
          >
            {Math.round(progress)}%
          </div>
        </div>
      )}
    </div>
  )
}

// Mini progress ring for headers/compact spaces
export function TierProgressRing({ 
  ratingCount, 
  size = 32,
  className = '' 
}: { 
  ratingCount: number
  size?: number
  className?: string
}) {
  const { progress, currentTier, nextTier } = getProgressToNextTier(ratingCount)
  const strokeWidth = size / 8
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference
  
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#333"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={nextTier?.color || currentTier.color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <span 
        className="absolute text-xs font-bold"
        style={{ fontSize: size / 3, color: currentTier.color }}
      >
        {currentTier.shortName}
      </span>
    </div>
  )
}
