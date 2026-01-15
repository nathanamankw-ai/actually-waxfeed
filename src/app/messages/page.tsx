import Link from "next/link"

export default function MessagesPage() {
  return (
    <div className="flex-1 flex items-center justify-center bg-white">
      <div className="text-center max-w-md px-4">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>

        {/* Text */}
        <h2 className="text-xl font-bold mb-2">"SELECT A CONVERSATION"</h2>
        <p className="text-sm text-gray-500 mb-6">
          Choose an existing conversation from the sidebar or start a new one.
        </p>

        {/* CTA */}
        <Link
          href="/messages/new"
          className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 text-sm font-bold no-underline hover:bg-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          START NEW CONVERSATION
        </Link>

        {/* Keyboard shortcuts hint */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-[10px] tracking-[0.2em] text-gray-400 mb-3">KEYBOARD SHORTCUTS</p>
          <div className="flex justify-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 font-mono">⌘</kbd>
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 font-mono">K</kbd>
              <span>Search</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 font-mono">⌘</kbd>
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 font-mono">N</kbd>
              <span>New Message</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
