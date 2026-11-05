import { describe, expect, it } from 'vitest'
import { afterLoginLocation, loginLocation, needsSession } from './gate'

describe('session gate', () => {
  it('sends unsigned Render and Flow visits to /login', () => {
    expect(needsSession({ name: 'render', meta: {} })).toBe(true)
    expect(needsSession({ name: 'flow', meta: {} })).toBe(true)
    expect(needsSession({ name: 'login', meta: {} })).toBe(false)
    expect(loginLocation('/render')).toEqual({
      name: 'login',
      query: { returnUrl: '/render' },
    })
  })

  it('returns to the page that asked for a session', () => {
    expect(afterLoginLocation(['Admin'], '/flow')).toBe('/flow')
  })

  it('opens the mail dashboard when there is no return path', () => {
    expect(afterLoginLocation(['Admin'])).toEqual({ name: 'dashboard' })
    expect(afterLoginLocation(['Sender'])).toEqual({ name: 'profile' })
  })
})
