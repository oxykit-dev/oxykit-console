import { afterEach, describe, expect, it, vi } from 'vitest'
import { applyModuleConfig, loadModuleConfig, modules } from './modules'

afterEach(() => {
  applyModuleConfig({ mail: true, render: true, flow: true })
  vi.unstubAllGlobals()
})

describe('config.json modules', () => {
  it('turns a module off and leaves the others on', () => {
    applyModuleConfig({ render: false })
    expect(modules.mail).toBe(true)
    expect(modules.render).toBe(false)
    expect(modules.flow).toBe(true)
  })

  it('treats 0 and "false" as off', () => {
    applyModuleConfig({ mail: 0, flow: 'false' })
    expect(modules.mail).toBe(false)
    expect(modules.render).toBe(true)
    expect(modules.flow).toBe(false)
  })

  it('reads config.json before routes are registered', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ flow: false }), { status: 200 })),
    )
    await loadModuleConfig()
    expect(modules.flow).toBe(false)
    expect(fetch).toHaveBeenCalledWith('/config.json', { cache: 'no-store' })
  })
})
