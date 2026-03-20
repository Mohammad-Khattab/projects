// Test only pure utility functions that don't need a browser
import { slugify } from '../src/lib/scraper'

describe('slugify', () => {
  it('converts to lowercase with hyphens', () => {
    expect(slugify('CS 310')).toBe('cs-310')
  })
  it('removes special characters', () => {
    expect(slugify('Math & Physics 201!')).toBe('math--physics-201')
  })
  it('handles already-slugified input', () => {
    expect(slugify('data-structures')).toBe('data-structures')
  })
})
