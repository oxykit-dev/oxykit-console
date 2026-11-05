import { describe, expect, it } from 'vitest'
import { canAccessApiKeysUi, canViewDashboard, defaultPostLoginRoute } from './roles'

describe('canViewDashboard', () => {
  it('allows Admin and User', () => {
    expect(canViewDashboard(['Admin'])).toBe(true)
    expect(canViewDashboard(['User'])).toBe(true)
    expect(canViewDashboard(['Admin', 'Sender'])).toBe(true)
  })

  it('denies Sender-only and empty', () => {
    expect(canViewDashboard(['Sender'])).toBe(false)
    expect(canViewDashboard([])).toBe(false)
    expect(canViewDashboard(null)).toBe(false)
  })
})

describe('defaultPostLoginRoute', () => {
  it('sends Sender-only to profile', () => {
    expect(defaultPostLoginRoute(['Sender'])).toBe('profile')
  })

  it('sends dashboard viewers to dashboard', () => {
    expect(defaultPostLoginRoute(['User'])).toBe('dashboard')
  })
})

describe('canAccessApiKeysUi', () => {
  it('matches dashboard visibility', () => {
    expect(canAccessApiKeysUi(['Sender'])).toBe(false)
    expect(canAccessApiKeysUi(['User'])).toBe(true)
  })
})
