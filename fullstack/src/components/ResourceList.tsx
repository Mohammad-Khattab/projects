import type { Resource } from '@/lib/types'

interface ResourceListProps {
  resources: Resource[]
  subjectName: string
  onGenerateNotes: (resource: Resource, mode: 'notes' | 'slides') => void
  generatingId?: string
}

const typeIcon: Record<string, string> = {
  pdf: '📄',
  doc: '📝',
  video: '🎥',
  link: '🔗',
  file: '📎'
}

export default function ResourceList({ resources, subjectName, onGenerateNotes, generatingId }: ResourceListProps) {
  if (!resources.length) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 14 }}>
        No resources uploaded yet
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {resources.map(resource => (
        <div
          key={resource.id}
          className="card"
          style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}
        >
          <span style={{ fontSize: 20, flexShrink: 0 }}>{typeIcon[resource.type] || '📎'}</span>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {resource.name}
            </p>
            {resource.uploadedAt && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {new Date(resource.uploadedAt).toLocaleDateString()}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
              style={{ padding: '5px 10px', fontSize: 12 }}
            >
              ↗ Open
            </a>
            {(resource.type === 'pdf' || resource.type === 'doc' || resource.type === 'file') && (
              <>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '5px 10px', fontSize: 12 }}
                  onClick={() => onGenerateNotes(resource, 'notes')}
                  disabled={generatingId === resource.id}
                >
                  {generatingId === resource.id ? <span className="spinner" style={{ width: 12, height: 12 }} /> : '✦'} Notes
                </button>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '5px 10px', fontSize: 12 }}
                  onClick={() => onGenerateNotes(resource, 'slides')}
                  disabled={generatingId === resource.id}
                >
                  ◫ Slides
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
