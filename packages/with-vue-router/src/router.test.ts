// @vitest-environment happy-dom

import type { Router, RouterBlockerController } from '@ginjou/core'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { createApp, h } from 'vue'
import { createMemoryHistory, createRouter as createVueRouter, RouterView } from 'vue-router'
import { createRouter } from './router'

let router: Router
let vueRouter: ReturnType<typeof createVueRouter>
const controllers: RouterBlockerController[] = []
/** What the component mounted on `/watched` was told through `onChangeLocation`. */
const watched = vi.fn()
/** The teardown `onChangeLocation` handed back to the component mounted on `/watched`. */
let unwatch: () => void

function register(
	shouldBlock: Parameters<NonNullable<Router['blocker']>>[0],
): RouterBlockerController {
	const controller = router.blocker!(shouldBlock)
	controllers.push(controller)
	return controller
}

function dispatchBeforeUnload(): Event {
	const event = new Event('beforeunload', { cancelable: true })
	window.dispatchEvent(event)
	return event
}

// `createRouter()` registers a global `beforeunload` listener, so it is created once
// for the whole file and every blocker is disposed between tests.
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
						unwatch = router.onChangeLocation(location => watched(location.path))
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
	controllers.splice(0).forEach(controller => controller.dispose())
	await vueRouter.replace('/')
	watched.mockClear()
})

describe('createRouter', () => {
	describe('go', () => {
		it('should map the navigation params', async () => {
			await vueRouter.push('/other?page=1')

			router.go({ to: '/posts/1', type: 'replace', keepQuery: true })
			await vi.waitFor(() => expect(vueRouter.currentRoute.value.path).toBe('/posts/1'))

			expect(vueRouter.currentRoute.value.query).toEqual({ page: '1' })

			// `replace`, so the entry it navigated away from is the one that is gone.
			vueRouter.back()
			await vi.waitFor(() => expect(vueRouter.currentRoute.value.path).toBe('/'))
		})
	})

	describe('blocker (route leave)', () => {
		it('should let the navigation through when nothing blocks', async () => {
			register(() => false)

			await vueRouter.push('/other')

			expect(vueRouter.currentRoute.value.path).toBe('/other')
		})

		it('should suspend the navigation until proceed', async () => {
			const shouldBlock = vi.fn(() => true)
			const controller = register(shouldBlock)

			const navigation = vueRouter.push('/other')
			await vi.waitFor(() => expect(shouldBlock).toHaveBeenCalled())
			expect(vueRouter.currentRoute.value.path).toBe('/')

			controller.proceed()
			await navigation

			expect(vueRouter.currentRoute.value.path).toBe('/other')
		})

		it('should cancel the navigation on reset', async () => {
			const shouldBlock = vi.fn(() => true)
			const controller = register(shouldBlock)

			const navigation = vueRouter.push('/other')
			await vi.waitFor(() => expect(shouldBlock).toHaveBeenCalled())
			controller.reset()
			await navigation

			expect(vueRouter.currentRoute.value.path).toBe('/')
		})

		// Both predicates answer for the navigation at the point it started — that is the snapshot —
		// but only one blocker is asked for a decision at a time, so a page that opens a dialog on
		// `blocked` opens one dialog.
		it('should ask the blockers one by one', async () => {
			const first = vi.fn(() => true)
			const second = vi.fn(() => true)
			const firstController = register(first)
			const secondController = register(second)

			const navigation = vueRouter.push('/other')
			await vi.waitFor(() => expect(firstController.state).toBe('blocked'))

			expect(first).toHaveBeenCalledOnce()
			expect(second).toHaveBeenCalledOnce()
			expect(secondController.state).toBe('unblocked')

			firstController.proceed()
			await vi.waitFor(() => expect(secondController.state).toBe('blocked'))
			expect(vueRouter.currentRoute.value.path).toBe('/')

			secondController.proceed()
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
			const controller = register(shouldBlock)

			const navigation = vueRouter.push('/posts/2')
			await vi.waitFor(() => expect(shouldBlock).toHaveBeenCalled())
			controller.reset()
			await navigation

			expect(vueRouter.currentRoute.value.path).toBe('/posts/1')
		})

		// Nothing is filtered out on the way in: whether a query-only change is worth blocking is the
		// page's call, so the predicate is asked and gets both locations to compare.
		it('should ask the blockers when only the query changes', async () => {
			await vueRouter.push('/posts/1')
			const shouldBlock = vi.fn(() => true)
			const controller = register(shouldBlock)

			const navigation = vueRouter.push('/posts/1?page=2')
			await vi.waitFor(() => expect(controller.state).toBe('blocked'))

			expect(shouldBlock).toHaveBeenCalledWith({
				currentLocation: expect.objectContaining({ path: '/posts/1', query: {} }),
				nextLocation: expect.objectContaining({ path: '/posts/1', query: { page: '2' } }),
			})

			controller.proceed()
			await navigation

			expect(vueRouter.currentRoute.value.query).toEqual({ page: '2' })
		})

		it('should let a query-only change through when the predicate compares paths', async () => {
			await vueRouter.push('/posts/1')
			register(({ currentLocation, nextLocation }) => nextLocation?.path !== currentLocation.path)

			await vueRouter.push('/posts/1?page=2')

			expect(vueRouter.currentRoute.value.query).toEqual({ page: '2' })
		})

		// A back navigation has already moved the browser by the time the guard runs, unlike a push.
		it('should put the history entry back when a back navigation is cancelled', async () => {
			await vueRouter.push('/other')
			await vueRouter.push('/watched')
			const shouldBlock = vi.fn(() => true)
			const controller = register(shouldBlock)

			vueRouter.back()
			await vi.waitFor(() => expect(shouldBlock).toHaveBeenCalled())
			// The browser moved, the route the user is looking at did not, and that is the one every
			// consumer is told about.
			expect(vueRouter.currentRoute.value.path).toBe('/watched')

			controller.reset()
			await vi.waitFor(() => expect(vueRouter.options.history.location).toBe('/watched'))

			expect(vueRouter.currentRoute.value.path).toBe('/watched')
		})

		// An alias with the same params is a duplicate navigation as far as vue-router is concerned,
		// so `isChangingRoute` is what covers the alias case, in `utils/route-record.test.ts`.
		it('should not block after dispose', async () => {
			register(() => true).dispose()

			await vueRouter.push('/other')

			expect(vueRouter.currentRoute.value.path).toBe('/other')
		})

		// Nothing is left to answer for it, so the navigation it was holding is cancelled rather than
		// waved through: the page it was protecting is the one being torn down.
		it('should cancel a held navigation on dispose', async () => {
			const shouldBlock = vi.fn(() => true)
			const controller = register(shouldBlock)

			const navigation = vueRouter.push('/other')
			await vi.waitFor(() => expect(shouldBlock).toHaveBeenCalled())
			controller.dispose()
			await navigation

			expect(vueRouter.currentRoute.value.path).toBe('/')
		})
	})

	// `proceeding` is one blocker's answer, not the navigation's outcome, so what settles it is the
	// router reporting how the navigation ended.
	describe('blocker (settlement)', () => {
		it('should settle every participant when the navigation succeeds', async () => {
			const first = register(() => true)
			const second = register(() => true)

			const navigation = vueRouter.push('/other')
			await vi.waitFor(() => expect(first.state).toBe('blocked'))
			first.proceed()
			await vi.waitFor(() => expect(second.state).toBe('blocked'))
			second.proceed()
			await navigation

			expect(vueRouter.currentRoute.value.path).toBe('/other')
			expect([first.state, second.state]).toEqual(['unblocked', 'unblocked'])
		})

		it('should settle every participant when a later blocker cancels', async () => {
			const first = register(() => true)
			const second = register(() => true)

			const navigation = vueRouter.push('/other')
			await vi.waitFor(() => expect(first.state).toBe('blocked'))
			first.proceed()

			expect(first.state).toBe('proceeding')

			await vi.waitFor(() => expect(second.state).toBe('blocked'))
			second.reset()
			await navigation

			expect(vueRouter.currentRoute.value.path).toBe('/')
			expect([first.state, second.state]).toEqual(['unblocked', 'unblocked'])
		})

		// A guard that throws never reaches `afterEach`, only `onError`.
		it('should settle a participant when a later guard throws', async () => {
			const controller = register(() => true)
			const stopGuard = vueRouter.beforeEach((to) => {
				if (to.path === '/other')
					throw new Error('nope')
			})

			const navigation = vueRouter.push('/other')
			await vi.waitFor(() => expect(controller.state).toBe('blocked'))
			controller.proceed()
			await expect(navigation).rejects.toThrow('nope')

			stopGuard()

			expect(vueRouter.currentRoute.value.path).toBe('/')
			await vi.waitFor(() => expect(controller.state).toBe('unblocked'))
		})

		it('should settle a participant when a later guard cancels', async () => {
			const controller = register(() => true)
			const stopGuard = vueRouter.beforeEach(to => to.path !== '/other')

			const navigation = vueRouter.push('/other')
			await vi.waitFor(() => expect(controller.state).toBe('blocked'))
			controller.proceed()
			await navigation

			stopGuard()

			expect(vueRouter.currentRoute.value.path).toBe('/')
			await vi.waitFor(() => expect(controller.state).toBe('unblocked'))
		})

		it('should hand the blockers to a superseding navigation', async () => {
			const controller = register(() => true)

			const superseded = vueRouter.push('/other')
			await vi.waitFor(() => expect(controller.state).toBe('blocked'))

			const latest = vueRouter.push('/posts/1')
			await vi.waitFor(() => expect(controller.state).toBe('blocked'))
			await superseded

			controller.proceed()
			await latest

			expect(vueRouter.currentRoute.value.path).toBe('/posts/1')
			await vi.waitFor(() => expect(controller.state).toBe('unblocked'))
		})
	})

	describe('onChangeLocation', () => {
		// Muting a leaving component is what `router.keep-alive.test.ts` covers: a plain component
		// is unmounted before its pre-flush watch runs, so only `<KeepAlive>` can observe it.
		it('should keep reporting when the navigation it was muted for is cancelled', async () => {
			await vueRouter.push('/watched')
			watched.mockClear()
			const shouldBlock = vi.fn(() => true)
			const controller = register(shouldBlock)

			const navigation = vueRouter.push('/other')
			await vi.waitFor(() => expect(shouldBlock).toHaveBeenCalled())
			controller.reset()
			await navigation
			controller.dispose()

			// Still mounted, so the next navigation it survives has to reach it.
			await vueRouter.push('/watched?page=2')

			expect(watched).toHaveBeenCalledWith('/watched')
		})

		it('should stop reporting after the cleanup it returns', async () => {
			await vueRouter.push('/watched')
			watched.mockClear()

			unwatch()
			await vueRouter.push('/watched?page=2')

			expect(watched).not.toHaveBeenCalled()
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
			register(() => true).dispose()

			expect(dispatchBeforeUnload().defaultPrevented).toBe(false)
		})
	})
})
