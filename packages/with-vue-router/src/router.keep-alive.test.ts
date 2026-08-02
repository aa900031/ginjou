// @vitest-environment happy-dom

import type { Router } from '@ginjou/core'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, KeepAlive, nextTick } from 'vue'
import { createMemoryHistory, createRouter as createVueRouter, RouterView } from 'vue-router'
import { createRouter } from './router'

let router: Router
let vueRouter: ReturnType<typeof createVueRouter>
const watched = vi.fn()

beforeAll(async () => {
	vueRouter = createVueRouter({
		history: createMemoryHistory(),
		routes: [
			{
				path: '/watched',
				component: {
					setup: () => {
						router.onChangeLocation(location => watched(location.path))
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

	it('should stay quiet while it is cached', async () => {
		await vueRouter.push('/other')
		watched.mockClear()

		await vueRouter.push('/other?page=2')

		expect(watched).not.toHaveBeenCalled()
	})
})
