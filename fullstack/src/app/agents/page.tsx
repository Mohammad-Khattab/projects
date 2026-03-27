'use client'
import { useState, useEffect } from 'react'
import { useTasks } from './hooks/useTasks'
import Sidebar from './components/Sidebar'
import TaskModal from './components/TaskModal'
import VoiceFab from './components/VoiceFab'
import DashboardView from './components/views/DashboardView'
import TasksView from './components/views/TasksView'
import CalendarView from './components/views/CalendarView'
import AnalyticsView from './components/views/AnalyticsView'
import type { View, Task } from './types'

const VIEW_ORDER: View[] = ['dashboard', 'tasks', 'calendar', 'analytics']

export default function AgentsPage() {
  const [view, setView]               = useState<View>('dashboard')
  const [prevView, setPrevView]       = useState<View | null>(null)
  const [transitioning, setTransitioning] = useState(false)
  const [userName, setUserName]       = useState('Alex')
  const [modalTask, setModalTask]     = useState<Task | 'new' | null>(null)
  const { tasks, addTask, updateTask, deleteTask, toggleComplete } = useTasks()

  useEffect(() => {
    const stored = localStorage.getItem('agents_username')
    if (stored) setUserName(stored)
  }, [])

  const handleViewChange = (newView: View) => {
    if (newView === view || transitioning) return
    setPrevView(view)
    setTransitioning(true)
    setView(newView)
    setTimeout(() => { setPrevView(null); setTransitioning(false) }, 300)
  }

  const openNew   = () => setModalTask('new')
  const openEdit  = (t: Task) => setModalTask(t)
  const closeModal = () => setModalTask(null)

  const handleSave = (data: Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'completed'>) => {
    if (modalTask === 'new' || modalTask === null) { addTask(data) }
    else { updateTask(modalTask.id, data) }
  }

  const handleQuickAdd = (title: string) => {
    const d = new Date()
    const today = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    addTask({ title, description: '', priority: 'none', category: 'Work', dueDate: today })
  }

  const handleVoiceConfirm = (data: Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'completed'>) => {
    addTask(data)
  }

  const props = { tasks, onToggle: toggleComplete, onEdit: openEdit, onDelete: deleteTask }

  const direction = prevView
    ? VIEW_ORDER.indexOf(view) > VIEW_ORDER.indexOf(prevView) ? 'right' : 'left'
    : 'right'

  return (
    <div className="agents-root">
      <Sidebar view={view} onView={handleViewChange} userName={userName} onUserNameChange={setUserName} />

      <div className="agents-main">
        {/* Outgoing view */}
        {prevView && (
          <div className={`agents-view-container agents-view-exit-${direction === 'right' ? 'left' : 'right'}`}>
            {prevView === 'dashboard' && <DashboardView {...props} userName={userName} onAdd={handleQuickAdd} />}
            {prevView === 'tasks'     && <TasksView {...props} onOpenNew={openNew} />}
            {prevView === 'calendar'  && <CalendarView {...props} onOpenNew={openNew} />}
            {prevView === 'analytics' && <AnalyticsView tasks={tasks} />}
          </div>
        )}

        {/* Incoming view */}
        <div className={`agents-view-container ${prevView ? `agents-view-enter-${direction}` : ''}`}>
          {view === 'dashboard' && <DashboardView {...props} userName={userName} onAdd={handleQuickAdd} />}
          {view === 'tasks'     && <TasksView {...props} onOpenNew={openNew} />}
          {view === 'calendar'  && <CalendarView {...props} onOpenNew={openNew} />}
          {view === 'analytics' && <AnalyticsView tasks={tasks} />}
          {view !== 'calendar'  && <VoiceFab onConfirm={handleVoiceConfirm} />}
        </div>
      </div>

      {modalTask !== null && (
        <TaskModal
          task={modalTask === 'new' ? null : modalTask}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </div>
  )
}
