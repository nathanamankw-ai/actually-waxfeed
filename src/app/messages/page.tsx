'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ConversationList } from '@/components/messaging/ConversationList'

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [totalUnread, setTotalUnread] = useState(0)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/messages')
    }
  }, [status, router])

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/messages/unread')
        const data = await res.json()
        if (data.success) {
          setTotalUnread(data.data.unreadCount)
        }
      } catch {
        // Silent fail
      }
    }
    if (session) {
      fetchUnread()
    }
  }, [session])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[--muted] border-t-[#ffd700] animate-spin" />
          <span className="text-xs tracking-[0.2em] uppercase text-[--muted]">Loading messages</span>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen">
      <div className="w-full px-4 lg:px-12 xl:px-20">
        {/* Header */}
        <div className="px-6 pt-10 pb-8 border-b border-[--border] animate-fade-in">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 bg-[#ffd700]" />
                <span className="text-[10px] tracking-[0.3em] uppercase text-[--muted]">Direct Messages</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Messages</h1>
              <p className="text-sm text-[--muted] leading-relaxed max-w-md">
                Private conversations with taste-matched users · Minimum 60% compatibility required
              </p>
            </div>
            {totalUnread > 0 && (
              <div className="flex-shrink-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
                <div className="px-4 py-2 bg-[#ffd700] text-black">
                  <span className="text-2xl font-bold tabular-nums">{totalUnread}</span>
                  <span className="text-[10px] tracking-wider uppercase ml-2 opacity-80">unread</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info banner */}
        <div className="p-5 bg-gradient-to-r from-[#ffd700]/5 to-transparent border-b border-[--border] animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 flex items-center justify-center border border-[#ffd700]/30 bg-[#ffd700]/10 flex-shrink-0">
              <svg className="w-5 h-5 text-[#ffd700]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-sm mb-1">Taste-Gated Messaging</p>
              <p className="text-sm text-[--muted] leading-relaxed">
                Only users with 60%+ taste compatibility can message each other.
                Every conversation starts with genuine common ground.
              </p>
              <Link
                href="/discover/similar-tasters"
                className="inline-flex items-center gap-2 text-sm text-[#ffd700] hover:underline mt-3 group"
              >
                <span>Find people who share your taste</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Conversation List */}
        <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <ConversationList />
        </div>
      </div>
    </div>
  )
}
