'use client'

import { useState, useEffect } from 'react'
import NavBar from '@/components/NavBar'
import AIPanel from '@/components/AIPanel'
import type { ScrapedData } from '@/lib/types'

export default function AIStudioPage() {
  const [data, setData] = useState<ScrapedData | null>(null)

  useEffect(() => {
    fetch('/api/scrape').then(r => r.json()).then(json => setData(json.data))
  }, [])

  return (
    <>
      <NavBar scrapedAt={data?.scrapedAt} />
      <main className="page-container" style={{ paddingTop: 28, paddingBottom: 24 }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>✦ AI Studio</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
            Generate study notes, slide decks, or chat with your course materials
          </p>
        </div>
        <AIPanel
          subjects={data?.subjects || []}
          resources={data?.resources || []}
        />
      </main>
    </>
  )
}
