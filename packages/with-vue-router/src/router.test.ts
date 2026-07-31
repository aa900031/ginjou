// @vitest-environment happy-dom

import type { Router, RouterBlockerHandle } from '@ginjou/core'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { createApp } from 'vue'
import { createMemoryHistory, createRouter as createVueRouter } from 'vue-router'
import { createRouter } from './router'

let router: Router
let vueRouter: ReturnType<typeof createVueRouter>
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
beforeAll(async () => {
	vueRouter = createVueRouter({
		history: createMemoryHistory(),
		routes: [
			{ path: '/', component: { render: () => null } },
			{ path: '/other', component: { render: () => null } },
			{ path: '/posts/:id', alias: '/p/:id', component: { render: () => null } },
		],
	})

	const app = createApp({
		setup: () => {
			router = createRouter()
			return () => null
		},
	})
	app.use(vueRouter)
	await vueRouter.isReady()
	app.mount(document.createElement('div'))
})

afterEach(async () => {
	handles.splice(0).forEach(handle => handle.unregister())
	await vueRouter.replace('/')
})

describe('createRouter', () => {
	describe('blocker (route leave)', () => {
		it('should let the navigation through when nothing blocks', async () => {
			register(() => false)

			await vueRouter.push('/other')

			expect(vueRouter.currentRoute.value.path).toBe('/other')
		})

		it('should suspend the navigation until proceed', async () => {
			const shouldBlock = vi.fn(() => true)
			const handle = register(shouldBlock)

			const navigation = vueRouter.push('/other')
			await vi.waitFor(() => expect(shouldBlock).toHaveBeenCalled())
			expect(vueRouter.currentRoute.value.path).toBe('/')

			handle.proceed()
			await navigation

			expect(vueRouter.currentRoute.value.path).toBe('/other')
		})

		it('should cancel the navigation on reset', async () => {
			const shouldBlock = vi.fn(() => true)
			const handle = register(shouldBlock)

			const navigation = vueRouter.push('/other')
			await vi.waitFor(() => expect(shouldBlock).toHaveBeenCalled())
			handle.reset()
			await navigation

			expect(vueRouter.currentRoute.value.path).toBe('/')
		})

		it('should ask the blockers one by one', async () => {
			const first = vi.fn(() => true)
			const second = vi.fn(() => true)
			const firstHandle = register(first)
			register(second)

			const navigation = vueRouter.push('/other')
			await vi.waitFor(() => expect(first).toHaveBeenCalled())
			expect(second).not.toHaveBeenCalled()

			firstHandle.proceed()
			await vi.waitFor(() => expect(second).toHaveBeenCalled())
			expect(vueRouter.currentRoute.value.path).toBe('/')

			handles[1].proceed()
			await navigation

			expect(vueRouter.currentRoute.value.path).toBe('/other')
		})

		it('should pass the leave context', async () => {
			const shouldBlock = vi.fn(() => false)
			register(shouldBlock)

			await vueRouter.push('/other')

			expect(shouldBlock).toHaveBeenCalledWith({
				currentLocation: expect.objectContaining({ path: '/' }),
				nextLocation: expect.objectContaining({ path: '/other' }),
				action: 'push',
			})
		})

		it('should not block when the route record stays matched', async () => {
			await vueRouter.push('/posts/1')
			const shouldBlock = vi.fn(() => true)
			register(shouldBlock)

			await vueRouter.push('/posts/2')

			expect(shouldBlock).not.toHaveBeenCalled()
			expect(vueRouter.currentRoute.value.path).toBe('/posts/2')
		})

		it('should not block when only the query changes', async () => {
			await vueRouter.push('/posts/1')
			const shouldBlock = vi.fn(() => true)
			register(shouldBlock)

			await vueRouter.push('/posts/1?page=2')

			expect(shouldBlock).not.toHaveBeenCalled()
			expect(vueRouter.currentRoute.value.query).toEqual({ page: '2' })
		})

		it('should not block when the next route is an alias of the current record', async () => {
			await vueRouter.push('/posts/1')
			const shouldBlock = vi.fn(() => true)
			register(shouldBlock)

			await vueRouter.push('/p/2')

			expect(shouldBlock).not.toHaveBeenCalled()
			expect(vueRouter.currentRoute.value.path).toBe('/p/2')
		})

		it('should not block after unregister', async () => {
			register(() => true).unregister()

			await vueRouter.push('/other')

			expect(vueRouter.currentRoute.value.path).toBe('/other')
		})
	})

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
				currentLocation: expect.objectContaining({ path: '/' }),
				nextLocation: undefined,
				action: 'unload',
			})
		})

		it('should not prevent unload after unregister', () => {
			register(() => true).unregister()

			expect(dispatchBeforeUnload().defaultPrevented).toBe(false)
		})
	})
})
