'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface NotesEditorProps {
  subjectId: string
  subjectName: string
  resources: Array<{ id: string; name: string; url: string; type: string }>
}

export default function NotesEditor({ subjectId, subjectName, resources }: NotesEditorProps) {
  const [content, setContent] = useState('')
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [preview, setPreview] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [selectedResourceId, setSelectedResourceId] = useState('')
  const [renderedHtml, setRenderedHtml] = useState('')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetch(`/api/notes?subjectId=${subjectId}`)
      .then(r => r.json())
      .then(json => {
        if (json.notes?.content) setContent(json.notes.content)
      })
      .catch(() => {})
  }, [subjectId])

  // Render markdown using dynamic import to avoid SSR issues
  useEffect(() => {
    if (!preview) return
    import('marked').then(({ marked }) => {
      const html = marked.parse(content) as string
      setRenderedHtml(html)
    })
  }, [preview, content])

  const save = useCallback(async (text: string) => {
    setSaveStatus('saving')
    try {
      await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId, content: text })
      })
      setSaveStatus('saved')
    } catch {
      setSaveStatus('unsaved')
    }
  }, [subjectId])

  const handleChange = (value: string) => {
    setContent(value)
    setSaveStatus('unsaved')
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => save(value), 800)
  }

  const generateNotes = async () => {
    const resource = resources.find(r => r.id === selectedResourceId)
    if (!resource) return
    setGenerating(true)
    try {
      const res = await fetch('/api/ai/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceUrl: resource.url,
          resourceName: resource.name,
          subjectName,
          mode: 'notes'
        })
      })
      const json = await res.json()
      if (json.content) {
        const newContent = content ? `${content}\n\n---\n\n${json.content}` : json.content
        setContent(newContent)
        save(newContent)
      }
    } catch {
      alert('Failed to generate notes. Check your Claude API key.')
    } finally {
      setGenerating(false)
    }
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)'
      }}>
        <select
          value={selectedResourceId}
          onChange={e => setSelectedResourceId(e.target.value)}
          style={{ flex: 1, maxWidth: 260 }}
        >
          <option value="">Select resource to generate notes...</option>
          {resources.filter(r => ['pdf', 'doc', 'file'].includes(r.type)).map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        <button
          className="btn btn-primary"
          style={{ fontSize: 13, padding: '7px 14px', whiteSpace: 'nowrap' }}
          onClick={generateNotes}
          disabled={!selectedResourceId || generating}
        >
          {generating ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '✦'} Generate
        </button>

        <div style={{ flex: 1 }} />

        <button
          className={`btn ${preview ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: 13, padding: '7px 14px' }}
          onClick={() => setPreview(p => !p)}
        >
          {preview ? '✎ Edit' : '◎ Preview'}
        </button>

        <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          {wordCount} words
        </span>
        <span style={{
          fontSize: 12,
          color: saveStatus === 'saved' ? 'var(--alert-ok)' : saveStatus === 'saving' ? 'var(--alert-warning)' : 'var(--text-muted)',
          whiteSpace: 'nowrap'
        }}>
          {saveStatus === 'saved' ? '✓ Saved' : saveStatus === 'saving' ? 'Saving...' : '● Unsaved'}
        </span>
      </div>

      {preview ? (
        <div
          className="card markdown"
          style={{ minHeight: 500, padding: 24 }}
          dangerouslySetInnerHTML={{ __html: renderedHtml || '<p style="color:var(--text-muted)">Nothing to preview yet</p>' }}
        />
      ) : (
        <textarea
          value={content}
          onChange={e => handleChange(e.target.value)}
          placeholder={`Write your notes for ${subjectName} here...\n\nYou can write in Markdown:\n# Heading\n## Subheading\n- bullet point\n**bold text**`}
          style={{
            minHeight: 500,
            resize: 'vertical',
            fontFamily: "'Consolas', 'Courier New', monospace",
            fontSize: 14,
            lineHeight: 1.7,
            padding: 20
          }}
        />
      )}
    </div>
  )
}
