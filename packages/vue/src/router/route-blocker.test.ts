import type { Router, RouterBlockerStateValues, RouterBlockShouldFn, RouterBlockShouldInput, RouterLocation } from '@ginjou/core'
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
	let publish: ((state: RouterBlockerStateValues) => void) | undefined

	const controller = {
		state: 'unblocked' as RouterBlockerStateValues,
		subscribe: vi.fn((handler: (state: RouterBlockerStateValues) => void) => {
			publish = handler
			return () => {
				publish = undefined
			}
		}),
		proceed: vi.fn(),
		reset: vi.fn(),
		dispose: vi.fn(() => {
			shouldBlock = undefined
			publish = undefined
		}),
	}

	const router: Router = {
		go: vi.fn(),
		back: vi.fn(),
		resolve: vi.fn(),
		getLocation: () => LOCATION,
		onChangeLocation: () => vi.fn(),
		...withBlocker
			? {
					blocker: vi.fn((fn: RouterBlockShouldFn) => {
						shouldBlock = fn
						return controller
					}),
				}
			: {},
	}

	return {
		router,
		controller,
		isRegistered: () => shouldBlock != null,
		callShouldBlock: (unload?: boolean) => shouldBlock!(createBlockerContext(unload)),
		emitState: (state: RouterBlockerStateValues) => {
			controller.state = state
			publish?.(state)
		},
	}
}

describe('useRouteBlocker', () => {
	it('should report the state the registry publishes', () => {
		const { router, emitState } = createMockRouter()

		const { result } = mountSetup(() => useRouteBlocker({ shouldBlock: true }, { router }))

		expect(unref(result.state)).toBe('unblocked')

		emitState('blocked')
		expect(unref(result.state)).toBe('blocked')

		emitState('proceeding')
		expect(unref(result.state)).toBe('proceeding')

		emitState('unblocked')
		expect(unref(result.state)).toBe('unblocked')
	})

	it('should forward proceed and reset', () => {
		const { router, controller } = createMockRouter()

		const { result } = mountSetup(() => useRouteBlocker({ shouldBlock: true }, { router }))

		result.proceed()
		result.reset()

		expect(controller.proceed).toHaveBeenCalledOnce()
		expect(controller.reset).toHaveBeenCalledOnce()
	})

	it('should register a predicate reading the current shouldBlock', () => {
		const { router, callShouldBlock } = createMockRouter()
		const shouldBlock = ref(false)

		mountSetup(() => useRouteBlocker({ shouldBlock }, { router }))

		expect(callShouldBlock()).toBe(false)

		shouldBlock.value = true

		expect(callShouldBlock()).toBe(true)
	})

	it('should support a shouldBlock function receiving the context', () => {
		const { router, callShouldBlock } = createMockRouter()
		const fn = vi.fn((context: RouterBlockShouldInput): boolean => context.nextLocation != null)

		mountSetup(() => useRouteBlocker({ shouldBlock: fn }, { router }))

		expect(callShouldBlock()).toBe(true)
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

	// `enabled` is the lifecycle switch, and nothing else: `shouldBlock` going false leaves the
	// registration alone, because a page with nothing unsaved still owns the next navigation.
	it('should register and unregister with enabled', () => {
		const { router, controller, isRegistered } = createMockRouter()
		const enabled = ref(false)

		mountSetup(() => useRouteBlocker({ enabled, shouldBlock: true }, { router }))

		expect(isRegistered()).toBe(false)

		enabled.value = true
		expect(isRegistered()).toBe(true)

		enabled.value = false
		expect(isRegistered()).toBe(false)
		expect(controller.dispose).toHaveBeenCalledOnce()
	})

	it('should stay registered while shouldBlock changes', () => {
		const { router, controller, isRegistered } = createMockRouter()
		const shouldBlock = ref(true)

		mountSetup(() => useRouteBlocker({ enabled: true, shouldBlock }, { router }))

		shouldBlock.value = false

		expect(isRegistered()).toBe(true)
		expect(controller.dispose).not.toHaveBeenCalled()
		expect(router.blocker).toHaveBeenCalledOnce()
	})

	it('should stop listening before it disposes', () => {
		const { router, controller, emitState } = createMockRouter()
		const enabled = ref(true)

		const { result } = mountSetup(() => useRouteBlocker({ enabled, shouldBlock: true }, { router }))

		emitState('blocked')
		expect(unref(result.state)).toBe('blocked')

		enabled.value = false

		expect(controller.dispose).toHaveBeenCalledOnce()
		expect(unref(result.state)).toBe('unblocked')

		emitState('blocked')
		expect(unref(result.state)).toBe('unblocked')
	})

	it('should dispose on unmount', () => {
		const { router, controller } = createMockRouter()

		const { unmount } = mountSetup(() => useRouteBlocker({ shouldBlock: true }, { router }))

		expect(controller.dispose).not.toHaveBeenCalled()

		unmount()

		expect(controller.dispose).toHaveBeenCalledOnce()
	})

	it('should degrade to a no-op when blocker is not implemented', () => {
		const { router } = createMockRouter(false)

		const { result } = mountSetup(() => useRouteBlocker({ shouldBlock: true }, { router }))

		result.proceed()
		result.reset()

		expect(unref(result.state)).toBe('unblocked')
	})
})
