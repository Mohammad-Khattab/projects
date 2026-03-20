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

export interface ScrapedData {
  subjects: Subject[]
  resources: Resource[]
  assignments: Assignment[]
  scrapedAt: string
  stale?: boolean
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
