// @vitest-environment happy-dom

import type { Router, RouterBlockerHandle } from '@ginjou/core'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { createRouter } from './router.svelte'

// `createRouter()` is meant to run during component init, so `onDestroy` is stubbed
// to expose the teardown the test can call by hand.
const mocks = vi.hoisted(() => ({
	onDestroy: vi.fn(),
}))

vi.mock('svelte', async importOriginal => ({
	...await importOriginal<typeof import('svelte')>(),
	onDestroy: mocks.onDestroy,
}))

let router: Router
const handles: RouterBlockerHandle[] = []

function register(
	shouldBlock: Parameters<NonNullable<Router['blocker']>>[0],
): RouterBlockerHandle {
	const handle = router.blocker!(shouldBlock)
	handles.push(handle)
	return handle
}

function dispatchBeforeUnload(): Event {
	const event = new Event('beforeunload', { cancelable: true })
	window.dispatchEvent(event)
	return event
}

// `createRouter()` registers a global `beforeunload` listener, so it is created once
// for the whole file and every blocker is unregistered between tests.
beforeAll(() => {
	router = createRouter()
})

afterEach(() => {
	handles.splice(0).forEach(handle => handle.unregister())
})

describe('createRouter', () => {
	describe('blocker (beforeunload)', () => {
		it('should prevent unload when shouldBlock returns true', () => {
			register(() => true)

			expect(dispatchBeforeUnload().defaultPrevented).toBe(true)
		})

		it('should not prevent unload when shouldBlock returns false', () => {
			register(() => false)

			expect(dispatchBeforeUnload().defaultPrevented).toBe(false)
		})

		it('should pass the unload context', () => {
			const shouldBlock = vi.fn(() => false)
			register(shouldBlock)

			dispatchBeforeUnload()

			expect(shouldBlock).toHaveBeenCalledWith({
				currentLocation: expect.objectContaining({ path: expect.any(String) }),
				nextLocation: undefined,
				action: 'unload',
			})
		})

		it('should not prevent unload after unregister', () => {
			register(() => true).unregister()

			expect(dispatchBeforeUnload().defaultPrevented).toBe(false)
		})

		it('should stop preventing unload after the router is destroyed', () => {
			mocks.onDestroy.mockClear()
			const scoped = createRouter()
			const handle = scoped.blocker!(() => true)

			expect(dispatchBeforeUnload().defaultPrevented).toBe(true)

			mocks.onDestroy.mock.calls[0][0]()

			expect(dispatchBeforeUnload().defaultPrevented).toBe(false)

			handle.unregister()
		})
	})
})
