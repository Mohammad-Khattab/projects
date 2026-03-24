import { TOTAL_PROJECTS } from '@/data/mmkl'

export default function DashboardNav() {
  return (
    <nav className="mmkl-nav">
      <a className="mmkl-nav-logo" href="#">
        <span className="mmkl-glass">MMKL</span>
      </a>
      <ul className="mmkl-nav-links">
        <li><a href="#gaming">Gaming</a></li>
        <li><a href="#productivity">Productivity</a></li>
        <li><a href="#tools">Tools</a></li>
      </ul>
      <div className="mmkl-nav-pill">{TOTAL_PROJECTS} projects</div>
    </nav>
  )
}
