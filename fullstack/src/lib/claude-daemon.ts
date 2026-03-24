/**
 * Claude Chat Daemon
 * A module-level singleton that keeps per-subject conversation history alive
 * in server memory between requests. Client only sends new message each turn.
 */
import { spawn } from 'child_process'

interface Session {
  subjectName: string
  history: Array<{ role: 'user' | 'assistant'; content: string }>
  lastUsed: number
}

function spawnClaudeOnce(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn('claude', ['-p'], {
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    proc.stdout.on('data', (d: Buffer) => { stdout += d.toString() })
    proc.stderr.on('data', (d: Buffer) => { stderr += d.toString() })
    proc.on('close', (code: number) => {
      if (code !== 0) reject(new Error(stderr.trim() || `Claude exited with code ${code}`))
      else resolve(stdout.trim())
    })
    proc.stdin.write(prompt.replace(/\0/g, ''), 'utf8')
    proc.stdin.end()
  })
}

async function spawnClaude(prompt: string, retries = 3, delayMs = 5000): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await spawnClaudeOnce(prompt)
    } catch (err) {
      const isRateLimit = /rate.?limit/i.test(String(err))
      if (isRateLimit && attempt < retries) {
        await new Promise(r => setTimeout(r, delayMs * Math.pow(2, attempt)))
        continue
      }
      throw err
    }
  }
  throw new Error('Unreachable')
}

class ClaudeDaemon {
  private sessions = new Map<string, Session>()

  private gc() {
    // Evict sessions idle for more than 2 hours
    const cutoff = Date.now() - 2 * 60 * 60 * 1000
    for (const [id, s] of this.sessions) {
      if (s.lastUsed < cutoff) this.sessions.delete(id)
    }
  }

  private getOrCreate(subjectId: string, subjectName: string): Session {
    if (!this.sessions.has(subjectId)) {
      this.sessions.set(subjectId, { subjectName, history: [], lastUsed: Date.now() })
    }
    const s = this.sessions.get(subjectId)!
    s.lastUsed = Date.now()
    return s
  }

  async send(subjectId: string, subjectName: string, message: string, context?: string): Promise<string> {
    this.gc()
    const session = this.getOrCreate(subjectId, subjectName)
    session.history.push({ role: 'user', content: message })

    const systemCtx = [
      `You are a helpful study assistant for a university student studying "${session.subjectName}".`,
      context ? `Relevant course material:\n\n${context}\n\n---` : '',
      'Provide clear, concise answers. Format responses with markdown.',
    ].filter(Boolean).join('\n')

    const historyText = session.history
      .map(m => `${m.role === 'assistant' ? 'Assistant' : 'User'}: ${m.content}`)
      .join('\n\n')

    const prompt = `${systemCtx}\n\nConversation:\n\n${historyText}\n\nAssistant:`

    const reply = await spawnClaude(prompt)
    session.history.push({ role: 'assistant', content: reply })
    return reply
  }

  clear(subjectId: string) {
    this.sessions.delete(subjectId)
  }

  historyLength(subjectId: string): number {
    return this.sessions.get(subjectId)?.history.length ?? 0
  }
}

// Singleton — lives for the lifetime of the Next.js server process
export const claudeDaemon = new ClaudeDaemon()
