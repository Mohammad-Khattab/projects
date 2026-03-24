'use client'

import { useEffect, useRef } from 'react'

interface WaveGridProps {
  className?: string
  /** Override stroke color. If omitted, reads --grid-color CSS var each frame. */
  color?: string
}

const COLS  = 28
const ROWS  = 20
const PAD   = 2
const FOV   = 520
const CAM_Z = 380
const AMP   = 72
const SPEED = 0.55

export default function WaveGrid({ className, color }: WaveGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let t = 0
    let lastTs = 0
    let rafId = 0

    function fit() {
      if (!canvas) return
      const w = canvas.offsetWidth  || window.innerWidth
      const h = canvas.offsetHeight || window.innerHeight
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width  = w
        canvas.height = h
      }
    }

    function waveZ(col: number, row: number, totalCols: number, totalRows: number) {
      const cx = col / totalCols
      const cy = row / totalRows
      return (
        Math.sin(cx * Math.PI * 3.5 + t * SPEED)             * AMP * 0.55 +
        Math.sin(cy * Math.PI * 2.8 + t * SPEED * 0.75)      * AMP * 0.45 +
        Math.sin((cx + cy) * Math.PI * 2 + t * SPEED * 1.2)  * AMP * 0.35
      )
    }

    function getColor() {
      if (color) return color
      const el = document.querySelector('.mmkl-root') ?? document.documentElement
      return (
        getComputedStyle(el)
          .getPropertyValue('--grid-color')
          .trim() || 'rgba(255,255,255,0.1)'
      )
    }

    function draw(ts: number) {
      if (!canvas) return
      const dt = Math.min((ts - lastTs) / 1000, 0.05)
      lastTs = ts
      t += dt

      fit()
      const W = canvas.width
      const H = canvas.height
      const ctx = canvas.getContext('2d')!

      const totalCols = COLS + PAD * 2
      const totalRows = ROWS + PAD * 2
      const cellW = W / COLS
      const cellH = H / ROWS

      function proj(wx: number, wy: number, wz: number) {
        const scale = FOV / (FOV + CAM_Z - wz)
        return {
          sx: W / 2 + (wx - W / 2) * scale,
          sy: H / 2 + (wy - H / 2) * scale,
        }
      }

      const pts: Array<Array<{ sx: number; sy: number }>> = []
      for (let r = 0; r <= totalRows; r++) {
        pts[r] = []
        for (let c = 0; c <= totalCols; c++) {
          const wx = (c - PAD) * cellW
          const wy = (r - PAD) * cellH
          const wz = waveZ(c, r, totalCols, totalRows)
          pts[r][c] = proj(wx, wy, wz)
        }
      }

      ctx.clearRect(0, 0, W, H)
      ctx.strokeStyle = getColor()

      ctx.lineWidth = 1.1
      ctx.globalAlpha = 0.85
      for (let r = 0; r <= totalRows; r++) {
        ctx.beginPath()
        for (let c = 0; c <= totalCols; c++) {
          const { sx, sy } = pts[r][c]
          c === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy)
        }
        ctx.stroke()
      }

      ctx.lineWidth = 0.9
      ctx.globalAlpha = 0.65
      for (let c = 0; c <= totalCols; c++) {
        ctx.beginPath()
        for (let r = 0; r <= totalRows; r++) {
          const { sx, sy } = pts[r][c]
          r === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy)
        }
        ctx.stroke()
      }

      ctx.globalAlpha = 1
      rafId = requestAnimationFrame(draw)
    }

    fit()
    window.addEventListener('resize', fit)
    rafId = requestAnimationFrame(ts => { lastTs = ts; rafId = requestAnimationFrame(draw) })

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', fit)
    }
  }, [color])

  return <canvas ref={canvasRef} className={className} />
}
