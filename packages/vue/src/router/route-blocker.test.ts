import type { Router, RouterBlockerProps, RouterBlockerStateValues, RouterBlockShouldFn, RouterBlockShouldInput, RouterLocation } from '@ginjou/core'
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
	let registeredEnabled: boolean | undefined
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
		setEnabled: vi.fn(),
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
					blocker: vi.fn((props: RouterBlockerProps) => {
						shouldBlock = props.should
						registeredEnabled = props.enabled
						return controller
					}),
				}
			: {},
	}

	return {
		router,
		controller,
		isRegistered: () => shouldBlock != null,
		/** The `enabled` the blocker was registered with, before any `setEnabled`. */
		registeredEnabled: () => registeredEnabled,
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
	//
	// It toggles rather than registers, because registration order is the order blockers are asked
	// in: re-registering would silently move the page to the back of the queue.
	it('should toggle participation with enabled without registering again', () => {
		const { router, controller, isRegistered, registeredEnabled } = createMockRouter()
		const enabled = ref(false)

		mountSetup(() => useRouteBlocker({ enabled, shouldBlock: true }, { router }))

		// Registered with it, not switched off a moment later: a blocker that is set up disabled must
		// never count as one that can block, not even for the tick before the watch catches up.
		expect(isRegistered()).toBe(true)
		expect(registeredEnabled()).toBe(false)
		expect(controller.setEnabled).not.toHaveBeenCalled()

		enabled.value = true
		expect(controller.setEnabled.mock.calls).toEqual([[true]])

		enabled.value = false
		expect(controller.setEnabled.mock.calls).toEqual([[true], [false]])

		expect(router.blocker).toHaveBeenCalledOnce()
		expect(controller.dispose).not.toHaveBeenCalled()
	})

	it('should register enabled by default', () => {
		const { router, registeredEnabled } = createMockRouter()

		mountSetup(() => useRouteBlocker({ shouldBlock: true }, { router }))

		expect(registeredEnabled()).toBe(true)
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
		const { router, emitState } = createMockRouter()

		const { result, unmount } = mountSetup(() => useRouteBlocker({ shouldBlock: true }, { router }))

		emitState('blocked')
		expect(unref(result.state)).toBe('blocked')

		unmount()

		emitState('proceeding')
		expect(unref(result.state)).toBe('blocked')
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
