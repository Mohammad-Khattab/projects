import * as fs from 'fs'
import * as path from 'path'
import type { ScrapedData, SubjectNotes } from './types'

function getDataDir(): string {
  return process.env.DATA_DIR_OVERRIDE || path.join(process.cwd(), 'data')
}

export function ensureDataDir(): void {
  const dir = getDataDir()
  fs.mkdirSync(path.join(dir, 'notes'), { recursive: true })
}

export function readScrapedData(): ScrapedData | null {
  try {
    const file = path.join(getDataDir(), 'subjects.json')
    const raw = fs.readFileSync(file, 'utf-8')
    return JSON.parse(raw) as ScrapedData
  } catch {
    return null
  }
}

export function writeScrapedData(data: ScrapedData): void {
  ensureDataDir()
  const file = path.join(getDataDir(), 'subjects.json')
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8')
}

export function readNotes(subjectId: string): SubjectNotes | null {
  try {
    const file = path.join(getDataDir(), 'notes', `${subjectId}.json`)
    const raw = fs.readFileSync(file, 'utf-8')
    return JSON.parse(raw) as SubjectNotes
  } catch {
    return null
  }
}

export function writeNotes(subjectId: string, content: string): void {
  ensureDataDir()
  const file = path.join(getDataDir(), 'notes', `${subjectId}.json`)
  const data: SubjectNotes = { subjectId, content, updatedAt: new Date().toISOString() }
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8')
}

export function readCookies(): object[] | null {
  try {
    const file = path.join(getDataDir(), 'cookies.json')
    const raw = fs.readFileSync(file, 'utf-8')
    return JSON.parse(raw) as object[]
  } catch {
    return null
  }
}

export function writeCookies(cookies: object[]): void {
  ensureDataDir()
  const file = path.join(getDataDir(), 'cookies.json')
  fs.writeFileSync(file, JSON.stringify(cookies, null, 2), 'utf-8')
}

export function readTeamsCookies(): object[] | null {
  try {
    const file = path.join(getDataDir(), 'teams-cookies.json')
    const raw = fs.readFileSync(file, 'utf-8')
    return JSON.parse(raw) as object[]
  } catch {
    return null
  }
}

export function writeTeamsCookies(cookies: object[]): void {
  ensureDataDir()
  const file = path.join(getDataDir(), 'teams-cookies.json')
  fs.writeFileSync(file, JSON.stringify(cookies, null, 2), 'utf-8')
}

export function teamsConnected(): boolean {
  try {
    const file = path.join(getDataDir(), 'teams-cookies.json')
    return fs.existsSync(file)
  } catch {
    return false
  }
}
