'use client'

import { useState, useMemo } from 'react'
import type { Resource } from '@/lib/types'

interface ResourceListProps {
  resources: Resource[]
  subjectName: string
  onGenerateNotes: (resources: Resource | Resource[], mode: 'notes' | 'slides', chapterName?: string) => void
  generatingId?: string
}

const typeIcon: Record<string, string> = {
  pdf: '📄',
  doc: '📝',
  video: '🎥',
  link: '🔗',
  file: '📎'
}

function ResourceRow({ resource, onGenerateNotes, generatingId }: {
  resource: Resource
  onGenerateNotes: ResourceListProps['onGenerateNotes']
  generatingId?: string
}) {
  const isGenerating = generatingId === resource.id
  return (
    <div
      className="card"
      style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}
    >
      <span style={{ fontSize: 18, flexShrink: 0 }}>{typeIcon[resource.type] || '📎'}</span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--text-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {resource.name}
        </p>
        {resource.uploadedAt && (
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            {new Date(resource.uploadedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost"
          style={{ padding: '4px 9px', fontSize: 11 }}
        >
          ↗ Open
        </a>
        {(resource.type === 'pdf' || resource.type === 'doc' || resource.type === 'file') && (
          <>
            <button
              className="btn btn-secondary"
              style={{ padding: '4px 9px', fontSize: 11 }}
              onClick={() => onGenerateNotes(resource, 'notes')}
              disabled={!!generatingId}
            >
              {isGenerating ? <span className="spinner" style={{ width: 10, height: 10 }} /> : '✦'} Notes
            </button>
            <button
              className="btn btn-ghost"
              style={{ padding: '4px 9px', fontSize: 11 }}
              onClick={() => onGenerateNotes(resource, 'slides')}
              disabled={!!generatingId}
            >
              ◫ Slides
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function ResourceList({ resources, subjectName, onGenerateNotes, generatingId }: ResourceListProps) {
  // Group resources by chapter
  const grouped = useMemo(() => {
    const map = new Map<string, Resource[]>()
    for (const r of resources) {
      const key = r.chapter?.trim() || '— General'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(r)
    }
    // Sort: named chapters first (alphabetically), then "General"
    return [...map.entries()].sort(([a], [b]) => {
      if (a === '— General') return 1
      if (b === '— General') return -1
      return a.localeCompare(b)
    })
  }, [resources])

  // Track which chapters are collapsed (default: all open)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const toggle = (chapter: string) => {
    setCollapsed(prev => {
      const next = new Set(prev)
      if (next.has(chapter)) next.delete(chapter)
      else next.add(chapter)
      return next
    })
  }

  if (!resources.length) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 14 }}>
        No resources uploaded yet
      </div>
    )
  }

  // If no resources have chapters, show flat list
  const hasChapters = grouped.some(([key]) => key !== '— General')

  if (!hasChapters) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {resources.map(resource => (
          <ResourceRow
            key={resource.id}
            resource={resource}
            onGenerateNotes={onGenerateNotes}
            generatingId={generatingId}
          />
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {grouped.map(([chapter, chapterResources]) => {
        const isOpen = !collapsed.has(chapter)
        const isGeneratingChapter = generatingId === `chapter:${chapter}`
        const hasDownloadable = chapterResources.some(r => r.type === 'pdf' || r.type === 'doc' || r.type === 'file')

        return (
          <div key={chapter} style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            overflow: 'hidden'
          }}>
            {/* Chapter header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 16px',
                background: 'var(--bg-card)',
                cursor: 'pointer',
                userSelect: 'none',
                borderBottom: isOpen ? '1px solid var(--border)' : 'none',
                transition: 'background 0.15s'
              }}
              onClick={() => toggle(chapter)}
            >
              <span style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                transition: 'transform 0.2s',
                transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                display: 'inline-block',
                lineHeight: 1
              }}>▶</span>

              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                {chapter === '— General' ? 'General' : chapter}
              </span>

              <span style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                background: 'rgba(99,102,241,0.08)',
                padding: '2px 7px',
                borderRadius: 999
              }}>
                {chapterResources.length} file{chapterResources.length !== 1 ? 's' : ''}
              </span>

              {hasDownloadable && (
                <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '4px 10px', fontSize: 11 }}
                    onClick={() => onGenerateNotes(chapterResources.filter(r => r.type === 'pdf' || r.type === 'doc' || r.type === 'file'), 'notes', chapter === '— General' ? undefined : chapter)}
                    disabled={!!generatingId}
                  >
                    {isGeneratingChapter ? <span className="spinner" style={{ width: 10, height: 10 }} /> : '✦'} Chapter Notes
                  </button>
                  <button
                    className="btn btn-ghost"
                    style={{ padding: '4px 10px', fontSize: 11 }}
                    onClick={() => onGenerateNotes(chapterResources.filter(r => r.type === 'pdf' || r.type === 'doc' || r.type === 'file'), 'slides', chapter === '— General' ? undefined : chapter)}
                    disabled={!!generatingId}
                  >
                    ◫ Slides
                  </button>
                </div>
              )}
            </div>

            {/* Chapter resources */}
            {isOpen && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                padding: 10,
                background: 'rgba(10,10,15,0.5)'
              }}>
                {chapterResources.map(resource => (
                  <ResourceRow
                    key={resource.id}
                    resource={resource}
                    onGenerateNotes={onGenerateNotes}
                    generatingId={generatingId}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
