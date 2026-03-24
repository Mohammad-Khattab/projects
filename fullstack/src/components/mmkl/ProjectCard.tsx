'use client'

import { useEffect, useRef } from 'react'
import type { MmklProject } from '@/data/mmkl'

interface ProjectCardProps {
  project: MmklProject
  hidden: boolean
  entranceClass: string
  floatDelay: string
  floatDur: string
  onRemove: (id: string) => void
}

export default function ProjectCard({
  project,
  hidden,
  entranceClass,
  floatDelay,
  floatDur,
  onRemove,
}: ProjectCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null)

  // 3D tilt + glare on hover
  useEffect(() => {
    const el = cardRef.current
    if (!el) return

    const glare = el.querySelector<HTMLDivElement>('.mmkl-card-glare')

    function onMove(e: MouseEvent) {
      const r  = el!.getBoundingClientRect()
      const dx = ((e.clientX - r.left) / r.width  - 0.5) * 2
      const dy = ((e.clientY - r.top)  / r.height - 0.5) * 2
      el!.style.transform = `perspective(900px) translateY(-10px) translateZ(24px) rotateX(${-dy * 8}deg) rotateY(${dx * 8}deg)`
      if (glare) {
        glare.style.setProperty('--gx', ((e.clientX - r.left) / r.width  * 100).toFixed(1) + '%')
        glare.style.setProperty('--gy', ((e.clientY - r.top)  / r.height * 100).toFixed(1) + '%')
      }
    }
    function onLeave() { el!.style.transform = '' }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  if (hidden) return null

  if (project.featured) {
    return (
      <a
        ref={cardRef}
        className={`mmkl-card featured ${entranceClass}`}
        href={project.href}
        target="_blank"
        rel="noreferrer"
        data-id={project.id}
        style={{ '--float-delay': floatDelay, '--float-dur': floatDur } as React.CSSProperties}
      >
        <div className="mmkl-featured-inner">
          <div className="mmkl-featured-viz">{project.featuredViz}</div>
          <div className="mmkl-featured-body">
            <div className="mmkl-card-type">{project.type}</div>
            <div className="mmkl-card-title">{project.title}</div>
            <div className="mmkl-card-desc">{project.desc}</div>
            <div className="mmkl-card-footer">
              <span className="mmkl-card-tag">{project.tag}</span>
              <i className="mmkl-card-arrow">↗</i>
            </div>
          </div>
        </div>
        <div className="mmkl-card-glare" />
        <button
          className="mmkl-card-remove"
          title="Hide project"
          onClick={e => { e.preventDefault(); e.stopPropagation(); onRemove(project.id) }}
        >✕</button>
      </a>
    )
  }

  return (
    <a
      ref={cardRef}
      className={`mmkl-card ${entranceClass}`}
      href={project.href}
      target="_blank"
      rel="noreferrer"
      data-id={project.id}
      style={{ '--float-delay': floatDelay, '--float-dur': floatDur } as React.CSSProperties}
    >
      <div className="mmkl-card-icon">{project.icon}</div>
      <div className="mmkl-card-type">{project.type}</div>
      <div className="mmkl-card-title">{project.title}</div>
      <div className="mmkl-card-desc">{project.desc}</div>
      <div className="mmkl-card-footer">
        <span className="mmkl-card-tag">{project.tag}</span>
        <i className="mmkl-card-arrow">↗</i>
      </div>
      <div className="mmkl-card-glare" />
      <button
        className="mmkl-card-remove"
        title="Hide project"
        onClick={e => { e.preventDefault(); e.stopPropagation(); onRemove(project.id) }}
      >✕</button>
    </a>
  )
}
