import Link from 'next/link'
import type { Subject, Assignment } from '@/lib/types'

interface SubjectCardProps {
  subject: Subject
  assignments: Assignment[]
}

function getUrgentCount(assignments: Assignment[]): number {
  const now = Date.now()
  const h48 = 48 * 3600 * 1000
  return assignments.filter(a => !a.submitted && new Date(a.dueDate).getTime() - now < h48 && new Date(a.dueDate).getTime() > now).length
}

export default function SubjectCard({ subject, assignments }: SubjectCardProps) {
  const subjectAssignments = assignments.filter(a => a.subjectId === subject.id)
  const urgentCount = getUrgentCount(subjectAssignments)

  return (
    <Link href={`/subject/${subject.id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ cursor: 'pointer', height: '100%', minHeight: 140 }}>
        <div style={{ marginBottom: 12 }}>
          <h3 style={{
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 4,
            lineHeight: 1.3
          }}>
            {subject.name}
          </h3>
          {subject.instructor && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{subject.instructor}</p>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          <span className="badge badge-purple">
            📄 {subject.resourceCount} file{subject.resourceCount !== 1 ? 's' : ''}
          </span>
          {subject.assignmentCount > 0 && (
            <span className="badge badge-green">
              ✓ {subject.assignmentCount} task{subject.assignmentCount !== 1 ? 's' : ''}
            </span>
          )}
          <span className="badge" style={{
            background: 'rgba(99,102,241,0.08)',
            color: 'var(--text-muted)',
            fontSize: 11
          }}>
            {subject.source}
          </span>
        </div>

        {urgentCount > 0 && (
          <div className="badge badge-amber" style={{
            display: 'inline-flex',
            animation: 'pulse 2s infinite'
          }}>
            ⚠ {urgentCount} due soon
          </div>
        )}
      </div>
    </Link>
  )
}
