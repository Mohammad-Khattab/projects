'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import NavBar from '@/components/NavBar'
import ResourceList from '@/components/ResourceList'
import AssignmentList from '@/components/AssignmentList'
import NotesEditor from '@/components/NotesEditor'
import type { ScrapedData, Resource } from '@/lib/types'

type Tab = 'resources' | 'assignments' | 'notes'

export default function SubjectPage() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [data, setData] = useState<ScrapedData | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'resources')
  const [generatingId, setGeneratingId] = useState<string | undefined>()
  const [generatedContent, setGeneratedContent] = useState<string | null>(null)
  const [renderedContent, setRenderedContent] = useState('')

  useEffect(() => {
    fetch('/api/scrape').then(r => r.json()).then(json => setData(json.data))
  }, [])

  useEffect(() => {
    if (!generatedContent) return
    import('marked').then(({ marked }) => {
      setRenderedContent(marked.parse(generatedContent) as string)
    })
  }, [generatedContent])

  const subject = data?.subjects.find(s => s.id === id)
  const resources = data?.resources.filter(r => r.subjectId === id) || []
  const assignments = data?.assignments.filter(a => a.subjectId === id) || []

  const handleTab = (tab: Tab) => {
    setActiveTab(tab)
    router.replace(`/subject/${id}?tab=${tab}`, { scroll: false })
  }

  const handleGenerateNotes = useCallback(async (
    resourceOrResources: Resource | Resource[],
    mode: 'notes' | 'slides',
    chapterName?: string
  ) => {
    const isChapter = Array.isArray(resourceOrResources)
    const generatingKey = isChapter ? `chapter:${chapterName ?? 'group'}` : (resourceOrResources as Resource).id
    setGeneratingId(generatingKey)
    setGeneratedContent(null)
    try {
      const body = isChapter
        ? {
            resources: (resourceOrResources as Resource[]).map(r => ({ url: r.url, name: r.name })),
            subjectName: subject?.name || id,
            mode,
            chapterName
          }
        : {
            resourceUrl: (resourceOrResources as Resource).url,
            resourceName: (resourceOrResources as Resource).name,
            subjectName: subject?.name || id,
            mode
          }

      const res = await fetch('/api/ai/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const json = await res.json()
      if (json.error) {
        alert(`AI notes error: ${json.error}`)
        return
      }
      if (json.content) {
        setGeneratedContent(json.content)
        setActiveTab('notes')
      }
    } catch {
      alert('Failed to generate notes. Make sure Claude Code CLI is installed and running.')
    } finally {
      setGeneratingId(undefined)
    }
  }, [subject, id])

  if (!data) {
    return (
      <>
        <NavBar />
        <main className="page-container" style={{ paddingTop: 32 }}>
          <div className="skeleton" style={{ height: 32, width: 300, marginBottom: 24 }} />
          <div className="skeleton" style={{ height: 400 }} />
        </main>
      </>
    )
  }

  if (!subject) {
    return (
      <>
        <NavBar />
        <main className="page-container" style={{ paddingTop: 32 }}>
          <p style={{ color: 'var(--text-muted)' }}>Subject not found. <Link href="/">Go back</Link></p>
        </main>
      </>
    )
  }

  return (
    <>
      <NavBar scrapedAt={data.scrapedAt} />
      <main className="page-container" style={{ paddingTop: 32, paddingBottom: 48 }}>
        <div style={{ marginBottom: 24 }}>
          <Link href="/" style={{ fontSize: 13, color: 'var(--text-muted)' }}>← Dashboard</Link>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>{subject.name}</h1>
              {subject.instructor && (
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
                  {subject.instructor}
                </p>
              )}
            </div>
            <Link href="/ai" className="btn btn-primary" style={{ fontSize: 13 }}>
              ✦ AI Studio
            </Link>
          </div>
        </div>

        <div className="tabs">
          <button className={`tab ${activeTab === 'resources' ? 'active' : ''}`} onClick={() => handleTab('resources')}>
            Resources ({resources.length})
          </button>
          <button className={`tab ${activeTab === 'assignments' ? 'active' : ''}`} onClick={() => handleTab('assignments')}>
            Assignments ({assignments.length})
          </button>
          <button className={`tab ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => handleTab('notes')}>
            My Notes
          </button>
        </div>

        {activeTab === 'resources' && (
          <ResourceList
            resources={resources}
            subjectName={subject.name}
            onGenerateNotes={handleGenerateNotes}
            generatingId={generatingId}
          />
        )}
        {activeTab === 'assignments' && <AssignmentList assignments={assignments} />}
        {activeTab === 'notes' && (
          <NotesEditor
            subjectId={subject.id}
            subjectName={subject.name}
            resources={resources}
          />
        )}

        {generatedContent && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: 24
          }}>
            <div className="card" style={{ maxWidth: 760, width: '100%', maxHeight: '80vh', overflow: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16 }}>Generated Notes</h3>
                <button className="btn btn-ghost" style={{ padding: '4px 10px' }} onClick={() => setGeneratedContent(null)}>✕</button>
              </div>
              <div className="markdown" dangerouslySetInnerHTML={{ __html: renderedContent }} />
            </div>
          </div>
        )}
      </main>
    </>
  )
}
