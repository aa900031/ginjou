// @vitest-environment happy-dom

import type { SpaRouter } from './router.svelte'
import { mount, unmount } from 'svelte'
import { push } from 'svelte-spa-router'
import { wrap } from 'svelte-spa-router/wrap'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import BlockedPage from '../test/BlockedPage.svelte'
import BlockerApp from '../test/BlockerApp.svelte'
import PlainPage from '../test/PlainPage.svelte'
import { probe, resetProbe } from '../test/probe'

const EDIT_PATH = '/posts/1/edit'
const LIST_PATH = '/posts'
/** A route the caller's own condition rejects, i.e. one the blocker approves but nobody reaches. */
const REJECTED_PATH = '/rejected'

let router: SpaRouter
let app: Record<string, any>
/** The router only reports this when it gave up on a route and unmounted it. */
let conditionsFailed = 0

/** Lets hashchange and the router's async route effect settle. */
async function settle(): Promise<void> {
	for (let i = 0; i < 10; i++)
		await new Promise(resolve => setTimeout(resolve, 0))
}

beforeEach(async () => {
	resetProbe()
	conditionsFailed = 0
	// Two entries, set before the app is mounted so neither of them runs a route.
	window.location.hash = `#${LIST_PATH}`
	await new Promise(resolve => setTimeout(resolve, 0))
	window.location.hash = `#${EDIT_PATH}`
	app = mount(BlockerApp, {
		target: document.body,
		props: {
			onready: (value: SpaRouter) => {
				router = value
			},
			onconditionsfailed: () => {
				conditionsFailed++
			},
			routes: {
				[LIST_PATH]: PlainPage,
				[REJECTED_PATH]: wrap({
					component: PlainPage,
					conditions: () => false,
				}),
				'/posts/:id/edit': wrap({
					component: BlockedPage,
					props: {
						get router() {
							return router
						},
					},
				}),
			},
		},
	})
	await settle()
})

afterEach(() => {
	unmount(app)
	document.body.innerHTML = ''
})

describe('blocker inside a mounted Router', () => {
	it('should have mounted the starting route once', () => {
		expect(probe.mounts).toBe(1)
		expect(document.querySelector('[data-testid="blocked-page"]')).not.toBeNull()
		expect(probe.locations).toEqual([EDIT_PATH])
	})

	it('should hold the navigation with the current page still mounted', async () => {
		// A confirm that never answers freezes the run at the moment the navigation is held.
		probe.confirmResult = undefined

		void push(LIST_PATH)
		await settle()

		expect(probe.confirms).toBe(1)
		expect(document.querySelector('[data-testid="blocked-page"]')).not.toBeNull()
		expect(document.querySelector('[data-testid="plain-page"]')).toBeNull()
		expect(probe.mounts).toBe(1)
		// The page the user is looking at is still the edit route, so that is what the router has
		// to report. Handing it the hash would strip the record id out from under it, which is
		// what made the page tear itself down and come back.
		expect(router.getLocation()).toMatchObject({
			path: EDIT_PATH,
			params: { id: '1' },
		})
		expect(probe.locations).toEqual([EDIT_PATH])
	})

	it('should not remount or move the page when the navigation is cancelled', async () => {
		probe.confirmResult = false

		void push(LIST_PATH)
		await settle()

		expect(probe.confirms).toBe(1)
		expect(window.location.hash).toBe(`#${EDIT_PATH}`)
		expect(document.querySelector('[data-testid="blocked-page"]')).not.toBeNull()
		expect(probe.mounts).toBe(1)
		expect(conditionsFailed).toBe(0)
		expect(router.getLocation()).toMatchObject({ path: EDIT_PATH })
		expect(probe.locations).toEqual([EDIT_PATH])
	})

	it('should leave the page when the navigation is confirmed', async () => {
		probe.confirmResult = true

		void push(LIST_PATH)
		await settle()

		expect(probe.confirms).toBe(1)
		expect(window.location.hash).toBe(`#${LIST_PATH}`)
		expect(document.querySelector('[data-testid="plain-page"]')).not.toBeNull()
		expect(document.querySelector('[data-testid="blocked-page"]')).toBeNull()
		expect(router.getLocation()).toMatchObject({ path: LIST_PATH })
	})

	// A blocker on the page being left is unmounted by the time the navigation ends, so it never sees
	// its own settlement. One that outlives the navigation — a layout, a shell, an app-level unsaved
	// guard — does, and it is what the terminal signals are wired up for. Without
	// `onRouteLoaded` this one would sit in `proceeding` until the next navigation attempt.
	it('should settle a blocker that outlives the navigation it approved', async () => {
		const controller = router.blocker!(() => true)
		probe.confirmResult = true

		void push(LIST_PATH)
		await settle()

		// The routed page was asked first and approved, so the hold is on this one now.
		expect(probe.confirms).toBe(1)
		expect(controller.state).toBe('blocked')

		controller.proceed()
		await settle()

		expect(window.location.hash).toBe(`#${LIST_PATH}`)
		expect(document.querySelector('[data-testid="plain-page"]')).not.toBeNull()
		expect(controller.state).toBe('unblocked')
	})

	// `onRouteLoaded` never fires for this one: the route the blockers approved is rejected by the
	// caller's own condition, so `onConditionsFailed` is the only signal that the navigation is over.
	it('should settle a surviving blocker when a later condition rejects', async () => {
		const controller = router.blocker!(() => true)
		probe.confirmResult = true

		void push(REJECTED_PATH)
		await settle()

		expect(controller.state).toBe('blocked')

		controller.proceed()
		await settle()

		expect(conditionsFailed).toBe(1)
		expect(controller.state).toBe('unblocked')
	})

	// Approving is not reaching. Reporting the rejected route would hand every surviving consumer —
	// an app shell, a `syncRoute`, the next run of this very condition — a location nothing mounted.
	it('should not report a route the caller rejected as the current one', async () => {
		probe.confirmResult = true

		void push(REJECTED_PATH)
		await settle()

		expect(conditionsFailed).toBe(1)
		expect(router.getLocation()).toMatchObject({ path: EDIT_PATH })
	})

	// This is what `onConditionsFailed` would have been wired up for: the blocker approves, the
	// caller's own condition then rejects, and the navigation dies with no public terminal signal
	// reaching the router adapter.
	//
	// There is nothing for such a signal to settle. The router unmounts what is on screen as soon as
	// a condition rejects, so the page that approved goes away with it and its blocker is disposed
	// while `proceeding` — the branch that keeps the approval and detaches. What must not survive is
	// a registration that still holds navigations with nobody left to answer for it.
	it('should leave nothing holding navigations when a later condition rejects', async () => {
		probe.confirmResult = true

		void push(REJECTED_PATH)
		await settle()

		expect(probe.confirms).toBe(1)
		expect(conditionsFailed).toBe(1)
		expect(document.querySelector('[data-testid="blocked-page"]')).toBeNull()

		// Goes straight through: no ghost blocker, and nothing left to ask.
		void push(LIST_PATH)
		await settle()

		expect(document.querySelector('[data-testid="plain-page"]')).not.toBeNull()
		expect(probe.confirms).toBe(1)
	})

	it('should ask again on the next attempt', async () => {
		probe.confirmResult = false

		void push(LIST_PATH)
		await settle()
		void push(LIST_PATH)
		await settle()

		expect(probe.confirms).toBe(2)
		expect(probe.mounts).toBe(1)
		expect(window.location.hash).toBe(`#${EDIT_PATH}`)
	})
})
