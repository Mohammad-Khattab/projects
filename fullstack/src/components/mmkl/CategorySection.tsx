'use client'

import { useEffect, useRef } from 'react'
import type { MmklCategory } from '@/data/mmkl'
import ProjectCard from './ProjectCard'

interface CategorySectionProps {
  category: MmklCategory
  hiddenIds: string[]
  onRemove: (id: string) => void
}

const ENTRANCE_DIRS = ['enter-left', 'enter-below', 'enter-right'] as const

export default function CategorySection({ category, hiddenIds, onRemove }: CategorySectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  // Scroll reveal for header + cards
  useEffect(() => {
    const targets: Element[] = []
    if (headerRef.current) targets.push(headerRef.current)
    sectionRef.current?.querySelectorAll('.mmkl-card').forEach(el => targets.push(el))

    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            obs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    )
    targets.forEach(t => obs.observe(t))
    return () => obs.disconnect()
  }, [hiddenIds]) // re-run if hidden list changes so newly visible cards get observed

  return (
    <section ref={sectionRef} id={category.id} className="mmkl-cat-section">
      <div className="mmkl-cat-header" ref={headerRef}>
        <div className="mmkl-cat-icon">{category.icon}</div>
        <div className="mmkl-cat-title">{category.title}</div>
        <div className="mmkl-cat-count">{category.projects.length} projects</div>
        <div className="mmkl-cat-line" />
      </div>
      <div className="mmkl-cards-scene">
        <div className="mmkl-cards-grid">
          {category.projects.map((project, i) => {
            const dir      = project.featured ? 'enter-below' : ENTRANCE_DIRS[i % 3]
            const delay    = `${(i * 0.9 % 3.5 + 0.8).toFixed(2)}s`
            const duration = `${(5 + (i % 4) * 0.7).toFixed(1)}s`

            return (
              <ProjectCard
                key={project.id}
                project={project}
                hidden={hiddenIds.includes(project.id)}
                entranceClass={dir}
                floatDelay={delay}
                floatDur={duration}
                onRemove={onRemove}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
