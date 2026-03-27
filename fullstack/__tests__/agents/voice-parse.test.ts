jest.mock('@anthropic-ai/sdk', () => {
  const MockAnthropic = jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify({
          title: 'English assignment',
          dueDate: '2026-03-28',
          priority: 'medium',
          category: 'Work',
          confidence: 0.9,
        })}]
      })
    }
  }))
  return {
    __esModule: true,
    default: MockAnthropic,
  }
})

describe('parseTranscript', () => {
  it('extracts task fields from transcript', async () => {
    const { parseTranscript } = await import('../../src/app/api/voice-parse/route')
    const result = await parseTranscript('Tomorrow I have an English assignment I need to do', '2026-03-27')
    expect(result.title).toBe('English assignment')
    expect(result.dueDate).toBe('2026-03-28')
    expect(result.category).toBe('Work')
    expect(result.confidence).toBeGreaterThan(0)
  })
})
