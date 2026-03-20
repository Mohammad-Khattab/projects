'use client'

import { useState, useEffect, useCallback } from 'react'
import NavBar from '@/components/NavBar'
import SubjectCard from '@/components/SubjectCard'
import type { ScrapedData } from '@/lib/types'

function SkeletonCard() {
  return (
    <div className="card" style={{ height: 140 }}>
      <div className="skeleton" style={{ height: 20, width: '70%', marginBottom: 10 }} />
      <div className="skeleton" style={{ height: 14, width: '40%', marginBottom: 16 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="skeleton" style={{ height: 22, width: 80 }} />
        <div className="skeleton" style={{ height: 22, width: 70 }} />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<ScrapedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadCached = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/scrape')
      const json = await res.json()
      setData(json.data)
    } catch {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = useCallback(async () => {
    setRefreshing(true)
    setError(null)
    try {
      const res = await fetch('/api/scrape', { method: 'POST' })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setData(json.data)
    } catch (err) {
      setError(`Refresh failed: ${String(err)}`)
    } finally {
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { loadCached() }, [loadCached])

  const dueThisWeek = data?.assignments.filter(a => {
    const due = new Date(a.dueDate).getTime()
    const now = Date.now()
    return !a.submitted && due > now && due - now < 7 * 24 * 3600 * 1000
  }).length ?? 0

  return (
    <>
      <NavBar
        scrapedAt={data?.scrapedAt}
        onRefresh={refresh}
        refreshing={refreshing}
      />

      <main className="page-container" style={{ paddingTop: 32, paddingBottom: 48 }}>
        <div style={{ marginBottom: 8 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Semester 2 — 2025/2026
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: 14 }}>
            {data ? (
              <>
                {data.subjects.length} subjects
                {dueThisWeek > 0 && (
                  <span style={{ color: 'var(--alert-warning)', marginLeft: 12 }}>
                    · {dueThisWeek} assignment{dueThisWeek !== 1 ? 's' : ''} due this week
                  </span>
                )}
                {data.stale && (
                  <span style={{ color: 'var(--text-muted)', marginLeft: 12 }}>
                    · (cached — click Refresh to update)
                  </span>
                )}
              </>
            ) : loading ? 'Loading...' : 'No data — click Refresh to scrape your portals'}
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            color: '#f87171',
            marginTop: 16,
            fontSize: 14
          }}>
            {error}
          </div>
        )}

        <div className="grid-subjects">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : data?.subjects.length ? (
            data.subjects.map(subject => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                assignments={data.assignments}
              />
            ))
          ) : !loading && !error ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: 48, marginBottom: 16 }}>◈</p>
              <p style={{ fontSize: 16, marginBottom: 8 }}>No subjects found</p>
              <p style={{ fontSize: 14 }}>Click <strong>Refresh</strong> to scrape your GJU portals</p>
            </div>
          ) : null}
        </div>
      </main>
    </>
  )
}
