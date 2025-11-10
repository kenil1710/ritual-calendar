'use client'

import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function AdminCheckPage() {
  const { user, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Status Check</h1>
          <p className="text-gray-600 mb-4">You need to be logged in to check admin status.</p>
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Go to Login →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Status Check</h1>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← Back to Events
          </Link>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Authentication Status</h2>
          <div className="space-y-4">
            <div>
              <span className="font-medium text-gray-700">Logged in as: </span>
              <span className="text-gray-900">{user.email}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">User ID: </span>
              <span className="text-gray-900 text-sm font-mono break-all">{user.id}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Admin Access: </span>
              <span className="font-bold text-green-600">
                {isAdmin ? 'YES ✓ (All logged-in users are admins)' : 'NO ✗'}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Access Control</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Simplified Authentication Model:</strong>
            </p>
            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
              <li>All users who can log in have admin privileges</li>
              <li>Only authenticated users can access the application</li>
              <li>You have full access to create, edit, and delete events</li>
              <li>No role management needed - if you're logged in, you're an admin</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Actions</h2>
          <div className="space-y-2">
            <Link
              href="/admin"
              className="block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
            >
              Go to Admin Panel
            </Link>
            <Link
              href="/"
              className="block px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-center"
            >
              View Events
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

