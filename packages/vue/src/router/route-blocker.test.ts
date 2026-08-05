import type { Router, RouterBlockShouldFn, RouterBlockShouldInput, RouterLocation } from '@ginjou/core'
import { describe, expect, it, vi } from 'vitest'
import { ref, unref } from 'vue-demi'
import { mountSetup } from '../../test/mount'
import { useRouteBlocker } from './route-blocker'

const LOCATION: RouterLocation = { path: '/posts' }

function createBlockerContext(
	unload = false,
): RouterBlockShouldInput {
	return {
		currentLocation: LOCATION,
		nextLocation: unload ? undefined : { path: '/posts/1' },
	}
}

function createMockRouter(
	withBlocker = true,
) {
	let shouldBlock: RouterBlockShouldFn | undefined
	let changeLocation: ((value: RouterLocation) => void) | undefined

	const handle = {
		unregister: vi.fn(() => {
			shouldBlock = undefined
		}),
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
		isRegistered: () => shouldBlock != null,
		callShouldBlock: (unload?: boolean) => shouldBlock!(createBlockerContext(unload)),
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

	it('should not change state when the page is unloading', () => {
		const { router, callShouldBlock } = createMockRouter()

		const { result } = mountSetup(() => useRouteBlocker({ shouldBlock: true }, { router }))

		expect(callShouldBlock(true)).toBe(true)
		expect(unref(result.state)).toBe('unblocked')
	})

	it('should support a shouldBlock function receiving the context', () => {
		const { router, callShouldBlock } = createMockRouter()
		const fn = vi.fn((context: RouterBlockShouldInput): boolean => context.nextLocation != null)

		const { result } = mountSetup(() => useRouteBlocker({ shouldBlock: fn }, { router }))

		expect(callShouldBlock()).toBe(true)
		expect(unref(result.state)).toBe('blocked')
		expect(fn).toHaveBeenCalledOnce()
		expect(fn.mock.calls[0][0]).toEqual(createBlockerContext())

		expect(callShouldBlock(true)).toBe(false)
		expect(fn.mock.calls[1][0]).toEqual(createBlockerContext(true))

		// unwrapping must use `unref`, not `toValue` — otherwise the fn is called as a 0-arg getter
		for (const [context] of fn.mock.calls)
			expect(context).toBeDefined()
	})

	it('should register by default', () => {
		const { router, isRegistered } = createMockRouter()

		mountSetup(() => useRouteBlocker({ shouldBlock: false }, { router }))

		expect(isRegistered()).toBe(true)
	})

	it('should register and unregister with enabled', () => {
		const { router, handle, isRegistered } = createMockRouter()
		const enabled = ref(false)

		mountSetup(() => useRouteBlocker({ enabled, shouldBlock: true }, { router }))

		expect(isRegistered()).toBe(false)

		enabled.value = true
		expect(isRegistered()).toBe(true)

		enabled.value = false
		expect(isRegistered()).toBe(false)
		expect(handle.unregister).toHaveBeenCalledOnce()
	})

	it('should keep the entry while a navigation is held on it', () => {
		const { router, handle, isRegistered, callShouldBlock } = createMockRouter()
		const enabled = ref(true)

		const { result } = mountSetup(() => useRouteBlocker({ enabled, shouldBlock: true }, { router }))

		expect(callShouldBlock()).toBe(true)
		expect(unref(result.state)).toBe('blocked')

		enabled.value = false
		expect(isRegistered()).toBe(true)
		expect(handle.unregister).not.toHaveBeenCalled()

		result.reset()
		expect(unref(result.state)).toBe('unblocked')
		expect(isRegistered()).toBe(false)
	})

	it('should stay registered while shouldBlock is false', () => {
		const { router, isRegistered, callShouldBlock } = createMockRouter()
		const shouldBlock = ref(true)

		mountSetup(() => useRouteBlocker({ enabled: true, shouldBlock }, { router }))

		shouldBlock.value = false

		expect(isRegistered()).toBe(true)
		expect(callShouldBlock()).toBe(false)
	})

	it('should keep the entry through proceed', () => {
		const { router, handle, isRegistered, callShouldBlock } = createMockRouter()
		const shouldBlock = ref(true)

		const { result } = mountSetup(() => useRouteBlocker({ enabled: true, shouldBlock }, { router }))

		expect(callShouldBlock()).toBe(true)
		shouldBlock.value = false

		result.proceed()

		expect(handle.proceed).toHaveBeenCalledOnce()
		expect(handle.unregister).not.toHaveBeenCalled()
		expect(isRegistered()).toBe(true)
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

		expect(unref(result.state)).toBe('unblocked')
	})
})
