import '@testing-library/jest-dom'

// Polyfill setImmediate for jsdom environment (not available in jsdom but needed for async test flushing)
// Uses queueMicrotask so fake timers (jest.useFakeTimers) don't intercept it
if (typeof global.setImmediate === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).setImmediate = (fn: (...args: unknown[]) => void, ...args: unknown[]) => {
    queueMicrotask(() => fn(...args))
    return 0
  }
}

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
