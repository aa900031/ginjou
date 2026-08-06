import type { Router, RouterLocation } from '@ginjou/core'
import { RouteBlocker, WarnUnsaved } from '@ginjou/core'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick, unref } from 'vue-demi'
import { mountSetup } from '../../test/mount'
import { useWarnUnsaved } from './warn-unsaved'

const LOCATION: RouterLocation = { path: '/posts/1/edit' }

/**
 * The real registry rather than a stub handle: what this covers is the confirm travelling from a
 * held navigation to the answer that settles it, and the registry is what carries it.
 */
function createMockRouter() {
	const blockers = RouteBlocker.createRegistry()

	const router: Router = {
		go: vi.fn(),
		back: vi.fn(),
		resolve: vi.fn(),
		getLocation: () => LOCATION,
		onChangeLocation: () => vi.fn(),
		blocker: blockers.create,
	}

	return {
		router,
		navigate: (nextPath = '/posts') => blockers.run({
			currentLocation: LOCATION,
			nextLocation: { path: nextPath, query: { page: '2' } },
		}),
		unload: () => blockers.anyBlocking({
			currentLocation: LOCATION,
			nextLocation: undefined,
		}),
	}
}

describe('useWarnUnsaved', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it('should use the browser confirmation by default', async () => {
		const { router, navigate } = createMockRouter()
		const confirm = vi.fn(() => true)
		vi.stubGlobal('confirm', confirm)

		const { result } = mountSetup(() => useWarnUnsaved({ enabled: true }, { router }))

		result.active.value = true

		await expect(navigate()).resolves.toBe(true)
		expect(confirm).toHaveBeenCalledWith('You have unsaved changes. Are you sure you want to leave this page?')
	})

	it('should proceed when confirmed', async () => {
		const { router, navigate } = createMockRouter()
		const confirm = vi.fn(() => Promise.resolve(true))

		const { result } = mountSetup(() => useWarnUnsaved({ enabled: true, confirm }, { router }))

		result.active.value = true
		expect(unref(result.state)).toBe(WarnUnsaved.State.Active)

		await expect(navigate()).resolves.toBe(true)
		expect(confirm).toHaveBeenCalledTimes(1)
	})

	it('should reset when not confirmed', async () => {
		const { router, navigate } = createMockRouter()
		const confirm = vi.fn(() => Promise.resolve(false))

		const { result } = mountSetup(() => useWarnUnsaved({ enabled: true, confirm }, { router }))

		result.active.value = true

		await expect(navigate()).resolves.toBe(false)
		expect(confirm).toHaveBeenCalledTimes(1)
	})

	it('should not block when disabled', () => {
		const { router, navigate } = createMockRouter()
		const confirm = vi.fn(() => true)

		const { result } = mountSetup(() => useWarnUnsaved({ enabled: false, confirm }, { router }))

		result.active.value = true

		expect(unref(result.state)).toBe(WarnUnsaved.State.Inactive)
		// Synchronous, so there was nothing registered to hold it.
		expect(navigate()).toBe(true)
		expect(confirm).not.toHaveBeenCalled()
	})

	// Every navigation reaches the predicate now, so this is where the default judgement lives:
	// unsaved work cares about leaving the page, not about the query changing under it.
	it('should not block a navigation that only changes the query', () => {
		const { router, navigate } = createMockRouter()
		const confirm = vi.fn(() => true)

		const { result } = mountSetup(() => useWarnUnsaved({ enabled: true, confirm }, { router }))

		result.active.value = true

		// Synchronous, so nothing held it: the route stays mounted and nothing was torn down.
		expect(navigate(LOCATION.path)).toBe(true)
		expect(confirm).not.toHaveBeenCalled()
	})

	it('should prevent an unload while there is unsaved work', () => {
		const { router, unload } = createMockRouter()

		const { result } = mountSetup(() => useWarnUnsaved({ enabled: true }, { router }))

		expect(unload()).toBe(false)

		result.active.value = true

		expect(unload()).toBe(true)
	})

	it('should be confirming while the confirm fn is pending', async () => {
		const { router, navigate } = createMockRouter()
		let resolveConfirm: (value: boolean) => void
		const confirm = vi.fn(() => new Promise<boolean>((resolve) => {
			resolveConfirm = resolve
		}))

		const { result } = mountSetup(() => useWarnUnsaved({ enabled: true, confirm }, { router }))

		result.active.value = true
		const navigation = navigate()
		await nextTick()

		await vi.waitFor(() => {
			expect(unref(result.state)).toBe(WarnUnsaved.State.Confirming)
		})

		resolveConfirm!(true)
		await expect(navigation).resolves.toBe(true)
		await vi.waitFor(() => {
			expect(unref(result.state)).toBe(WarnUnsaved.State.Active)
		})
		expect(result.active.value).toBe(true)
	})
})
