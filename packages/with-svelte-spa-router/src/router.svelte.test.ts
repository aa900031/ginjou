// @vitest-environment happy-dom

import type { RouterBlockerController } from '@ginjou/core'
import type { SpaRouter } from './router.svelte'
import { mount, unmount } from 'svelte'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import RouterHost from '../test/RouterHost.svelte'

let router: SpaRouter
let app: Record<string, any> | undefined

/** The last test tears the host down itself, so `afterEach` must not do it twice. */
function destroyHost(): void {
	if (app == null)
		return

	unmount(app)
	app = undefined
}

function register(
	shouldBlock: Parameters<NonNullable<SpaRouter['blocker']>>[0],
): RouterBlockerController {
	return router.blocker!(shouldBlock)
}

function dispatchBeforeUnload(): Event {
	const event = new Event('beforeunload', { cancelable: true })
	window.dispatchEvent(event)
	return event
}

beforeEach(async () => {
	window.location.hash = '#/posts'
	// `hashchange` is what tells `svelte-spa-router` about the new hash, and it is queued.
	await new Promise(resolve => setTimeout(resolve, 0))
	app = mount(RouterHost, {
		target: document.body,
		props: {
			onready: (value: SpaRouter) => {
				router = value
			},
		},
	})
})

afterEach(() => {
	destroyHost()
	document.body.innerHTML = ''
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
				currentLocation: expect.objectContaining({ path: '/posts' }),
				nextLocation: undefined,
			})
		})

		it('should not prevent unload after dispose', () => {
			register(() => true).dispose()

			expect(dispatchBeforeUnload().defaultPrevented).toBe(false)
		})

		it('should stop preventing unload after the router is destroyed', () => {
			register(() => true)
			expect(dispatchBeforeUnload().defaultPrevented).toBe(true)

			destroyHost()

			expect(dispatchBeforeUnload().defaultPrevented).toBe(false)
		})
	})
})
