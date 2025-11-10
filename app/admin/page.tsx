'use client'

import { useState } from 'react'
import { supabase, CalendarEvent } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import ProtectedRoute from '@/components/ProtectedRoute'

function AdminPanelContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState<Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>>({
    title: '',
    description: '',
    start_date: '',
    location: '',
    is_recurring: false,
    recurrence_type: null,
    recurrence_interval: 1,
  })

  const [startDate, setStartDate] = useState<Date | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    if (!formData.title || !startDate) {
      setError('Please fill in all required fields (Title, Date)')
      setLoading(false)
      return
    }

    if (formData.is_recurring && !formData.recurrence_type) {
      setError('Please select a recurrence type for recurring events')
      setLoading(false)
      return
    }

    try {
      const eventData: any = {
        title: formData.title,
        description: formData.description || null,
        start_date: startDate.toISOString(),
        location: formData.location || null,
        is_recurring: formData.is_recurring || false,
        recurrence_type: formData.is_recurring ? formData.recurrence_type : null,
        recurrence_interval: formData.is_recurring ? (formData.recurrence_interval || 1) : null,
      }

      const { error: insertError } = await supabase
        .from('calendar_events')
        .insert([eventData])

      if (insertError) throw insertError

      setSuccess(true)
      setFormData({
        title: '',
        description: '',
        start_date: '',
        location: '',
        is_recurring: false,
        recurrence_type: null,
        recurrence_interval: 1,
      })
      setStartDate(null)

      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to create event')
      console.error('Error creating event:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white">
      <h1 className="text-3xl font-bold mb-8">Admin Panel - Add Event</h1>

      {error && (
        <div className="bg-red-900/60 border border-red-700/60 text-red-100 px-4 py-3 rounded mb-6">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-emerald-900/60 border border-emerald-700/60 text-emerald-100 px-4 py-3 rounded mb-6">
          <p className="font-bold">Success!</p>
          <p>Event created successfully. Redirecting to events page...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[rgba(12,26,20,0.9)] border border-[rgba(88,243,153,0.18)] rounded-2xl shadow-lg p-6 space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Title <span className="text-[var(--accent)]">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 bg-[#0c1914] border border-[rgba(88,243,153,0.25)] text-white rounded-md shadow-sm focus:outline-none focus:ring-[var(--accent)] focus:border-[var(--accent)]"
            required
            placeholder="Enter event title"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 bg-[#0c1914] border border-[rgba(88,243,153,0.25)] text-white rounded-md shadow-sm focus:outline-none focus:ring-[var(--accent)] focus:border-[var(--accent)]"
            placeholder="Enter event description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Date & Time <span className="text-[var(--accent)]">*</span>
          </label>
          <DatePicker
            selected={startDate}
            onChange={(date: Date | null) => setStartDate(date)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={5}
            dateFormat="MMMM d, yyyy h:mm aa"
            className="w-full px-3 py-2 bg-[#0c1914] border border-[rgba(88,243,153,0.25)] text-white rounded-md shadow-sm focus:outline-none focus:ring-[var(--accent)] focus:border-[var(--accent)]"
            placeholderText="Select date and time"
            required
            wrapperClassName="w-full ritual-datepicker-wrapper"
            popperClassName="ritual-datepicker"
            calendarClassName="ritual-datepicker-calendar"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_recurring"
            checked={formData.is_recurring || false}
            onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
            className="h-4 w-4 text-[var(--accent)] focus:ring-[var(--accent)] border-[rgba(88,243,153,0.35)] rounded bg-[#0c1914]"
          />
          <label htmlFor="is_recurring" className="ml-2 block text-sm font-medium text-[var(--text-secondary)]">
            This is a recurring event
          </label>
        </div>

        {formData.is_recurring && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0c1914]/70 p-4 rounded-md">
            <div>
              <label htmlFor="recurrence_type" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Recurrence Type <span className="text-[var(--accent)]">*</span>
              </label>
              <select
                id="recurrence_type"
                value={formData.recurrence_type || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  recurrence_type: e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly' | null 
                })}
                className="w-full px-3 py-2 bg-[#0c1914] border border-[rgba(88,243,153,0.25)] text-white rounded-md shadow-sm focus:outline-none focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                required
              >
                <option value="">Select recurrence type</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div>
              <label htmlFor="recurrence_interval" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Repeat Every
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  id="recurrence_interval"
                  min="1"
                  value={formData.recurrence_interval || 1}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    recurrence_interval: parseInt(e.target.value) || 1 
                  })}
                  className="w-20 px-3 py-2 bg-[#0c1914] border border-[rgba(88,243,153,0.25)] text-white rounded-md shadow-sm focus:outline-none focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                />
                <span className="ml-2 text-sm text-[var(--text-secondary)]">
                  {formData.recurrence_type === 'daily' && 'day(s)'}
                  {formData.recurrence_type === 'weekly' && 'week(s)'}
                  {formData.recurrence_type === 'monthly' && 'month(s)'}
                  {formData.recurrence_type === 'yearly' && 'year(s)'}
                  {!formData.recurrence_type && 'period(s)'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Location
          </label>
          <input
            type="text"
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-3 py-2 bg-[#0c1914] border border-[rgba(88,243,153,0.25)] text-white rounded-md shadow-sm focus:outline-none focus:ring-[var(--accent)] focus:border-[var(--accent)]"
            placeholder="Enter event location"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="px-6 py-2 border border-[rgba(88,243,153,0.25)] rounded-md text-white bg-[#0c1914] hover:bg-[#13251f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent)] focus:ring-offset-[#0c1914]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-[#02150c] bg-[var(--accent)] hover:bg-[var(--accent-light)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent)] focus:ring-offset-[#0c1914] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function AdminPanel() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminPanelContent />
    </ProtectedRoute>
  )
}

