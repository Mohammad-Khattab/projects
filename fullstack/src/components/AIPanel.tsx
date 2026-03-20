'use client'

import { useState, useEffect, useRef } from 'react'
import type { Subject, Resource, ChatMessage } from '@/lib/types'

interface AIPanelProps {
  subjects: Subject[]
  resources: Resource[]
}

type Mode = 'notes' | 'slides' | 'chat'

export default function AIPanel({ subjects, resources }: AIPanelProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [selectedResourceId, setSelectedResourceId] = useState('')
  const [mode, setMode] = useState<Mode>('notes')
  const [output, setOutput] = useState('')
  const [renderedOutput, setRenderedOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [renderedMessages, setRenderedMessages] = useState<string[]>([])
  const [chatInput, setChatInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  const subject = subjects.find(s => s.id === selectedSubjectId)
  const subjectResources = resources.filter(r => r.subjectId === selectedSubjectId)
  const resource = subjectResources.find(r => r.id === selectedResourceId)

  useEffect(() => {
    if (!selectedSubjectId) return
    const stored = localStorage.getItem(`chat-${selectedSubjectId}`)
    if (stored) {
      try { setMessages(JSON.parse(stored)) } catch {}
    } else {
      setMessages([])
    }
  }, [selectedSubjectId])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Render markdown for output
  useEffect(() => {
    if (!output) return
    import('marked').then(({ marked }) => {
      setRenderedOutput(marked.parse(output) as string)
    })
  }, [output])

  // Render markdown for chat messages
  useEffect(() => {
    if (!messages.length) return
    import('marked').then(({ marked }) => {
      const rendered = messages.map(m =>
        m.role === 'assistant' ? marked.parse(m.content) as string : m.content
      )
      setRenderedMessages(rendered)
    })
  }, [messages])

  const generate = async () => {
    if (!resource || !subject) return
    setLoading(true)
    setOutput('')
    setError('')
    try {
      const res = await fetch('/api/ai/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceUrl: resource.url,
          resourceName: resource.name,
          subjectName: subject.name,
          mode
        })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setOutput(json.content)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  const sendChat = async () => {
    if (!chatInput.trim() || !subject) return
    const userMsg: ChatMessage = { role: 'user', content: chatInput }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setChatInput('')
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, subjectName: subject.name })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const assistantMsg: ChatMessage = { role: 'assistant', content: json.reply }
      const updated = [...newMessages, assistantMsg]
      setMessages(updated)
      localStorage.setItem(`chat-${selectedSubjectId}`, JSON.stringify(updated))
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, height: 'calc(100vh - 120px)', minHeight: 500 }}>
      {/* Left panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>SUBJECT</label>
          <select value={selectedSubjectId} onChange={e => { setSelectedSubjectId(e.target.value); setSelectedResourceId(''); setOutput(''); setMessages([]) }}>
            <option value="">Select subject...</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {selectedSubjectId && (
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>RESOURCE (for notes/slides)</label>
            <select value={selectedResourceId} onChange={e => setSelectedResourceId(e.target.value)}>
              <option value="">Select resource...</option>
              {subjectResources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
        )}

        <div>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>MODE</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(['notes', 'slides', 'chat'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`btn ${mode === m ? 'btn-primary' : 'btn-ghost'}`}
                style={{ justifyContent: 'flex-start', textTransform: 'capitalize' }}
              >
                {m === 'notes' ? '✦ Notes' : m === 'slides' ? '◫ Slides' : '💬 Chat'}
              </button>
            ))}
          </div>
        </div>

        {mode !== 'chat' && selectedResourceId && (
          <button
            className="btn btn-primary"
            onClick={generate}
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? <span className="spinner" /> : '▶'} Generate {mode}
          </button>
        )}

        {output && mode !== 'chat' && (
          <button
            className="btn btn-secondary"
            onClick={() => navigator.clipboard.writeText(output)}
          >
            ⎘ Copy
          </button>
        )}
      </div>

      {/* Right panel */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {mode === 'chat' ? (
          <>
            <div style={{ flex: 1, overflow: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 60, fontSize: 14 }}>
                  {selectedSubjectId ? 'Ask anything about this subject...' : 'Select a subject to start chatting'}
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, var(--accent-from), var(--accent-to))'
                      : 'var(--bg-card-hover)',
                    border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                    fontSize: 14,
                    lineHeight: 1.6
                  }}>
                    {msg.role === 'assistant'
                      ? <div className="markdown" dangerouslySetInnerHTML={{ __html: renderedMessages[i] || '' }} />
                      : msg.content
                    }
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ alignSelf: 'flex-start' }}>
                  <div style={{ padding: '10px 14px', background: 'var(--bg-card-hover)', borderRadius: '12px 12px 12px 4px', border: '1px solid var(--border)' }}>
                    <span className="spinner" style={{ width: 16, height: 16 }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()}
                placeholder="Ask about this subject... (Enter to send)"
                disabled={!selectedSubjectId || loading}
                style={{ flex: 1 }}
              />
              <button
                className="btn btn-primary"
                onClick={sendChat}
                disabled={!chatInput.trim() || !selectedSubjectId || loading}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: 'var(--text-muted)' }}>
                <span className="spinner" style={{ width: 24, height: 24 }} />
                <span>Generating {mode}...</span>
              </div>
            ) : error ? (
              <div style={{ color: '#f87171', fontSize: 14 }}>{error}</div>
            ) : output ? (
              <div className="markdown" dangerouslySetInnerHTML={{ __html: renderedOutput }} />
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 60, fontSize: 14 }}>
                {selectedSubjectId && selectedResourceId
                  ? `Click "Generate ${mode}" to start`
                  : 'Select a subject and resource, then click Generate'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
