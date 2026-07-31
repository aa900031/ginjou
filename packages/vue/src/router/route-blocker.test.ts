import type { Router, RouterBlockShouldFn, RouterBlockShouldInput, RouterLocation } from '@ginjou/core'
import { RouterBlockerAction } from '@ginjou/core'
import { describe, expect, it, vi } from 'vitest'
import { ref, unref } from 'vue-demi'
import { mountSetup } from '../../test/mount'
import { useRouteBlocker } from './route-blocker'

const LOCATION: RouterLocation = { path: '/posts' }

function createBlockerContext(
	action: RouterBlockShouldInput['action'] = RouterBlockerAction.Push,
): RouterBlockShouldInput {
	return {
		currentLocation: LOCATION,
		nextLocation: action === RouterBlockerAction.Unload ? undefined : { path: '/posts/1' },
		action,
	}
}

function createMockRouter(
	withBlocker = true,
) {
	let shouldBlock: RouterBlockShouldFn | undefined
	let changeLocation: ((value: RouterLocation) => void) | undefined

	const handle = {
		unregister: vi.fn(),
		proceed: vi.fn(),
		reset: vi.fn(),
	}

	const router: Router = {
		go: vi.fn(),
		back: vi.fn(),
		resolve: vi.fn(),
		getLocation: () => LOCATION,
		onChangeLocation: (handler) => {
			changeLocation = handler
			return vi.fn()
		},
		...withBlocker
			? {
					blocker: (fn: RouterBlockShouldFn) => {
						shouldBlock = fn
						return handle
					},
				}
			: {},
	}

	return {
		router,
		handle,
		callShouldBlock: (action?: RouterBlockShouldInput['action']) => shouldBlock!(createBlockerContext(action)),
		emitChangeLocation: () => changeLocation?.({ path: '/posts/1' }),
	}
}

describe('useRouteBlocker', () => {
	it('should switch between unblocked, blocked and proceeding', () => {
		const { router, handle, callShouldBlock, emitChangeLocation } = createMockRouter()
		const shouldBlock = ref(false)

		const { result } = mountSetup(() => useRouteBlocker({ shouldBlock }, { router }))

		expect(callShouldBlock()).toBe(false)
		expect(unref(result.state)).toBe('unblocked')

		shouldBlock.value = true
		expect(callShouldBlock()).toBe(true)
		expect(unref(result.state)).toBe('blocked')

		result.proceed()
		expect(handle.proceed).toHaveBeenCalled()
		expect(unref(result.state)).toBe('proceeding')

		emitChangeLocation()
		expect(unref(result.state)).toBe('unblocked')
	})

	it('should back to unblocked on reset', () => {
		const { router, handle, callShouldBlock } = createMockRouter()

		const { result } = mountSetup(() => useRouteBlocker({ shouldBlock: true }, { router }))

		expect(callShouldBlock()).toBe(true)
		expect(unref(result.state)).toBe('blocked')

		result.reset()
		expect(handle.reset).toHaveBeenCalled()
		expect(unref(result.state)).toBe('unblocked')
	})

	it('should not change state on unload action', () => {
		const { router, callShouldBlock } = createMockRouter()

		const { result } = mountSetup(() => useRouteBlocker({ shouldBlock: true }, { router }))

		expect(callShouldBlock(RouterBlockerAction.Unload)).toBe(true)
		expect(unref(result.state)).toBe('unblocked')
	})

	it('should support a shouldBlock function receiving the context', () => {
		const { router, callShouldBlock } = createMockRouter()
		const fn = vi.fn((context: RouterBlockShouldInput): boolean => context.action !== RouterBlockerAction.Unload)

		const { result } = mountSetup(() => useRouteBlocker({ shouldBlock: fn }, { router }))

		expect(callShouldBlock(RouterBlockerAction.Push)).toBe(true)
		expect(unref(result.state)).toBe('blocked')
		expect(fn).toHaveBeenCalledOnce()
		expect(fn.mock.calls[0][0]).toEqual(createBlockerContext(RouterBlockerAction.Push))

		expect(callShouldBlock(RouterBlockerAction.Unload)).toBe(false)
		expect(fn.mock.calls[1][0]).toEqual(createBlockerContext(RouterBlockerAction.Unload))

		// unwrapping must use `unref`, not `toValue` — otherwise the fn is called as a 0-arg getter
		for (const [context] of fn.mock.calls)
			expect(context).toBeDefined()
	})

	it('should unregister on unmount', () => {
		const { router, handle } = createMockRouter()

		const { unmount } = mountSetup(() => useRouteBlocker({ shouldBlock: true }, { router }))

		expect(handle.unregister).not.toHaveBeenCalled()

		unmount()

		expect(handle.unregister).toHaveBeenCalled()
	})

	it('should degrade to a no-op when blocker is not implemented', () => {
		const { router } = createMockRouter(false)

		const { result } = mountSetup(() => useRouteBlocker({ shouldBlock: true }, { router }))

		expect(unref(result.state)).toBe('unblocked')

		result.proceed()
		result.reset()
		expect(unref(result.state)).toBe('unblocked')
	})
})
