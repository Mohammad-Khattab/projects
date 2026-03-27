'use client'
import { useState, useEffect } from 'react'
import { useVoice } from '../hooks/useVoice'
import type { ParsedTask, Task, Priority, Category } from '../types'

interface Props {
  onConfirm: (data: Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'completed'>) => void
}

export default function VoiceFab({ onConfirm }: Props) {
  const { state, transcript, parsed, error, isSupported, toggleRecording, dismiss } = useVoice()
  const [editedParsed, setEditedParsed] = useState<ParsedTask | null>(null)

  // Sync editable state when new parsed result arrives
  useEffect(() => {
    if (parsed && state === 'preview') {
      setEditedParsed({ ...parsed })
    }
  }, [parsed, state])

  if (!isSupported) return null

  const handleConfirm = () => {
    if (!editedParsed) return
    onConfirm({
      title: editedParsed.title,
      description: '',
      priority: editedParsed.priority,
      category: editedParsed.category,
      dueDate: editedParsed.dueDate,
    })
    dismiss()
    setEditedParsed(null)
  }

  const handleDismiss = () => {
    dismiss()
    setEditedParsed(null)
  }

  return (
    <div style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 50 }}>
      {/* Transcript pill — shown while recording or processing */}
      {state === 'recording' && (
        <div className="agents-transcript-pill">
          🎙 {transcript || 'Listening...'}
        </div>
      )}
      {state === 'processing' && (
        <div className="agents-transcript-pill">⏳ Parsing task...</div>
      )}
      {state === 'error' && (
        <div className="agents-transcript-pill" style={{ background: '#ef4444' }}>
          ⚠ {error}
          <button
            onClick={handleDismiss}
            style={{ marginLeft: 8, background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 14 }}
          >×</button>
        </div>
      )}

      {/* Preview card — shown after Claude parses the transcript */}
      {state === 'preview' && editedParsed && (
        <div className="agents-voice-preview">
          <h4>🎙 Parsed Task</h4>
          <div className="agents-field">
            <label>Title</label>
            <input
              value={editedParsed.title}
              onChange={e => setEditedParsed(p => p ? { ...p, title: e.target.value } : p)}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="agents-field" style={{ flex: 1 }}>
              <label>Priority</label>
              <select
                value={editedParsed.priority}
                onChange={e => setEditedParsed(p => p ? { ...p, priority: e.target.value as Priority } : p)}
              >
                {(['high','medium','low','none'] as Priority[]).map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div className="agents-field" style={{ flex: 1 }}>
              <label>Category</label>
              <select
                value={editedParsed.category}
                onChange={e => setEditedParsed(p => p ? { ...p, category: e.target.value as Category } : p)}
              >
                {(['Work','Personal','Creative','Health'] as Category[]).map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="agents-field">
            <label>Due Date</label>
            <input
              type="date"
              value={editedParsed.dueDate ?? ''}
              onChange={e => setEditedParsed(p => p ? { ...p, dueDate: e.target.value || null } : p)}
            />
          </div>
          <div style={{ fontSize: 10, color: 'var(--a-muted)', marginBottom: 8 }}>
            Confidence: {Math.round(editedParsed.confidence * 100)}%
          </div>
          <div className="agents-voice-actions">
            <button className="agents-btn-secondary" onClick={handleDismiss}>Cancel</button>
            <button className="agents-btn-primary" onClick={handleConfirm}>Add Task</button>
          </div>
        </div>
      )}

      {/* FAB button — hidden while preview is shown */}
      {state !== 'preview' && (
        <button
          className={`agents-voice-fab ${state === 'recording' ? 'recording' : ''}`}
          onClick={toggleRecording}
          title={state === 'recording' ? 'Stop recording' : 'Add task by voice'}
          disabled={state === 'processing'}
          aria-label="Voice input"
        >
          {state === 'processing' ? '⏳' : state === 'recording' ? '⏹' : '🎙'}
        </button>
      )}
    </div>
  )
}
