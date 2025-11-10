'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { CalendarEvent, supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

type EventCategory = 'all' | 'regional' | 'games' | 'global' | 'workshop'

export default function Home() {
  const { isAdmin } = useAuth()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>('all')
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [dayPage, setDayPage] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('start_date', { ascending: true })

      if (error) throw error

      setEvents(data || [])
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch events')
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }

  const getEventInitials = (title: string) => {
    const words = title.trim().split(' ')
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase()
    }
    return title.slice(0, 2).toUpperCase()
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const getRecurrenceText = (event: CalendarEvent) => {
    if (!event.is_recurring || !event.recurrence_type) return null

    const interval = event.recurrence_interval || 1
    const type = event.recurrence_type
    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1)

    return interval === 1
      ? `Repeats ${typeLabel}`
      : `Repeats every ${interval} ${type}${interval > 1 ? 's' : ''}`
  }

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString)
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
    const month = date.toLocaleDateString('en-US', { month: 'long' })
    const day = date.getDate()
    return `${month} ${day} (${dayName})`
  }

  const formatFullDateHeader = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
  }

  const getCategoryBadge = (category?: string | null) => {
    const normalized = category?.toLowerCase()
    const variants: Record<string, { label: string; className: string }> = {
      meeting: {
        label: 'Meeting',
        className:
          'bg-[rgba(88,243,153,0.12)] text-[var(--accent)] border border-[rgba(88,243,153,0.25)]',
      },
      workshop: {
        label: 'Workshop',
        className:
          'bg-[rgba(88,243,153,0.08)] text-[var(--accent)] border border-[rgba(88,243,153,0.25)]',
      },
      social: {
        label: 'Social',
        className:
          'bg-[rgba(88,243,153,0.16)] text-[var(--accent)] border border-[rgba(88,243,153,0.3)]',
      },
      games: {
        label: 'Games',
        className:
          'bg-[rgba(88,243,153,0.12)] text-[var(--accent)] border border-[rgba(88,243,153,0.25)]',
      },
      default: {
        label: category ? category.charAt(0).toUpperCase() + category.slice(1) : 'General',
        className:
          'bg-[rgba(88,243,153,0.12)] text-[var(--accent)] border border-[rgba(88,243,153,0.25)]',
      },
    }

    return variants[normalized || 'default']
  }

  const getWeekStart = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff)
    d.setHours(0, 0, 0, 0)
    return d
  }

  const getWeekEnd = (date: Date) => {
    const start = getWeekStart(date)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    return end
  }

  const weekStart = useMemo(() => getWeekStart(currentWeek), [currentWeek])
  const weekEnd = useMemo(() => getWeekEnd(currentWeek), [currentWeek])
  const weekDays = useMemo(() => {
    const start = new Date(weekStart)
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
      days.push({ date, key })
    }
    return days
  }, [weekStart])

  const formatWeekRange = useMemo(() => {
    const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' })
    const startDay = weekStart.getDate()
    const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' })
    const endDay = weekEnd.getDate()
    return `${startMonth} ${startDay} – ${endMonth} ${endDay}`
  }, [weekStart, weekEnd])

  const isThisWeek = useMemo(() => {
    const now = new Date()
    const thisWeekStart = getWeekStart(now)
    return weekStart.getTime() === thisWeekStart.getTime()
  }, [weekStart])

  const EVENTS_PER_PAGE = 3

  const addDays = (date: Date, days: number) => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }

  const addMonths = (date: Date, months: number) => {
    const result = new Date(date)
    const originalDate = result.getDate()
    result.setMonth(result.getMonth() + months)

    // Handle cases where the target month has fewer days
    if (result.getDate() !== originalDate) {
      result.setDate(0)
    }

    return result
  }

  const addYears = (date: Date, years: number) => {
    const result = new Date(date)
    result.setFullYear(result.getFullYear() + years)
    return result
  }

  const generateOccurrencesForEvent = (event: CalendarEvent, rangeStart: Date, rangeEnd: Date) => {
    const occurrences: CalendarEvent[] = []
    const eventStart = new Date(event.start_date)

    if (Number.isNaN(eventStart.getTime())) {
      return occurrences
    }

    const withinRange = (date: Date) => date >= rangeStart && date <= rangeEnd

    if (!event.is_recurring || !event.recurrence_type) {
      if (withinRange(eventStart)) {
        occurrences.push(event)
      }
      return occurrences
    }

    const interval = Math.max(1, event.recurrence_interval || 1)
    const pushOccurrence = (date: Date) => {
      occurrences.push({
        ...event,
        start_date: date.toISOString(),
      })
    }

    const alignByDays = (base: Date, stepDays: number) => {
      let occurrence = new Date(base)
      if (occurrence < rangeStart) {
        const diffDays = Math.floor((rangeStart.getTime() - occurrence.getTime()) / (24 * 60 * 60 * 1000))
        const intervalsToSkip = Math.floor(diffDays / stepDays)
        if (intervalsToSkip > 0) {
          occurrence = addDays(occurrence, intervalsToSkip * stepDays)
        }
        while (occurrence < rangeStart) {
          occurrence = addDays(occurrence, stepDays)
        }
      }
      return occurrence
    }

    const alignByMonths = (base: Date, stepMonths: number) => {
      let occurrence = new Date(base)
      if (occurrence < rangeStart) {
        for (let safety = 0; safety < 600 && occurrence < rangeStart; safety++) {
          const next = addMonths(occurrence, stepMonths)
          if (next.getTime() === occurrence.getTime()) {
            break
          }
          occurrence = next
        }
      }
      return occurrence
    }

    const alignByYears = (base: Date, stepYears: number) => {
      let occurrence = new Date(base)
      if (occurrence < rangeStart) {
        for (let safety = 0; safety < 200 && occurrence < rangeStart; safety++) {
          const next = addYears(occurrence, stepYears)
          if (next.getTime() === occurrence.getTime()) {
            break
          }
          occurrence = next
        }
      }
      return occurrence
    }

    switch (event.recurrence_type) {
      case 'daily': {
        const step = interval
        let occurrence = alignByDays(eventStart, step)
        for (let safety = 0; safety < 500 && occurrence <= rangeEnd; safety++) {
          if (withinRange(occurrence)) {
            pushOccurrence(new Date(occurrence))
          }
          occurrence = addDays(occurrence, step)
        }
        break
      }
      case 'weekly': {
        const step = interval * 7
        let occurrence = alignByDays(eventStart, step)
        for (let safety = 0; safety < 500 && occurrence <= rangeEnd; safety++) {
          if (withinRange(occurrence)) {
            pushOccurrence(new Date(occurrence))
          }
          occurrence = addDays(occurrence, step)
        }
        break
      }
      case 'monthly': {
        let occurrence = alignByMonths(eventStart, interval)
        for (let safety = 0; safety < 200 && occurrence <= rangeEnd; safety++) {
          if (withinRange(occurrence)) {
            pushOccurrence(new Date(occurrence))
          }
          occurrence = addMonths(occurrence, interval)
        }
        break
      }
      case 'yearly': {
        let occurrence = alignByYears(eventStart, interval)
        for (let safety = 0; safety < 200 && occurrence <= rangeEnd; safety++) {
          if (withinRange(occurrence)) {
            pushOccurrence(new Date(occurrence))
          }
          occurrence = addYears(occurrence, interval)
        }
        break
      }
      default: {
        if (withinRange(eventStart)) {
          occurrences.push(event)
        }
      }
    }

    return occurrences
  }

  const eventsForWeek = useMemo(() => {
    const all: CalendarEvent[] = []
    events.forEach(event => {
      const occurrences = generateOccurrencesForEvent(event, weekStart, weekEnd)
      all.push(...occurrences)
    })
    return all
  }, [events, weekStart, weekEnd])

  const filteredEvents = useMemo(() => {
    let filtered = eventsForWeek

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => {
        const category = (event as any).category?.toLowerCase()
        return category === selectedCategory
      })
    }

    return filtered
  }, [eventsForWeek, selectedCategory])

  console.log(filteredEvents)
  console.log(weekDays) 
  console.log(dayPage)


  const groupedEvents = useMemo(() => {
    const groups: Record<string, CalendarEvent[]> = {}
    filteredEvents.forEach(event => {
      const date = new Date(event.start_date)
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(event)
    })
    return groups
  }, [filteredEvents])
  console.log(groupedEvents)

  useEffect(() => {
    setDayPage(prev => {
      const next: Record<string, number> = {}
      let changed = false

      weekDays.forEach(day => {
        const prevValue = prev[day.key]
        if (prevValue === undefined) {
          changed = true
        }
        next[day.key] = prevValue ?? 0
      })

      if (Object.keys(prev).length !== weekDays.length) {
        changed = true
      }

      return changed ? next : prev
    })
  }, [weekDays])

  useEffect(() => {
    setDayPage(prev => {
      let changed = false
      const next: Record<string, number> = { ...prev }

      Object.entries(groupedEvents).forEach(([key, dayEvents]) => {
        const totalPages = Math.max(1, Math.ceil(dayEvents.length / 2))
        const current = prev[key] ?? 0
        if (current > totalPages - 1) {
          next[key] = totalPages - 1
          changed = true
        }
      })

      return changed ? next : prev
    })
  }, [groupedEvents])

  const openGoogleCalendar = (event: CalendarEvent) => {
    const start = new Date(event.start_date)
    const end = new Date(start.getTime() + 60 * 60 * 1000)

    const formatForGoogle = (date: Date) => {
      const year = date.getUTCFullYear()
      const month = String(date.getUTCMonth() + 1).padStart(2, '0')
      const day = String(date.getUTCDate()).padStart(2, '0')
      const hours = String(date.getUTCHours()).padStart(2, '0')
      const minutes = String(date.getUTCMinutes()).padStart(2, '0')
      const seconds = String(date.getUTCSeconds()).padStart(2, '0')
      return `${year}${month}${day}T${hours}${minutes}${seconds}Z`
    }

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${formatForGoogle(start)}/${formatForGoogle(end)}`,
      details: event.description || '',
      location: event.location || '',
    })

    const url = `https://calendar.google.com/calendar/render?${params.toString()}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleDelete = async (eventId: string, eventTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${eventTitle}"?`)) return

    try {
      const { error } = await supabase.from('calendar_events').delete().eq('id', eventId)
      if (error) throw error
      fetchEvents()
    } catch (err: any) {
      alert(`Failed to delete event: ${err.message}`)
      console.error('Error deleting event:', err)
    }
  }

  const goToPrevWeek = () => {
    const newDate = new Date(currentWeek)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentWeek(newDate)
  }

  const goToNextWeek = () => {
    const newDate = new Date(currentWeek)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentWeek(newDate)
  }

  const goToThisWeek = () => setCurrentWeek(new Date())

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-[var(--text-secondary)]">Loading events...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-900/60 border border-red-700/60 text-red-100 px-4 py-3 rounded">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen text-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="text-center space-y-3">
          <h1 className="section-heading text-5xl font-bold text-[var(--accent)]">RITUAL CALENDAR</h1>
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--text-secondary)]">
            Upcoming Events
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button onClick={goToPrevWeek} className="week-button">
            &lt; Prev Week
          </button>
          <button
            onClick={goToThisWeek}
            className={`week-button ${isThisWeek ? 'week-button-active' : ''}`}
          >
            This Week
          </button>
          <button onClick={goToNextWeek} className="week-button">
            Next Week &gt;
          </button>
        </div>

        <p className="text-center text-[var(--text-secondary)] text-xs sm:text-sm uppercase tracking-[0.28em]">
          Week of {formatWeekRange}
        </p>

        {filteredEvents.length === 0 && (
          <div className="text-center text-[var(--text-secondary)] text-sm">
            No events scheduled this week yet.
          </div>
        )}

        <div className="flex flex-col gap-6">
          {weekDays.map(({ date, key }) => {
            const dayEvents = [...(groupedEvents[key] ?? [])].sort(
              (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
            )
            const totalPages = Math.max(1, Math.ceil(dayEvents.length / EVENTS_PER_PAGE))
            const currentPage = Math.min(dayPage[key] ?? 0, totalPages - 1)
            const startIndex = currentPage * EVENTS_PER_PAGE
            const visibleEvents = dayEvents.slice(startIndex, startIndex + EVENTS_PER_PAGE)
            const prevDisabled = currentPage === 0 || dayEvents.length <= EVENTS_PER_PAGE
            const nextDisabled = currentPage >= totalPages - 1 || dayEvents.length <= EVENTS_PER_PAGE
            const isToday = new Date().toDateString() === date.toDateString()

            const dayShellClasses = [
              'relative',
              'rounded-3xl',
              'border',
              'border-[rgba(88,243,153,0.12)]',
              'bg-[rgba(8,16,13,0.78)]',
              'p-4',
              'space-y-4',
              'transition',
              'duration-200',
            ]

            if (isToday) {
              dayShellClasses.push(
                'bg-[rgba(8,20,16,0.9)]',
                'border-[rgba(88,243,153,0.35)]',
                'shadow-[0_26px_60px_-28px_rgba(88,243,153,0.55)]'
              )
            }

            return (
              <div key={key} className="w-full">
                <div className={dayShellClasses.join(' ')}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-col text-left">
                      <span className="text-[11px] uppercase tracking-[0.24em] text-[var(--accent)]">
                        {date.toLocaleDateString('en-US', { weekday: 'long' })}
                      </span>
                      <h2 className="text-lg font-semibold text-white tracking-wide">
                        {formatFullDateHeader(date)}
                      </h2>
                    </div>
                    {dayEvents.length > 0 && (
                      <span className="text-[var(--text-secondary)] text-[10px] uppercase tracking-[0.24em]">
                        {`${Math.min(startIndex + 1, dayEvents.length)}-${Math.min(
                          startIndex + visibleEvents.length,
                          dayEvents.length
                        )} of ${dayEvents.length}`}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setDayPage(prev => ({
                          ...prev,
                          [key]: Math.max(0, (prev[key] ?? 0) - 1),
                        }))
                      }
                      disabled={prevDisabled}
                      className={`p-2 rounded-full border border-[rgba(88,243,153,0.2)] text-[var(--text-secondary)] hover:text-white hover:border-[rgba(88,243,153,0.4)] transition ${
                        prevDisabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
                      }`}
                      aria-label="Previous events"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() =>
                        setDayPage(prev => ({
                          ...prev,
                          [key]: Math.min(totalPages - 1, (prev[key] ?? 0) + 1),
                        }))
                      }
                      disabled={nextDisabled}
                      className={`p-2 rounded-full border border-[rgba(88,243,153,0.2)] text-[var(--text-secondary)] hover:text-white hover:border-[rgba(88,243,153,0.4)] transition ${
                        nextDisabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
                      }`}
                      aria-label="Next events"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  <div className="relative">
                    <div className="absolute left-[18px] top-1 bottom-1 w-[1.5px] bg-[rgba(88,243,153,0.18)]" aria-hidden />
                    <div className="flex flex-col gap-3 pl-10">
                    {visibleEvents.length > 0 ? (
                      visibleEvents.map((event, index) => {
                        const badge = getCategoryBadge((event as any).category)
                        const initials = getEventInitials(event.title)
                        const isLastOnPage = index === visibleEvents.length - 1
                        return (
                          <div key={`${event.id ?? 'event'}-${event.start_date}`} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <span className="mt-1 w-3.5 h-3.5 rounded-full border-2 border-[var(--accent)] bg-[rgba(88,243,153,0.22)] shadow-[0_0_0_4px_rgba(88,243,153,0.08)]" />
                              {!isLastOnPage && (
                                <span className="flex-1 w-[1.5px] bg-[rgba(88,243,153,0.18)]" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-col gap-3 rounded-2xl border border-[rgba(88,243,153,0.18)] bg-[rgba(12,22,18,0.88)] px-4 py-3 hover:border-[rgba(88,243,153,0.3)] hover:shadow-[0_16px_45px_-24px_rgba(88,243,153,0.55)] transition duration-200">
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(88,243,153,0.35)] bg-[rgba(88,243,153,0.12)] text-base font-semibold tracking-[0.28em] text-[var(--accent)] uppercase">
                                      {initials}
                                    </div>
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <h3 className="text-white text-base font-semibold">
                                          {event.title}
                                        </h3>
                                        {badge && (
                                          <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.24em] rounded-full ${badge.className}`}>
                                            {badge.label}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[var(--accent)]">
                                        <span>{formatTime(event.start_date)}</span>
                                        {event.location && (
                                          <>
                                            <span className="h-1 w-1 rounded-full bg-[rgba(88,243,153,0.6)]" />
                                            <span className="text-[var(--text-secondary)] tracking-[0.18em]">
                                              {event.location}
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() => openGoogleCalendar(event)}
                                      className="flex items-center gap-2 rounded-full bg-[rgba(88,243,153,0.16)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)] hover:bg-[rgba(88,243,153,0.28)] hover:text-white transition"
                                      title="Add to Google Calendar"
                                      aria-label="Add to Google Calendar"
                                    >
                                      <svg
                                        className="h-3.5 w-3.5 text-[var(--accent)]"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={1.8}
                                        viewBox="0 0 24 24"
                                      >
                                        <path d="M8 7V3m8 4V3m-9 8h10m-12 8h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                      <span>Calendar</span>
                                    </button>
                                    {isAdmin && (
                                      <div className="flex items-center gap-1.5">
                                        <Link
                                          href={`/admin/${event.id}`}
                                          className="flex items-center justify-center rounded-full bg-[rgba(14,23,20,0.9)] p-2 text-base text-[var(--accent)] hover:text-white transition"
                                          title="Edit event"
                                          aria-label="Edit event"
                                        >
                                          <span role="img" aria-hidden="true">
                                            ✏️
                                          </span>
                                          <span className="sr-only">Edit event</span>
                                        </Link>
                                        <button
                                          onClick={() => handleDelete(event.id!, event.title)}
                                          className="flex items-center justify-center rounded-full bg-[rgba(30,8,8,0.6)] p-2 text-base text-red-400 hover:text-red-200 transition"
                                          title="Delete event"
                                          aria-label="Delete event"
                                        >
                                          <span role="img" aria-hidden="true">
                                            🗑️
                                          </span>
                                          <span className="sr-only">Delete event</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="relative ml-[-10px] rounded-2xl border border-dashed border-[rgba(88,243,153,0.2)] bg-[rgba(10,18,15,0.6)] px-6 py-6 text-center text-sm text-[var(--text-secondary)]">
                        No events scheduled for this day.
                      </div>
                    )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {isAdmin && (
          <div className="text-center">
            <Link
              href="/admin"
              className="text-[var(--accent)] hover:text-white text-sm uppercase tracking-[0.3em] font-semibold"
            >
              + Add New Event
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
