'use client'

import Link from 'next/link'

export default function Navigation() {
  return (
    <nav className="sticky top-0 z-40 border-b border-[rgba(255,123,27,0.18)] bg-[#0b0913]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-lg tracking-[0.32em] font-semibold text-white uppercase"
        >
          Calendar Events
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-[0.25em] text-white hover:bg-[rgba(33,28,45,0.65)] transition"
          >
            Events
          </Link>
          <Link
            href="/admin"
            className="px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-[0.25em] text-white hover:bg-[rgba(33,28,45,0.65)] transition"
          >
            Admin Panel
          </Link>
        </div>
      </div>
    </nav>
  )
}

