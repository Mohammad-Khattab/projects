'use client'
import { useEffect, useState } from 'react'
import type { TokenApiResponse } from '../types'

export function useTokenUsage() {
  const [data, setData] = useState<TokenApiResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const res = await fetch('/api/tokens', { cache: 'no-store' })
      if (res.ok) setData(await res.json())
    } catch { /* non-fatal */ }
    finally { setLoading(false) }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30_000)
    return () => clearInterval(interval)
  }, [])

  return { data, loading }
}
