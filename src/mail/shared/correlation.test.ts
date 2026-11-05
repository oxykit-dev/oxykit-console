import { afterEach, describe, expect, it } from 'vitest'
import { getCorrelationId } from './correlation'

afterEach(() => {
  sessionStorage.clear()
})

describe('getCorrelationId', () => {
  it('reuses the same id within a session', () => {
    const a = getCorrelationId()
    const b = getCorrelationId()
    expect(a).toBe(b)
    expect(a.length).toBeGreaterThan(8)
  })
})
