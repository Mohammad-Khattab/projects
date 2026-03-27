'use client'
import { calcStreak } from '../../lib/utils'
import type { Task, Category, Priority } from '../../types'

interface Props { tasks: Task[] }

const CATEGORIES: Category[] = ['Work', 'Personal', 'Creative', 'Health']
const PRIORITIES: Priority[] = ['high', 'medium', 'low', 'none']
const PRIORITY_COLORS: Record<Priority, string> = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e', none: '#BEB9A9' }

function getWeekCompletions(tasks: Task[], weeksAgo: number): number {
  const now = new Date()
  const start = new Date(now); start.setDate(now.getDate() - (weeksAgo + 1) * 7)
  const end = new Date(now); end.setDate(now.getDate() - weeksAgo * 7)
  return tasks.filter(t => {
    if (!t.completedAt) return false
    const d = new Date(t.completedAt)
    return d >= start && d < end
  }).length
}

export default function AnalyticsView({ tasks }: Props) {
  const streak = calcStreak(tasks)
  const total = tasks.length
  const completed = tasks.filter(t => t.completed).length
  const completionPct = total === 0 ? 0 : Math.round((completed / total) * 100)
  const thisWeek = getWeekCompletions(tasks, 0)
  const lastWeek = getWeekCompletions(tasks, 1)

  // Last 14 days streak grid
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i))
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    return { dateStr, hasCompletion: tasks.some(t => t.completedAt?.slice(0, 10) === dateStr) }
  })

  // Category breakdown
  const catCounts = CATEGORIES.map(c => ({
    cat: c,
    total: tasks.filter(t => t.category === c).length,
    done: tasks.filter(t => t.category === c && t.completed).length,
  }))
  const maxCat = Math.max(...catCounts.map(c => c.total), 1)

  // Priority breakdown
  const priCounts = PRIORITIES.map(p => ({
    p, count: tasks.filter(t => t.priority === p).length,
  }))

  return (
    <div className="agents-view-enter">
      <div className="agents-main-header">
        <div className="agents-greeting">Analytics</div>
        <div className="agents-sub">Your productivity at a glance.</div>
      </div>
      <div className="agents-content">
        {/* Top stats */}
        <div className="agents-stats-row">
          <div className="agents-stat">
            <div className="agents-stat-val">{total}</div>
            <div className="agents-stat-label">Total Created</div>
          </div>
          <div className="agents-stat">
            <div className="agents-stat-val">{completed}</div>
            <div className="agents-stat-label">Completed</div>
          </div>
          <div className="agents-stat">
            <div className="agents-stat-val">{completionPct}%</div>
            <div className="agents-stat-label">Rate</div>
          </div>
          <div className="agents-stat">
            <div className="agents-stat-val">{streak}🔥</div>
            <div className="agents-stat-label">Streak</div>
          </div>
        </div>

        {/* Week comparison */}
        <div style={{ background: 'var(--a-white)', border: '1px solid var(--a-border)', borderRadius: 'var(--a-radius)', padding: '16px', marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--a-espresso)', marginBottom: 12 }}>Completion — This vs Last Week</div>
          {[{ label: 'This Week', val: thisWeek }, { label: 'Last Week', val: lastWeek }].map(({ label, val }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 80, fontSize: 11, color: 'var(--a-muted)' }}>{label}</div>
              <div className="agents-bar-track">
                <div className="agents-bar-fill" style={{ width: `${Math.min((val / Math.max(thisWeek, lastWeek, 1)) * 100, 100)}%` }} />
              </div>
              <div style={{ width: 24, fontSize: 12, fontWeight: 700, color: 'var(--a-espresso)', textAlign: 'right' }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Streak grid */}
        <div style={{ background: 'var(--a-white)', border: '1px solid var(--a-border)', borderRadius: 'var(--a-radius)', padding: '16px', marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--a-espresso)', marginBottom: 10 }}>Last 14 Days</div>
          <div className="agents-streak-grid">
            {last14.map(({ dateStr, hasCompletion }) => (
              <div key={dateStr} className={`agents-streak-cell ${hasCompletion ? 'has-completion' : ''}`} title={dateStr} />
            ))}
          </div>
        </div>

        {/* By category */}
        <div style={{ background: 'var(--a-white)', border: '1px solid var(--a-border)', borderRadius: 'var(--a-radius)', padding: '16px', marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--a-espresso)', marginBottom: 12 }}>Tasks by Category</div>
          {catCounts.map(({ cat, total: t, done }) => (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 70, fontSize: 11, color: 'var(--a-muted)' }}>{cat}</div>
              <div className="agents-bar-track">
                <div className="agents-bar-fill" style={{ width: `${(t / maxCat) * 100}%` }} />
              </div>
              <div style={{ width: 32, fontSize: 11, color: 'var(--a-muted)', textAlign: 'right' }}>{done}/{t}</div>
            </div>
          ))}
        </div>

        {/* Priority distribution */}
        <div style={{ background: 'var(--a-white)', border: '1px solid var(--a-border)', borderRadius: 'var(--a-radius)', padding: '16px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--a-espresso)', marginBottom: 12 }}>Priority Distribution</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {priCounts.map(({ p, count }) => (
              <div key={p} style={{ background: 'var(--a-bg)', border: '1px solid var(--a-border)', borderRadius: 8, padding: '8px 14px', textAlign: 'center' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: PRIORITY_COLORS[p], margin: '0 auto 4px' }} />
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--a-espresso)' }}>{count}</div>
                <div style={{ fontSize: 10, color: 'var(--a-muted)', textTransform: 'capitalize' }}>{p}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
