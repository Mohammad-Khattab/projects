export interface Subject {
  id: string
  name: string
  instructor: string
  source: 'moodle' | 'mygju' | 'both'
  resourceCount: number
  assignmentCount: number
}

export interface Resource {
  id: string
  subjectId: string
  name: string
  type: 'pdf' | 'doc' | 'link' | 'video' | 'file'
  url: string
  uploadedAt?: string
}

export interface Assignment {
  id: string
  subjectId: string
  title: string
  dueDate: string
  description?: string
  submitted: boolean
}

export interface ScheduleSlot {
  day: 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu'
  startTime: string  // "08:30"
  endTime: string    // "10:00"
  room: string
}

export interface CourseSchedule {
  courseId: string      // "ENGL1001"
  courseName: string    // "Upper Intermediate English"
  section: string       // "9"
  instructor: string
  credits: number
  slots: ScheduleSlot[]
  color: string         // CSS color for calendar display
}

export interface ScrapedData {
  subjects: Subject[]
  resources: Resource[]
  assignments: Assignment[]
  scrapedAt: string
  stale?: boolean
  schedule?: CourseSchedule[]
}

export interface SubjectNotes {
  subjectId: string
  content: string
  updatedAt: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
