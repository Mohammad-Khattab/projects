'use client'

import { useState, useEffect, useCallback } from 'react'
import NavBar from '@/components/study-hub/NavBar'
import SubjectCard from '@/components/study-hub/SubjectCard'
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
  const [teamsConnected, setTeamsConnected] = useState(false)
  const [teamsConnecting, setTeamsConnecting] = useState(false)

  const loadCached = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/scrape')
      const json = await res.json()
      setData(json.data)
      setTeamsConnected(json.teamsConnected ?? false)
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

  const connectTeams = useCallback(async () => {
    setTeamsConnecting(true)
    setError(null)
    try {
      // Opens a visible browser window — user completes MFA manually
      const res = await fetch('/api/teams-auth', { method: 'POST' })
      const json = await res.json()
      if (json.ok) {
        setTeamsConnected(true)
        // Auto-refresh to pull Teams resources
        await refresh()
      } else {
        setError(`Teams connection failed: ${json.error}`)
      }
    } catch (err) {
      setError(`Teams connection failed: ${String(err)}`)
    } finally {
      setTeamsConnecting(false)
    }
  }, [refresh])

  const disconnectTeams = useCallback(async () => {
    await fetch('/api/teams-auth', { method: 'DELETE' })
    setTeamsConnected(false)
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
        refreshing={refreshing || loading}
        refreshingText={loading && !refreshing ? 'Loading your courses…' : undefined}
      />

      <main className="page-container" style={{ paddingTop: 32, paddingBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
          <div>
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

          {/* Teams connection button */}
          {!loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {teamsConnected ? (
                <>
                  <span style={{
                    fontSize: 12,
                    color: 'var(--alert-ok)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5
                  }}>
                    <span style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: 'var(--alert-ok)',
                      display: 'inline-block',
                      boxShadow: '0 0 6px var(--alert-ok)'
                    }} />
                    Teams connected
                  </span>
                  <button
                    className="btn btn-ghost"
                    style={{ fontSize: 11, padding: '4px 10px' }}
                    onClick={disconnectTeams}
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: 12, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}
                  onClick={connectTeams}
                  disabled={teamsConnecting}
                >
                  {teamsConnecting
                    ? <><span className="spinner" style={{ width: 12, height: 12 }} /> Connecting Teams…</>
                    : <>
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" style={{ opacity: 0.8 }}>
                          <path d="M16.25 6.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5ZM13 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm2.5 6c0-2.485-2.015-4.5-4.5-4.5H9c-2.485 0-4.5 2.015-4.5 4.5v.5h11v-.5Z"/>
                        </svg>
                        Connect Teams
                      </>
                  }
                </button>
              )}
            </div>
          )}
        </div>

        {/* Teams connecting info banner */}
        {teamsConnecting && (
          <div style={{
            background: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            color: 'var(--text-secondary)',
            marginTop: 12,
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <span className="spinner" style={{ width: 14, height: 14, flexShrink: 0 }} />
            A browser window has opened — complete the Microsoft sign-in and MFA, then return here. This may take up to 3 minutes.
          </div>
        )}

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
