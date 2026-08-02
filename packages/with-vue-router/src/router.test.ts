// @vitest-environment happy-dom

import type { Router, RouterBlockerHandle } from '@ginjou/core'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { createApp, h } from 'vue'
import { createMemoryHistory, createRouter as createVueRouter, RouterView } from 'vue-router'
import { createRouter } from './router'

let router: Router
let vueRouter: ReturnType<typeof createVueRouter>
const handles: RouterBlockerHandle[] = []
/** What the component mounted on `/watched` was told through `onChangeLocation`. */
const watched = vi.fn()

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
			{
				// `onChangeLocation` behaves differently inside a route component: it mutes itself
				// through a leave guard, so it needs one to be mounted in.
				path: '/watched',
				component: {
					setup: () => {
						router.onChangeLocation(location => watched(location.path))
						return () => null
					},
				},
			},
		],
	})

	const app = createApp({
		setup: () => {
			router = createRouter()
			return () => h(RouterView)
		},
	})
	app.use(vueRouter)
	await vueRouter.isReady()
	app.mount(document.createElement('div'))
})

afterEach(async () => {
	handles.splice(0).forEach(handle => handle.unregister())
	await vueRouter.replace('/')
	watched.mockClear()
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
			})
		})

		// The record stays matched, so the component is reused, but everything derived from the id
		// refetches and rehydrates the form over whatever the user had typed.
		it('should block when the params change on a matched record', async () => {
			await vueRouter.push('/posts/1')
			const shouldBlock = vi.fn(() => true)
			const handle = register(shouldBlock)

			const navigation = vueRouter.push('/posts/2')
			await vi.waitFor(() => expect(shouldBlock).toHaveBeenCalled())
			handle.reset()
			await navigation

			expect(vueRouter.currentRoute.value.path).toBe('/posts/1')
		})

		it('should not block when only the query changes', async () => {
			await vueRouter.push('/posts/1')
			const shouldBlock = vi.fn(() => true)
			register(shouldBlock)

			await vueRouter.push('/posts/1?page=2')

			expect(shouldBlock).not.toHaveBeenCalled()
			expect(vueRouter.currentRoute.value.query).toEqual({ page: '2' })
		})

		// A back navigation has already moved the browser by the time the guard runs, unlike a push.
		it('should put the history entry back when a back navigation is cancelled', async () => {
			await vueRouter.push('/other')
			await vueRouter.push('/watched')
			const shouldBlock = vi.fn(() => true)
			const handle = register(shouldBlock)

			vueRouter.back()
			await vi.waitFor(() => expect(shouldBlock).toHaveBeenCalled())
			// The browser moved, the route the user is looking at did not, and that is the one every
			// consumer is told about.
			expect(vueRouter.currentRoute.value.path).toBe('/watched')

			handle.reset()
			await vi.waitFor(() => expect(vueRouter.options.history.location).toBe('/watched'))

			expect(vueRouter.currentRoute.value.path).toBe('/watched')
		})

		// An alias with the same params is a duplicate navigation as far as vue-router is concerned,
		// so `isChangingRoute` is what covers the alias case, in `utils/route-record.test.ts`.
		it('should not block after unregister', async () => {
			register(() => true).unregister()

			await vueRouter.push('/other')

			expect(vueRouter.currentRoute.value.path).toBe('/other')
		})

		it('should release a held navigation on unregister', async () => {
			const shouldBlock = vi.fn(() => true)
			const handle = register(shouldBlock)

			const navigation = vueRouter.push('/other')
			await vi.waitFor(() => expect(shouldBlock).toHaveBeenCalled())
			handle.unregister()
			await navigation

			expect(vueRouter.currentRoute.value.path).toBe('/other')
		})
	})

	describe('onChangeLocation', () => {
		// Muting a leaving component is what `router.keep-alive.test.ts` covers: a plain component
		// is unmounted before its pre-flush watch runs, so only `<KeepAlive>` can observe it.
		it('should keep reporting when the navigation it was muted for is cancelled', async () => {
			await vueRouter.push('/watched')
			watched.mockClear()
			const shouldBlock = vi.fn(() => true)
			const handle = register(shouldBlock)

			const navigation = vueRouter.push('/other')
			await vi.waitFor(() => expect(shouldBlock).toHaveBeenCalled())
			handle.reset()
			await navigation

			// Still mounted, so the next navigation it survives has to reach it.
			await vueRouter.push('/watched?page=2')

			expect(watched).toHaveBeenCalledWith('/watched')
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
			})
		})

		it('should not prevent unload after unregister', () => {
			register(() => true).unregister()

			expect(dispatchBeforeUnload().defaultPrevented).toBe(false)
		})
	})
})
