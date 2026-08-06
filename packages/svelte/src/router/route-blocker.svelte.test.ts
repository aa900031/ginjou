import type { Router, RouterBlockerStateValues, RouterBlockShouldFn, RouterBlockShouldInput } from '@ginjou/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useRouteBlocker } from './route-blocker.svelte'

const mocks = vi.hoisted(() => ({
	onDestroy: vi.fn(),
	useRouterContext: vi.fn(),
	watchRuns: [] as Array<() => void>,
	stopWatch: vi.fn(),
}))

vi.mock('svelte', () => ({
	onDestroy: mocks.onDestroy,
}))

vi.mock('./context', () => ({
	useRouterContext: mocks.useRouterContext,
}))

vi.mock('../utils/watch.svelte', () => ({
	watch(
		source: () => unknown,
		callback: (value: unknown, oldValue: unknown) => void,
		options?: { immediate?: boolean },
	) {
		const run = (): void => callback(source(), undefined)

		mocks.watchRuns.push(run)
		if (options?.immediate)
			run()

		return mocks.stopWatch
	},
}))

/** This `watch` re-runs its callback on any dependency change, not only on a changed value. */
function flushWatch(): void {
	mocks.watchRuns.forEach(run => run())
}

function createBlockerContext(
	unload = false,
): RouterBlockShouldInput {
	return {
		currentLocation: { path: '/posts' },
		nextLocation: unload ? undefined : { path: '/posts/1' },
	}
}

/**
 * Stands in for a router adapter's registry: the hook is only the reactive bridge, so what it is
 * given is a controller whose state the registry publishes.
 */
function createRouter() {
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

	const router = {
		go: vi.fn(),
		back: vi.fn(),
		resolve: vi.fn(),
		getLocation: vi.fn(),
		onChangeLocation: vi.fn(),
		blocker: vi.fn((fn: RouterBlockShouldFn) => {
			shouldBlock = fn
			return controller
		}),
	} satisfies Router

	return {
		router,
		controller,
		isRegistered: () => shouldBlock != null,
		callShouldBlock: (unload?: boolean) => shouldBlock!(createBlockerContext(unload)),
		/** What the registry does when it publishes a transition to this blocker. */
		emitState: (state: RouterBlockerStateValues) => {
			controller.state = state
			publish?.(state)
		},
	}
}

describe('useRouteBlocker', () => {
	beforeEach(() => {
		mocks.onDestroy.mockReset()
		mocks.useRouterContext.mockReset()
		mocks.watchRuns.length = 0
		mocks.stopWatch.mockReset()
	})

	it('should report the state the registry publishes', () => {
		const { router, emitState } = createRouter()
		mocks.useRouterContext.mockReturnValue(router)

		const result = useRouteBlocker(() => ({ shouldBlock: true }))

		expect(result.state).toBe('unblocked')

		emitState('blocked')
		expect(result.state).toBe('blocked')

		emitState('proceeding')
		expect(result.state).toBe('proceeding')

		emitState('unblocked')
		expect(result.state).toBe('unblocked')
	})

	it('should forward proceed and reset', () => {
		const { router, controller } = createRouter()
		mocks.useRouterContext.mockReturnValue(router)

		const result = useRouteBlocker(() => ({ shouldBlock: true }))

		result.proceed()
		result.reset()

		expect(controller.proceed).toHaveBeenCalledOnce()
		expect(controller.reset).toHaveBeenCalledOnce()
	})

	it('should register a predicate reading the current shouldBlock', () => {
		const { router, callShouldBlock } = createRouter()
		mocks.useRouterContext.mockReturnValue(router)
		let shouldBlock = $state(false)

		useRouteBlocker(() => ({ shouldBlock }))

		expect(callShouldBlock()).toBe(false)

		shouldBlock = true

		expect(callShouldBlock()).toBe(true)
	})

	it('should support a shouldBlock function receiving the context', () => {
		const { router, callShouldBlock } = createRouter()
		mocks.useRouterContext.mockReturnValue(router)
		const fn = vi.fn((context: RouterBlockShouldInput): boolean => context.nextLocation != null)

		useRouteBlocker(() => ({ shouldBlock: fn }))

		expect(callShouldBlock()).toBe(true)
		expect(fn.mock.calls[0][0]).toEqual(createBlockerContext())

		expect(callShouldBlock(true)).toBe(false)
		expect(fn.mock.calls[1][0]).toEqual(createBlockerContext(true))
	})

	it('should register by default', () => {
		const { router } = createRouter()
		mocks.useRouterContext.mockReturnValue(router)

		useRouteBlocker(() => ({ shouldBlock: false }))

		expect(router.blocker).toHaveBeenCalledOnce()
	})

	// `enabled` is the lifecycle switch, and nothing else: `shouldBlock` going false leaves the
	// registration alone, because a page with nothing unsaved still owns the next navigation.
	it('should register and unregister with enabled', () => {
		const { router, controller, isRegistered } = createRouter()
		mocks.useRouterContext.mockReturnValue(router)
		let enabled = $state(false)

		useRouteBlocker(() => ({ enabled, shouldBlock: true }))

		expect(router.blocker).not.toHaveBeenCalled()

		enabled = true
		flushWatch()
		expect(isRegistered()).toBe(true)

		enabled = false
		flushWatch()
		expect(isRegistered()).toBe(false)
		expect(controller.dispose).toHaveBeenCalledOnce()
	})

	// The callback runs on any dependency change, so without the unchanged-value guard a page being
	// asked about would be re-registered at the end of the queue with its hold thrown away.
	it('should stay registered while shouldBlock changes', () => {
		const { router, controller } = createRouter()
		mocks.useRouterContext.mockReturnValue(router)
		let shouldBlock = $state(true)

		useRouteBlocker(() => ({ enabled: true, shouldBlock }))

		shouldBlock = false
		flushWatch()

		expect(controller.dispose).not.toHaveBeenCalled()
		expect(router.blocker).toHaveBeenCalledOnce()
	})

	// Disposing while `blocked` cancels the navigation for every participant, and the registry is
	// what tells the others. This one is on its way out, so it stops listening first.
	it('should stop listening before it disposes', () => {
		const { router, controller, emitState } = createRouter()
		mocks.useRouterContext.mockReturnValue(router)
		let enabled = $state(true)

		const result = useRouteBlocker(() => ({ enabled, shouldBlock: true }))

		emitState('blocked')
		expect(result.state).toBe('blocked')

		enabled = false
		flushWatch()

		expect(controller.dispose).toHaveBeenCalledOnce()
		expect(result.state).toBe('unblocked')

		emitState('blocked')
		expect(result.state).toBe('unblocked')
	})

	it('should dispose and stop watching on destroy', () => {
		const { router, controller } = createRouter()
		mocks.useRouterContext.mockReturnValue(router)

		useRouteBlocker(() => ({ shouldBlock: true }))

		expect(mocks.onDestroy).toHaveBeenCalledOnce()
		mocks.onDestroy.mock.calls[0][0]()

		expect(controller.dispose).toHaveBeenCalledOnce()
		expect(mocks.stopWatch).toHaveBeenCalledOnce()
	})

	it('should degrade to a no-op when blocker is not implemented', () => {
		const router = {
			go: vi.fn(),
			back: vi.fn(),
			resolve: vi.fn(),
			getLocation: vi.fn(),
			onChangeLocation: vi.fn(),
		} satisfies Router
		mocks.useRouterContext.mockReturnValue(router)

		const result = useRouteBlocker(() => ({ shouldBlock: true }))

		result.proceed()
		result.reset()
		expect(result.state).toBe('unblocked')
		expect(mocks.onDestroy).not.toHaveBeenCalled()
	})
})
