// @vitest-environment happy-dom

import type { RouteDetail } from 'svelte-spa-router'
import { wrap } from 'svelte-spa-router/wrap'
import { beforeEach, describe, expect, it, onTestFinished, vi } from 'vitest'
import { createBlocker } from './blocker.svelte'
import { defaultParseQuery } from './location'

let blocker: ReturnType<typeof createBlocker>

function detail(
	location: string,
	querystring = '',
	params: RouteDetail['params'] = null,
): RouteDetail {
	return { route: location, location, querystring, params }
}

beforeEach(() => {
	window.location.hash = '#/posts/1/edit'
	blocker = createBlocker({ parseQuery: defaultParseQuery })
})

describe('createBlockerCondition', () => {
	it('should allow the first navigation of the session', async () => {
		const condition = blocker.createBlockerCondition()

		await expect(condition(detail('/posts/1/edit'))).resolves.toBe(true)
	})

	it('should allow the navigation when no blocker blocks it', async () => {
		const condition = blocker.createBlockerCondition()
		blocker.create(() => false)

		await condition(detail('/posts/1/edit'))

		await expect(condition(detail('/posts'))).resolves.toBe(true)
	})

	it('should pass the location being left and the location being entered', async () => {
		const condition = blocker.createBlockerCondition()
		const shouldBlock = vi.fn(() => false)
		blocker.create(shouldBlock)

		await condition(detail('/posts/1/edit'))
		await condition(detail('/posts', 'page=2'))

		expect(shouldBlock).toHaveBeenCalledWith({
			currentLocation: expect.objectContaining({ path: '/posts/1/edit' }),
			nextLocation: expect.objectContaining({
				path: '/posts',
				query: { page: '2' },
			}),
		})
	})

	it('should hold the navigation while a blocker is deciding', async () => {
		const condition = blocker.createBlockerCondition()
		const controller = blocker.create(() => true)

		await condition(detail('/posts/1/edit'))
		const pending = condition(detail('/posts'))

		expect(controller.state).toBe('blocked')
		await expect(Promise.race([pending, 'pending'])).resolves.toBe('pending')
	})

	it('should let the navigation through on proceed, leaving the URL alone', async () => {
		const condition = blocker.createBlockerCondition()
		const controller = blocker.create(() => true)

		await condition(detail('/posts/1/edit'))

		// A pre-condition runs after the hash has already moved to the new location.
		window.location.hash = '#/posts'
		const pending = condition(detail('/posts'))
		controller.proceed()

		await expect(pending).resolves.toBe(true)
		expect(window.location.hash).toBe('#/posts')
	})

	it('should restore the previous location on reset', async () => {
		const condition = blocker.createBlockerCondition()
		const controller = blocker.create(() => true)

		await condition(detail('/posts/1/edit'))

		window.location.hash = '#/posts'
		const pending = condition(detail('/posts'))
		controller.reset()

		await expect(pending).resolves.toBe(false)
		expect(window.location.hash).toBe('#/posts/1/edit')
	})

	// Cancelling a push leaves the entry it created behind, now holding a copy of the location we
	// restored to, so Back would land on the copy and appear to do nothing. `history.state` is what
	// separates the two: a fragment push always creates an entry with a null state, and every entry
	// the user has stood on carries a mark. happy-dom copies the state onto a pushed entry instead
	// of nulling it, so these drive the state directly rather than through a hash assignment; the
	// end-to-end behaviour is verified against Chrome.
	it('should step off the entry a cancelled push left behind', async () => {
		const condition = blocker.createBlockerCondition()
		const controller = blocker.create(() => true)
		const back = vi.spyOn(window.history, 'back').mockImplementation(() => {})
		onTestFinished(() => back.mockRestore())

		await condition(detail('/posts/1/edit'))

		window.location.hash = '#/posts'
		window.history.replaceState(null, '')
		const pending = condition(detail('/posts'))
		controller.reset()
		await pending

		expect(back).toHaveBeenCalledOnce()
	})

	it('should leave the history alone when a cancelled navigation was a traversal', async () => {
		const condition = blocker.createBlockerCondition()
		const controller = blocker.create(() => true)
		const back = vi.spyOn(window.history, 'back').mockImplementation(() => {})
		onTestFinished(() => back.mockRestore())

		await condition(detail('/posts/1/edit'))

		window.location.hash = '#/posts'
		// An entry the user has stood on before: going back created it, nothing to step off.
		window.history.replaceState({ __ginjou_visited: true }, '')
		const pending = condition(detail('/posts'))
		controller.reset()
		await pending

		expect(back).not.toHaveBeenCalled()
	})

	it('should not block the restore navigation it just made', async () => {
		const condition = blocker.createBlockerCondition()
		const shouldBlock = vi.fn(() => true)
		const controller = blocker.create(shouldBlock)

		await condition(detail('/posts/1/edit'))
		const pending = condition(detail('/posts'))
		controller.reset()
		await pending
		shouldBlock.mockClear()

		await expect(condition(detail('/posts/1/edit'))).resolves.toBe(true)
		expect(shouldBlock).not.toHaveBeenCalled()
	})

	// Nothing is filtered out on the way in: whether a query-only change is worth blocking is the
	// page's call, so the predicate is asked and gets both locations to compare.
	it('should ask the blockers when only the query changes', async () => {
		const condition = blocker.createBlockerCondition()
		const shouldBlock = vi.fn(() => true)
		const controller = blocker.create(shouldBlock)

		await condition(detail('/posts', 'page=1'))
		const pending = condition(detail('/posts', 'page=2'))

		expect(controller.state).toBe('blocked')
		expect(shouldBlock).toHaveBeenCalledWith({
			currentLocation: expect.objectContaining({ path: '/posts', query: { page: '1' } }),
			nextLocation: expect.objectContaining({ path: '/posts', query: { page: '2' } }),
		})

		controller.proceed()

		await expect(pending).resolves.toBe(true)
		expect(blocker.acceptedLocation).toMatchObject({ query: { page: '2' } })
	})

	it('should let a query-only change through when the predicate compares paths', async () => {
		const condition = blocker.createBlockerCondition()
		blocker.create(({ currentLocation, nextLocation }) => nextLocation?.path !== currentLocation.path)

		await condition(detail('/posts', 'page=1'))

		await expect(condition(detail('/posts', 'page=2'))).resolves.toBe(true)
		expect(blocker.acceptedLocation).toMatchObject({ query: { page: '2' } })
	})

	it('should invalidate a held run that a later navigation superseded', async () => {
		const condition = blocker.createBlockerCondition()
		const controller = blocker.create(() => true)

		await condition(detail('/posts/1/edit'))

		window.location.hash = '#/posts'
		const held = condition(detail('/posts'))

		window.location.hash = '#/posts/1/edit'
		await expect(condition(detail('/posts/1/edit'))).resolves.toBe(true)

		controller.proceed()

		await expect(held).resolves.toBe(false)
		expect(blocker.acceptedLocation).toMatchObject({ path: '/posts/1/edit' })
	})

	// The exact target already on screen: the route re-resolving for where it already is.
	it('should not block a navigation to the location already displayed', async () => {
		const condition = blocker.createBlockerCondition()
		const shouldBlock = vi.fn(() => true)
		blocker.create(shouldBlock)

		await condition(detail('/posts/1/edit'))

		await expect(condition(detail('/posts/1/edit'))).resolves.toBe(true)
		expect(shouldBlock).not.toHaveBeenCalled()
	})

	it('should still consult the other blockers after one proceeds', async () => {
		const condition = blocker.createBlockerCondition()
		const first = blocker.create(() => true)
		const second = blocker.create(() => true)

		await condition(detail('/posts/1/edit'))
		const pending = condition(detail('/posts'))
		first.proceed()
		await Promise.resolve()

		expect(second.state).toBe('blocked')
		second.reset()
		await expect(pending).resolves.toBe(false)
	})

	it('should share one registry with every condition it creates', async () => {
		const onEdit = blocker.createBlockerCondition()
		const onList = blocker.createBlockerCondition()
		const shouldBlock = vi.fn(() => false)
		blocker.create(shouldBlock)

		await onEdit(detail('/posts/1/edit'))
		await onList(detail('/posts'))

		expect(shouldBlock).toHaveBeenCalledOnce()
	})

	// Nothing is left to answer for it, so the navigation it was holding is cancelled rather than
	// waved through: the page it was protecting is the one being torn down.
	it('should cancel a held navigation when the blocker is disposed', async () => {
		const condition = blocker.createBlockerCondition()
		const controller = blocker.create(() => true)

		await condition(detail('/posts/1/edit'))

		window.location.hash = '#/posts'
		const pending = condition(detail('/posts'))
		controller.dispose()

		await expect(pending).resolves.toBe(false)
		expect(window.location.hash).toBe('#/posts/1/edit')
	})

	// Accepting is not terminal: a later condition of the caller's can still reject the route, so the
	// participants hold their approval until `<Router>` says which way it went — `settle` here.
	it('should keep the approvals until it is settled', async () => {
		const condition = blocker.createBlockerCondition()
		const first = blocker.create(() => true)
		const second = blocker.create(() => true)

		await condition(detail('/posts/1/edit'))
		const pending = condition(detail('/posts'))
		first.proceed()
		await Promise.resolve()
		second.proceed()

		await expect(pending).resolves.toBe(true)
		expect([first.state, second.state]).toEqual(['proceeding', 'proceeding'])

		blocker.settle()

		expect([first.state, second.state]).toEqual(['unblocked', 'unblocked'])
	})

	// An app that never wires the terminal signals up still cannot get stuck: the next navigation
	// settles whatever the last one left behind before it snapshots.
	it('should settle the last navigation when a new one starts', async () => {
		const condition = blocker.createBlockerCondition()
		const controller = blocker.create(() => true)

		await condition(detail('/posts/1/edit'))
		const pending = condition(detail('/posts'))
		controller.proceed()
		await pending

		expect(controller.state).toBe('proceeding')

		const next = condition(detail('/users'))

		expect(controller.state).toBe('blocked')

		controller.proceed()
		await expect(next).resolves.toBe(true)
	})

	// A cancel settles itself: nothing is coming from the router, because the restore supersedes the
	// run and `<Router>` drops it without reporting anything.
	it('should settle every participant once it is cancelled', async () => {
		const condition = blocker.createBlockerCondition()
		const first = blocker.create(() => true)
		const second = blocker.create(() => true)

		await condition(detail('/posts/1/edit'))
		const pending = condition(detail('/posts'))
		first.proceed()
		await Promise.resolve()
		second.reset()

		await expect(pending).resolves.toBe(false)
		expect([first.state, second.state]).toEqual(['unblocked', 'unblocked'])
	})

	it('should leave the URL to the newer navigation when it takes the hold over', async () => {
		const condition = blocker.createBlockerCondition()
		const controller = blocker.create(() => true)

		await condition(detail('/posts/1/edit'))

		window.location.hash = '#/posts'
		const superseded = condition(detail('/posts'))
		window.location.hash = '#/users'
		const latest = condition(detail('/users'))

		await expect(superseded).resolves.toBe(false)
		// The restore belongs to whoever still owns the navigation, and that is the newer run.
		expect(window.location.hash).toBe('#/users')

		controller.proceed()
		await expect(latest).resolves.toBe(true)
		expect(blocker.acceptedLocation).toMatchObject({ path: '/users' })
	})

	it('should not block after the blocker is disposed', async () => {
		const condition = blocker.createBlockerCondition()
		const controller = blocker.create(() => true)

		await condition(detail('/posts/1/edit'))
		controller.dispose()

		await expect(condition(detail('/posts'))).resolves.toBe(true)
	})

	it('should not block after the registry is disposed', async () => {
		const condition = blocker.createBlockerCondition()
		blocker.create(() => true)

		await condition(detail('/posts/1/edit'))
		blocker.dispose()

		await expect(condition(detail('/posts'))).resolves.toBe(true)
	})
})

// This is what `createRouter().getLocation()` reports, so it decides what every consumer of the
// router (`useLocation`, `useEdit`, ...) is told. The hash has already moved by the time a
// pre-condition runs, and `router.params` has not, so reporting the hash hands the still-mounted
// page a path from the route it is leaving to and params from the one it is on.
describe('acceptedLocation', () => {
	it('should be undefined until a navigation is accepted', () => {
		expect(blocker.acceptedLocation).toBeUndefined()
	})

	it('should report the accepted navigation', async () => {
		const condition = blocker.createBlockerCondition()

		await condition(detail('/posts/1/edit', '', { id: '1' }))

		expect(blocker.acceptedLocation).toMatchObject({
			path: '/posts/1/edit',
			params: { id: '1' },
		})
	})

	it('should keep reporting the mounted route while a blocker is deciding', async () => {
		const condition = blocker.createBlockerCondition()
		const controller = blocker.create(() => true)
		await condition(detail('/posts/1/edit', '', { id: '1' }))

		const pending = condition(detail('/posts'))

		expect(blocker.acceptedLocation).toMatchObject({
			path: '/posts/1/edit',
			params: { id: '1' },
		})

		controller.reset()
		await pending
	})

	it('should keep reporting the mounted route after a cancel', async () => {
		const condition = blocker.createBlockerCondition()
		const controller = blocker.create(() => true)
		await condition(detail('/posts/1/edit', '', { id: '1' }))

		const pending = condition(detail('/posts'))
		controller.reset()
		await pending

		expect(blocker.acceptedLocation).toMatchObject({ path: '/posts/1/edit' })
	})

	it('should advance once the navigation proceeds', async () => {
		const condition = blocker.createBlockerCondition()
		const controller = blocker.create(() => true)
		await condition(detail('/posts/1/edit', '', { id: '1' }))

		const pending = condition(detail('/posts'))
		controller.proceed()
		await pending

		expect(blocker.acceptedLocation).toMatchObject({ path: '/posts' })
	})
})

describe('withBlocker', () => {
	const Component = (() => {}) as any

	it('should wrap a plain route with a condition', () => {
		const routes = blocker.withBlocker({ '/posts': Component })

		expect(routes['/posts']).toMatchObject({
			conditions: [expect.any(Function)],
		})
	})

	it('should keep the options of an already wrapped route', () => {
		const wrapped = wrap({
			component: Component,
			props: { foo: 'bar' },
			userData: { baz: 'qux' },
			conditions: () => true,
		})

		const routes = blocker.withBlocker({ '/posts': wrapped })

		expect(routes['/posts']).toMatchObject({
			component: wrapped.component,
			props: { foo: 'bar' },
			userData: { baz: 'qux' },
			conditions: [expect.any(Function), wrapped.conditions![0]],
		})
		// The router rejects a route that lost this marker.
		expect((routes['/posts'] as any)._sveltesparouter).toBe(true)
		// The caller's own route table must not gain the condition.
		expect(wrapped.conditions).toHaveLength(1)
	})

	it('should support a Map of routes', () => {
		const routes = blocker.withBlocker(new Map([['/posts', Component]]))

		expect(routes.get('/posts')).toMatchObject({
			conditions: [expect.any(Function)],
		})
	})
})
