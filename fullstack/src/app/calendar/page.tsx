'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import NavBar from '@/components/study-hub/NavBar'
import type { ScrapedData, CourseSchedule } from '@/lib/types'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'] as const
type Day = typeof DAYS[number]

// Time grid: 08:00 to 17:00, 30-min slots
const HOUR_START = 8
const HOUR_END = 17

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`
}

export default function CalendarPage() {
  const [data, setData] = useState<ScrapedData | null>(null)

  useEffect(() => {
    fetch('/api/scrape').then(r => r.json()).then(json => setData(json.data))
  }, [])

  const schedule: CourseSchedule[] = data?.schedule || []

  const hours = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i)

  return (
    <>
      <NavBar scrapedAt={data?.scrapedAt} />
      <main className="page-container" style={{ paddingTop: 28, paddingBottom: 48 }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>📅 Weekly Schedule</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
            Semester 2 — 2025/2026 · {schedule.length} courses · {schedule.reduce((s, c) => s + c.credits, 0)} credit hours
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
          {schedule.map(course => (
            <Link
              key={course.courseId}
              href={`/subject/${course.courseId}`}
              style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
            >
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: course.color }} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{course.courseId}</span>
            </Link>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden'
        }}>
          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '64px repeat(5, 1fr)', borderBottom: '1px solid var(--border)' }}>
            <div style={{ padding: '10px 8px', borderRight: '1px solid var(--border)' }} />
            {DAYS.map(day => (
              <div key={day} style={{
                padding: '10px 8px',
                textAlign: 'center',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                borderRight: '1px solid var(--border)'
              }}>
                {day}
              </div>
            ))}
          </div>

          {/* Time grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '64px repeat(5, 1fr)', position: 'relative' }}>
            {/* Hour labels column */}
            <div style={{ borderRight: '1px solid var(--border)' }}>
              {hours.map(h => (
                <div key={h} style={{
                  height: 60,
                  padding: '4px 8px',
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'flex-start'
                }}>
                  {h > 12 ? `${h - 12}` : h}:00 {h >= 12 ? 'PM' : 'AM'}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {DAYS.map(day => (
              <div key={day} style={{ position: 'relative', borderRight: '1px solid var(--border)' }}>
                {/* Hour lines */}
                {hours.map(h => (
                  <div key={h} style={{ height: 60, borderBottom: '1px solid var(--border)' }} />
                ))}

                {/* Course blocks */}
                {schedule.flatMap(course =>
                  course.slots
                    .filter(slot => slot.day === day)
                    .map((slot, i) => {
                      const totalMinutes = (HOUR_END - HOUR_START) * 60
                      const topPct = ((timeToMinutes(slot.startTime) - HOUR_START * 60) / totalMinutes) * 100
                      const heightPctVal = ((timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime)) / totalMinutes) * 100
                      const totalHeight = hours.length * 60

                      return (
                        <Link
                          key={`${course.courseId}-${i}`}
                          href={`/subject/${course.courseId}`}
                          style={{
                            position: 'absolute',
                            top: `${(topPct / 100) * totalHeight}px`,
                            height: `${(heightPctVal / 100) * totalHeight - 2}px`,
                            left: 2,
                            right: 2,
                            background: course.color + '22',
                            border: `1px solid ${course.color}66`,
                            borderLeft: `3px solid ${course.color}`,
                            borderRadius: 6,
                            padding: '4px 6px',
                            textDecoration: 'none',
                            overflow: 'hidden',
                            zIndex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-start'
                          }}
                        >
                          <p style={{ fontSize: 11, fontWeight: 700, color: course.color, margin: 0, lineHeight: 1.2 }}>
                            {course.courseId}
                          </p>
                          <p style={{ fontSize: 10, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {course.courseName}
                          </p>
                          <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>
                            {slot.room}
                          </p>
                          <p style={{ fontSize: 9, color: 'var(--text-muted)', margin: 0 }}>
                            {formatTime(slot.startTime)}–{formatTime(slot.endTime)}
                          </p>
                        </Link>
                      )
                    })
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Course list below calendar */}
        <div style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Enrolled Courses</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {schedule.map(course => (
              <Link key={course.courseId} href={`/subject/${course.courseId}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '14px 18px',
                  borderLeft: `3px solid ${course.color}`
                }}>
                  <div style={{ width: 72, flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: course.color }}>{course.courseId}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>{course.courseName}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Dr. {course.instructor} · Sec {course.section}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                      {course.slots.map(s => `${s.day} ${s.startTime}`).join(', ')}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{course.credits} cr</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
