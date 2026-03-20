import type { Assignment } from '@/lib/types'

interface AssignmentListProps {
  assignments: Assignment[]
}

function getUrgency(dueDate: string, submitted: boolean): 'overdue' | 'urgent' | 'soon' | 'ok' | 'done' {
  if (submitted) return 'done'
  const diff = new Date(dueDate).getTime() - Date.now()
  if (diff < 0) return 'overdue'
  if (diff < 48 * 3600 * 1000) return 'urgent'
  if (diff < 7 * 24 * 3600 * 1000) return 'soon'
  return 'ok'
}

const urgencyStyle: Record<string, { color: string; label: string }> = {
  overdue: { color: 'var(--alert-urgent)', label: 'Overdue' },
  urgent: { color: 'var(--alert-warning)', label: 'Due soon' },
  soon: { color: '#fb923c', label: 'This week' },
  ok: { color: 'var(--alert-ok)', label: '' },
  done: { color: 'var(--text-muted)', label: 'Submitted' }
}

export default function AssignmentList({ assignments }: AssignmentListProps) {
  if (!assignments.length) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 14 }}>
        No assignments found
      </div>
    )
  }

  const sorted = [...assignments].sort((a, b) =>
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {sorted.map(assignment => {
        const urgency = getUrgency(assignment.dueDate, assignment.submitted)
        const { color, label } = urgencyStyle[urgency]

        return (
          <div
            key={assignment.id}
            className="card"
            style={{
              borderLeft: `3px solid ${color}`,
              padding: '14px 18px',
              opacity: urgency === 'done' ? 0.6 : 1
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {assignment.title}
                </p>
                {assignment.description && (
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                    {assignment.description.slice(0, 120)}{assignment.description.length > 120 ? '...' : ''}
                  </p>
                )}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontSize: 13, color, fontWeight: 500 }}>
                  {label || new Date(assignment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {new Date(assignment.dueDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
