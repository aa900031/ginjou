// @vitest-environment happy-dom

import type { Router } from '@ginjou/core'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, KeepAlive, nextTick } from 'vue'
import { createMemoryHistory, createRouter as createVueRouter, RouterView } from 'vue-router'
import { createRouter } from './router'

let router: Router
let vueRouter: ReturnType<typeof createVueRouter>
const watched = vi.fn()
/** Only records that it was asked: a predicate that actually held would never be answered here. */
const shouldBlock = vi.fn(() => false)

beforeAll(async () => {
	vueRouter = createVueRouter({
		history: createMemoryHistory(),
		routes: [
			{
				path: '/watched',
				component: {
					setup: () => {
						router.onChangeLocation(location => watched(location.path))
						router.blocker!({ should: shouldBlock, enabled: true })
						return () => null
					},
				},
			},
			{ path: '/other', component: { render: () => null } },
			{ path: '/third', component: { render: () => null } },
		],
	})

	const app = createApp({
		setup: () => {
			router = createRouter()
			return () => h(RouterView, null, {
				default: ({ Component }: any) => h(KeepAlive, null, [h(Component)]),
			})
		},
	})
	app.use(vueRouter)
	await vueRouter.push('/watched')
	app.mount(document.createElement('div'))
})

beforeEach(async () => {
	if (vueRouter.currentRoute.value.fullPath !== '/watched')
		await vueRouter.push('/watched')

	watched.mockClear()
	shouldBlock.mockClear()
})

describe('blocker under KeepAlive', () => {
	// The scope of a cached component is never disposed, so the blocker cannot clean itself up on
	// the way out. Left registered it holds every later navigation on a page nobody is looking at,
	// with the confirmation it would render nowhere on screen.
	it('should not be asked once the component is cached', async () => {
		// Leaving is what caches it, and it is still on screen for that one.
		await vueRouter.push('/other')
		expect(shouldBlock).toHaveBeenCalled()
		shouldBlock.mockClear()

		await vueRouter.push('/third')

		expect(shouldBlock).not.toHaveBeenCalled()
		expect(vueRouter.currentRoute.value.path).toBe('/third')
	})

	it('should be asked again once the component is activated', async () => {
		await vueRouter.push('/other')
		await vueRouter.push('/watched')
		shouldBlock.mockClear()

		await vueRouter.push('/other')

		expect(shouldBlock).toHaveBeenCalled()
	})
})

describe('onChangeLocation under KeepAlive', () => {
	it('should not report the route the component is being deactivated for', async () => {
		await vueRouter.push('/other')

		expect(watched).not.toHaveBeenCalled()
	})

	it('should report again once the component is activated', async () => {
		await vueRouter.push('/other')
		watched.mockClear()

		await vueRouter.push('/watched')
		await nextTick()

		expect(watched).toHaveBeenCalledWith('/watched')
	})

	// A duplicate navigation is reported as a failure, but it says nothing about the component that
	// was cached by an earlier, successful leave.
	it('should stay quiet while cached when an unrelated navigation fails', async () => {
		await vueRouter.push('/other')
		watched.mockClear()

		// Duplicate: vue-router answers with a NavigationFailure.
		await vueRouter.push('/other')
		await vueRouter.push('/third')

		expect(watched).not.toHaveBeenCalled()
	})

	// A superseded navigation reports its failure while its replacement is still in flight, so the
	// failure is no evidence that this subscription is still where it was.
	it('should stay quiet when the navigation it was leaving for is superseded', async () => {
		void vueRouter.push('/other')
		await vueRouter.push('/third')
		await nextTick()

		expect(watched).not.toHaveBeenCalled()
	})

	it('should stay quiet while it is cached', async () => {
		await vueRouter.push('/other')
		watched.mockClear()

		await vueRouter.push('/other?page=2')

		expect(watched).not.toHaveBeenCalled()
	})
})
