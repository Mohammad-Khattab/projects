import '@testing-library/jest-dom'

// Polyfill crypto.randomUUID for jest/jsdom environments
if (!global.crypto?.randomUUID) {
  Object.defineProperty(global, 'crypto', {
    value: {
      ...global.crypto,
      randomUUID: () => Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2),
    },
    writable: true,
    configurable: true,
  })
}
