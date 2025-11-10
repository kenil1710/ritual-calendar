'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { usePathname, useRouter } from 'next/navigation'

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false 
}: { 
  children: React.ReactNode
  requireAdmin?: boolean 
}) {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading) {
      const redirectParam = pathname ? `?redirect=${encodeURIComponent(pathname)}` : ''
      if (!user) {
        router.push(`/login${redirectParam}`)
        return
      }
      if (requireAdmin && !isAdmin) {
        router.push(`/login${redirectParam}`)
        return
      }
    }
  }, [user, loading, isAdmin, requireAdmin, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (requireAdmin && !isAdmin) {
    return null
  }

  return <>{children}</>
}

