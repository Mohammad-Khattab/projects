'use client'

interface RefreshLoaderProps {
  done: boolean
}

export default function RefreshLoader({ done }: RefreshLoaderProps) {
  return (
    <div className={`mmkl-loader${done ? ' done' : ''}`}>
      <div className="mmkl-loader-logo">MMKL</div>
      <div className="mmkl-loader-track">
        <div className="mmkl-loader-bar" />
      </div>
      <div className="mmkl-loader-label">Loading universe...</div>
    </div>
  )
}
