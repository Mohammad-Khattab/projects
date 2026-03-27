'use client'
import { useState, useEffect } from 'react'
import { useTasks } from './hooks/useTasks'
import Sidebar from './components/Sidebar'
import RightPanel from './components/RightPanel'
import TaskModal from './components/TaskModal'
import VoiceFab from './components/VoiceFab'
import DashboardView from './components/views/DashboardView'
import TasksView from './components/views/TasksView'
import CalendarView from './components/views/CalendarView'
import AnalyticsView from './components/views/AnalyticsView'
import type { View, Task } from './types'

export default function AgentsPage() {
  const [view, setView] = useState<View>('dashboard')
  const [userName, setUserName] = useState('Alex')
  const [modalTask, setModalTask] = useState<Task | 'new' | null>(null)
  const { tasks, addTask, updateTask, deleteTask, toggleComplete } = useTasks()

  useEffect(() => {
    const stored = localStorage.getItem('agents_username')
    if (stored) setUserName(stored)
  }, [])

  const openNew = () => setModalTask('new')
  const openEdit = (t: Task) => setModalTask(t)
  const closeModal = () => setModalTask(null)

  const handleSave = (data: Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'completed'>) => {
    if (modalTask === 'new' || modalTask === null) {
      addTask(data)
    } else {
      updateTask(modalTask.id, data)
    }
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

  return (
    <div className="agents-root">
      <Sidebar view={view} onView={setView} userName={userName} onUserNameChange={setUserName} />

      <div className="agents-main" style={{ position: 'relative' }}>
        {view === 'dashboard' && (
          <DashboardView {...props} userName={userName} onAdd={handleQuickAdd} />
        )}
        {view === 'tasks' && (
          <TasksView {...props} onOpenNew={openNew} />
        )}
        {view === 'calendar' && (
          <CalendarView {...props} onOpenNew={openNew} />
        )}
        {view === 'analytics' && (
          <AnalyticsView tasks={tasks} />
        )}

        {view !== 'calendar' && (
          <VoiceFab onConfirm={handleVoiceConfirm} />
        )}
      </div>

      <RightPanel tasks={tasks} />

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
