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
  const [selectedChapter, setSelectedChapter] = useState('')   // chapter name or '' = all
  const [selectedResourceId, setSelectedResourceId] = useState('') // resource id or 'chapter' = whole chapter
  const [mode, setMode] = useState<Mode>('notes')
  const [output, setOutput] = useState('')
  const [renderedOutput, setRenderedOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // Chat: display messages (for UI only — server daemon holds the real history)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [renderedMessages, setRenderedMessages] = useState<string[]>([])
  const [chatInput, setChatInput] = useState('')
  const [historyLength, setHistoryLength] = useState(0)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const subject = subjects.find(s => s.id === selectedSubjectId)
  const subjectResources = resources.filter(r => r.subjectId === selectedSubjectId)

  // Build chapter list (preserving order of first appearance)
  const chapters = Array.from(
    new Map(subjectResources.map(r => [r.chapter || 'General', r.chapter || 'General'])).keys()
  )
  const chapterResources = selectedChapter
    ? subjectResources.filter(r => (r.chapter || 'General') === selectedChapter)
    : subjectResources

  // What to generate: either a single resource or all resources in the chapter
  const resource = selectedResourceId !== 'chapter'
    ? subjectResources.find(r => r.id === selectedResourceId)
    : undefined
  const isChapterMode = selectedResourceId === 'chapter'

  // Load display messages from localStorage when subject changes
  useEffect(() => {
    if (!selectedSubjectId) return
    const stored = localStorage.getItem(`chat-display-${selectedSubjectId}`)
    if (stored) {
      try { setMessages(JSON.parse(stored)) } catch {}
    } else {
      setMessages([])
    }
    setHistoryLength(0)
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
    if (!subject) return
    if (!isChapterMode && !resource) return
    setLoading(true)
    setOutput('')
    setError('')

    try {
      const body = isChapterMode
        ? {
            resources: chapterResources.map(r => ({ url: r.url, name: r.name })),
            subjectName: subject.name,
            mode,
            chapterName: selectedChapter || undefined,
          }
        : {
            resourceUrl: resource!.url,
            resourceName: resource!.name,
            subjectName: subject.name,
            mode,
          }

      const res = await fetch('/api/ai/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error((json as {error?: string}).error || `HTTP ${res.status}`)
      }

      const contentType = res.headers.get('Content-Type') || ''

      if (contentType.includes('text/plain')) {
        // Slides: streaming response — update output progressively
        const reader = res.body!.getReader()
        const decoder = new TextDecoder()
        let accumulated = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          accumulated += decoder.decode(value, { stream: true })
          setOutput(accumulated)
        }
      } else {
        // Notes: JSON response
        const json = await res.json()
        if (json.error) throw new Error(json.error)
        setOutput(json.content)
      }
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
      // Daemon chat: send only the new message — server maintains conversation history
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: selectedSubjectId,
          subjectName: subject.name,
          message: chatInput.trim(),
        })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const assistantMsg: ChatMessage = { role: 'assistant', content: json.reply }
      const updated = [...newMessages, assistantMsg]
      setMessages(updated)
      setHistoryLength(json.historyLength ?? 0)
      // Persist display messages in localStorage (for UI restore on page reload)
      localStorage.setItem(`chat-display-${selectedSubjectId}`, JSON.stringify(updated))
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  const clearChat = async () => {
    if (!selectedSubjectId) return
    // Clear server-side daemon history
    await fetch('/api/ai/chat', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subjectId: selectedSubjectId })
    })
    // Clear display
    setMessages([])
    setHistoryLength(0)
    localStorage.removeItem(`chat-display-${selectedSubjectId}`)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, height: 'calc(100vh - 120px)', minHeight: 500 }}>
      {/* Left panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>SUBJECT</label>
          <select value={selectedSubjectId} onChange={e => {
            setSelectedSubjectId(e.target.value)
            setSelectedChapter('')
            setSelectedResourceId('')
            setOutput('')
            setMessages([])
          }}>
            <option value="">Select subject...</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {selectedSubjectId && mode !== 'chat' && (
          <>
            {/* Step 1: pick chapter */}
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>CHAPTER</label>
              <select
                value={selectedChapter}
                onChange={e => { setSelectedChapter(e.target.value); setSelectedResourceId('') }}
              >
                <option value="">All resources</option>
                {chapters.map(ch => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
            </div>

            {/* Step 2: pick resource or whole chapter */}
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>RESOURCE</label>
              <select value={selectedResourceId} onChange={e => setSelectedResourceId(e.target.value)}>
                <option value="">Select…</option>
                <option value="chapter">
                  ✦ Entire {selectedChapter || 'subject'} ({chapterResources.length} files)
                </option>
                {chapterResources.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </>
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
            disabled={loading || (!isChapterMode && !resource)}
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

        {mode === 'chat' && messages.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button className="btn btn-ghost" onClick={clearChat} style={{ fontSize: 12 }}>
              ✕ Clear conversation
            </button>
            {historyLength > 0 && (
              <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
                {historyLength} turns in daemon memory
              </p>
            )}
          </div>
        )}
      </div>

      {/* Right panel */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {mode === 'chat' ? (
          <>
            <div style={{ flex: 1, overflow: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 60, fontSize: 14 }}>
                  {selectedSubjectId
                    ? <>Ask anything about <strong>{subject?.name}</strong>…<br /><span style={{ fontSize: 12 }}>Conversation history lives on the server</span></>
                    : 'Select a subject to start chatting'}
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
                placeholder="Ask about this subject… (Enter to send)"
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
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                {output ? (
                  // Slides streaming: show partial output while still loading
                  <div className="markdown" dangerouslySetInnerHTML={{ __html: renderedOutput }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
                    <span className="spinner" style={{ width: 24, height: 24 }} />
                    <span>Generating {mode}…</span>
                  </div>
                )}
              </div>
            ) : error ? (
              <div style={{ color: '#f87171', fontSize: 14 }}>{error}</div>
            ) : output ? (
              <div className="markdown" dangerouslySetInnerHTML={{ __html: renderedOutput }} />
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 60, fontSize: 14 }}>
                {selectedSubjectId && selectedResourceId
                  ? `Click "Generate ${mode}" to start`
                  : 'Select a subject, chapter, and resource'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
