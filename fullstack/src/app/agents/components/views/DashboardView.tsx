'use client'
import { useState, useEffect, useRef } from 'react'
import { getTodayLabel, calcStreak, getToday, formatDueLabel } from '../../lib/utils'
import TaskRow from '../TaskRow'
import FocusTimer from '../FocusTimer'
import { useCountUp } from '../../hooks/useCountUp'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import type { Task } from '../../types'

interface Props {
  tasks: Task[]
  userName: string
  onToggle: (id: string) => void
  onEdit: (t: Task) => void
  onDelete: (id: string) => void
  onAdd: (title: string) => void
}

function getWeekCompletions(tasks: Task[], weeksAgo: number): number {
  const now = new Date()
  const start = new Date(now); start.setDate(now.getDate() - (weeksAgo + 1) * 7)
  const end   = new Date(now); end.setDate(now.getDate() - weeksAgo * 7)
  return tasks.filter(t => {
    if (!t.completedAt) return false
    const d = new Date(t.completedAt)
    return d >= start && d < end
  }).length
}

export default function DashboardView({ tasks, userName, onToggle, onEdit, onDelete, onAdd }: Props) {
  const [quickTitle, setQuickTitle] = useState('')
  const [greeting, setGreeting] = useState('Good morning')
  const [newTaskIds, setNewTaskIds] = useState<Set<string>>(new Set())
  const prevLengthRef = useRef(tasks.length)
  const today = getToday()

  useEffect(() => { setGreeting(getTodayLabel()) }, [])

  useEffect(() => {
    if (tasks.length > prevLengthRef.current && tasks[0]) {
      const id = tasks[0].id
      setNewTaskIds(prev => new Set([...prev, id]))
      setTimeout(() => setNewTaskIds(prev => { const n = new Set(prev); n.delete(id); return n }), 600)
    }
    prevLengthRef.current = tasks.length
  }, [tasks])

  const todayTasks    = tasks.filter(t => t.dueDate === today)
  const totalTasks    = tasks.length
  const completedCount = tasks.filter(t => t.completed).length
  const completionPct  = totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100)
  const dueTodayCount  = todayTasks.filter(t => !t.completed).length
  const streak         = calcStreak(tasks)
  const thisWeek       = getWeekCompletions(tasks, 0)
  const lastWeek       = getWeekCompletions(tasks, 1)

  const animPct    = useCountUp(completionPct)
  const animStreak = useCountUp(streak)
  const animTotal  = useCountUp(totalTasks)
  const animToday  = useCountUp(dueTodayCount)

  const statsReveal    = useScrollReveal()
  const activityReveal = useScrollReveal()

  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i))
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    return { dateStr, hasCompletion: tasks.some(t => t.completedAt?.slice(0, 10) === dateStr) }
  })

  const upcoming = tasks
    .filter(t => !t.completed && t.dueDate && t.dueDate > today)
    .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!))
    .at(0) ?? null

  // SVG progress ring
  const radius       = 38
  const circumference = 2 * Math.PI * radius
  const strokeOffset  = circumference - (animPct / 100) * circumference

  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (quickTitle.trim()) { onAdd(quickTitle.trim()); setQuickTitle('') }
  }

  return (
    <div>
      {/* Stats banner */}
      <div className="agents-main-header">
        <div ref={statsReveal.ref} className={`agents-reveal ${statsReveal.isVisible ? 'visible' : ''}`}>
          <div className="agents-stats-row" style={{ marginBottom: 0 }}>
            <div className="agents-stat">
              <div className="agents-stat-val">{animTotal}</div>
              <div className="agents-stat-label">Total</div>
            </div>
            <div className="agents-stat">
              <div className="agents-stat-val">{animToday}</div>
              <div className="agents-stat-label">Due Today</div>
            </div>
            <div className="agents-stat">
              <div className="agents-stat-val">{completedCount}</div>
              <div className="agents-stat-label">Completed</div>
            </div>
            <div className="agents-stat">
              <div className="agents-stat-val">{animStreak}🔥</div>
              <div className="agents-stat-label">Streak</div>
            </div>
          </div>
        </div>
      </div>

      <div className="agents-content">
        {/* Hero */}
        <div className="agents-dashboard-hero">
          <div>
            <div className="agents-hero-greeting">{greeting}, {userName}.</div>
            <div className="agents-hero-date">{todayDate}</div>
            <div style={{ marginTop: 8, fontSize: 13, color: 'var(--a-muted)' }}>
              {dueTodayCount > 0
                ? `You have ${dueTodayCount} task${dueTodayCount !== 1 ? 's' : ''} due today.`
                : 'Nothing due today — great job!'}
            </div>
          </div>
          {/* SVG circular progress ring */}
          <svg width="110" height="110" viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
            <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle
              cx="50" cy="50" r={radius}
              fill="none"
              stroke="url(#dash-ring)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
            <defs>
              <linearGradient id="dash-ring" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            <text x="50" y="47" textAnchor="middle" fill="#e2e8f0" fontSize="17" fontWeight="700">{animPct}%</text>
            <text x="50" y="60" textAnchor="middle" fill="#64748b" fontSize="9">complete</text>
          </svg>
        </div>

        {/* 3-column widget row */}
        <div className="agents-widget-row">
          {/* Today's Focus */}
          <div className="agents-widget">
            <div className="agents-widget-title">Today&apos;s Focus</div>
            {todayTasks.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--a-muted)', fontStyle: 'italic', marginBottom: 12 }}>
                Nothing due today.
              </div>
            )}
            {todayTasks.slice(0, 4).map(t => (
              <TaskRow
                key={t.id}
                task={t}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
                isNew={newTaskIds.has(t.id)}
              />
            ))}
            <form className="agents-quick-add" onSubmit={handleQuickAdd} style={{ marginTop: 10 }}>
              <input
                value={quickTitle}
                onChange={e => setQuickTitle(e.target.value)}
                placeholder="Quick add for today…"
              />
              <button type="submit" className="agents-btn-primary">Add</button>
            </form>
          </div>

          {/* Focus Timer */}
          <div className="agents-widget">
            <FocusTimer />
          </div>

          {/* Streak & Upcoming */}
          <div className="agents-widget">
            <div className="agents-widget-title">Streak</div>
            <div className="agents-streak-box" style={{ marginBottom: 18 }}>
              <div className="agents-streak-num">{animStreak}</div>
              <div className="agents-streak-label">Consecutive<br />Days</div>
            </div>
            {upcoming && (
              <>
                <div className="agents-widget-title">Up Next</div>
                <div className="agents-upcoming-card">
                  <div className="agents-upcoming-title">{upcoming.title}</div>
                  <div className="agents-upcoming-due">{formatDueLabel(upcoming.dueDate)}</div>
                </div>
              </>
            )}
            {!upcoming && (
              <div style={{ fontSize: 11, color: 'var(--a-muted)', fontStyle: 'italic' }}>No upcoming tasks.</div>
            )}
          </div>
        </div>

        {/* Activity section */}
        <div ref={activityReveal.ref} className={`agents-reveal ${activityReveal.isVisible ? 'visible' : ''}`}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: 'var(--a-white)', border: '1px solid var(--a-border)', borderRadius: 'var(--a-radius)', padding: '14px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--a-text)', marginBottom: 10 }}>Activity — Last 14 Days</div>
              <div className="agents-streak-grid">
                {last14.map(({ dateStr, hasCompletion }) => (
                  <div key={dateStr} className={`agents-streak-cell ${hasCompletion ? 'has-completion' : ''}`} title={dateStr} />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'var(--a-muted)' }}>
                <span>14 days ago</span><span>Today</span>
              </div>
            </div>
            <div style={{ background: 'var(--a-white)', border: '1px solid var(--a-border)', borderRadius: 'var(--a-radius)', padding: '14px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--a-text)', marginBottom: 10 }}>This Week vs Last Week</div>
              {[{ label: 'This Week', val: thisWeek }, { label: 'Last Week', val: lastWeek }].map(({ label, val }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 72, fontSize: 11, color: 'var(--a-muted)' }}>{label}</div>
                  <div className="agents-bar-track" style={{ flex: 1 }}>
                    <div className="agents-bar-fill" style={{ width: `${Math.min((val / Math.max(thisWeek, lastWeek, 1)) * 100, 100)}%` }} />
                  </div>
                  <div style={{ width: 20, fontSize: 12, fontWeight: 700, color: 'var(--a-text)', textAlign: 'right' }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
