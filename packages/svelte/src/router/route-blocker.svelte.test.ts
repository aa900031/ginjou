import type { Router, RouterBlockShouldFn, RouterBlockShouldInput } from '@ginjou/core'
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

function flushWatch(): void {
	mocks.watchRuns.forEach(run => run())
}

function createBlockerContext(
	unload = false,
): RouterBlockShouldInput {
	return {
		currentLocation: { pathname: '/current' } as any,
		nextLocation: unload ? undefined : { pathname: '/next' } as any,
	}
}

function createRouter() {
	const handle = {
		unregister: vi.fn(),
		proceed: vi.fn(),
		reset: vi.fn(),
	}
	const unsubscribe = vi.fn()
	let shouldBlock: RouterBlockShouldFn | undefined
	let onChange: (() => void) | undefined

	const router = {
		go: vi.fn(),
		back: vi.fn(),
		resolve: vi.fn(),
		getLocation: vi.fn(),
		onChangeLocation: vi.fn((fn: (...args: any[]) => void) => {
			onChange = fn
			return unsubscribe
		}),
		blocker: vi.fn((fn: RouterBlockShouldFn) => {
			shouldBlock = fn
			return handle
		}),
	} satisfies Router

	return {
		router,
		handle,
		unsubscribe,
		callShouldBlock: (unload?: boolean) => shouldBlock!(createBlockerContext(unload)),
		emitChangeLocation: () => onChange!(),
	}
}

describe('useRouteBlocker', () => {
	beforeEach(() => {
		mocks.onDestroy.mockReset()
		mocks.useRouterContext.mockReset()
		mocks.watchRuns.length = 0
		mocks.stopWatch.mockReset()
	})

	it('should transition unblocked -> blocked -> proceeding -> unblocked', () => {
		const { router, handle, callShouldBlock, emitChangeLocation } = createRouter()
		mocks.useRouterContext.mockReturnValue(router)

		const result = useRouteBlocker(() => ({ shouldBlock: true }))

		expect(result.state).toBe('unblocked')

		expect(callShouldBlock()).toBe(true)
		expect(result.state).toBe('blocked')

		result.proceed()
		expect(result.state).toBe('proceeding')
		expect(handle.proceed).toHaveBeenCalledOnce()

		emitChangeLocation()
		expect(result.state).toBe('unblocked')
	})

	it('should reset back to unblocked', () => {
		const { router, handle, callShouldBlock } = createRouter()
		mocks.useRouterContext.mockReturnValue(router)

		const result = useRouteBlocker(() => ({ shouldBlock: true }))

		callShouldBlock()
		expect(result.state).toBe('blocked')

		result.reset()
		expect(result.state).toBe('unblocked')
		expect(handle.reset).toHaveBeenCalledOnce()
	})

	it('should register by default', () => {
		const { router } = createRouter()
		mocks.useRouterContext.mockReturnValue(router)

		useRouteBlocker(() => ({ shouldBlock: false }))

		expect(router.blocker).toHaveBeenCalledOnce()
	})

	it('should register and unregister with enabled', () => {
		const { router, handle } = createRouter()
		mocks.useRouterContext.mockReturnValue(router)
		let enabled = $state(false)

		useRouteBlocker(() => ({ enabled, shouldBlock: true }))

		expect(router.blocker).not.toHaveBeenCalled()

		enabled = true
		flushWatch()
		expect(router.blocker).toHaveBeenCalledOnce()

		enabled = false
		flushWatch()
		expect(handle.unregister).toHaveBeenCalledOnce()
	})

	it('should keep the entry while a navigation is held on it', () => {
		const { router, handle, callShouldBlock } = createRouter()
		mocks.useRouterContext.mockReturnValue(router)
		let enabled = $state(true)

		const result = useRouteBlocker(() => ({ enabled, shouldBlock: true }))

		expect(callShouldBlock()).toBe(true)
		expect(result.state).toBe('blocked')

		enabled = false
		flushWatch()
		expect(handle.unregister).not.toHaveBeenCalled()

		result.reset()
		flushWatch()
		expect(result.state).toBe('unblocked')
		expect(handle.unregister).toHaveBeenCalledOnce()
	})

	it('should stay registered while shouldBlock is false', () => {
		const { router, handle, callShouldBlock } = createRouter()
		mocks.useRouterContext.mockReturnValue(router)
		let shouldBlock = $state(true)

		useRouteBlocker(() => ({ enabled: true, shouldBlock }))

		shouldBlock = false
		flushWatch()

		expect(handle.unregister).not.toHaveBeenCalled()
		expect(callShouldBlock()).toBe(false)
	})

	it('should keep the entry through proceed', () => {
		const { router, handle, callShouldBlock } = createRouter()
		mocks.useRouterContext.mockReturnValue(router)
		let shouldBlock = $state(true)

		const result = useRouteBlocker(() => ({ enabled: true, shouldBlock }))

		expect(callShouldBlock()).toBe(true)
		shouldBlock = false
		result.proceed()
		flushWatch()

		expect(handle.proceed).toHaveBeenCalledOnce()
		expect(handle.unregister).not.toHaveBeenCalled()
	})

	it('should keep the state untouched on unload', () => {
		const { router, callShouldBlock } = createRouter()
		mocks.useRouterContext.mockReturnValue(router)

		const result = useRouteBlocker(() => ({ shouldBlock: true }))

		expect(callShouldBlock(true)).toBe(true)
		expect(result.state).toBe('unblocked')
	})

	it('should support a shouldBlock function receiving the context', () => {
		const { router, callShouldBlock } = createRouter()
		mocks.useRouterContext.mockReturnValue(router)
		const fn = vi.fn((context: RouterBlockShouldInput): boolean => context.nextLocation != null)

		const result = useRouteBlocker(() => ({ shouldBlock: fn }))

		expect(callShouldBlock()).toBe(true)
		expect(result.state).toBe('blocked')
		expect(fn.mock.calls[0][0]).toEqual(createBlockerContext())

		expect(callShouldBlock(true)).toBe(false)
		expect(fn.mock.calls[1][0]).toEqual(createBlockerContext(true))
	})

	it('should unregister and unsubscribe on destroy', () => {
		const { router, handle, unsubscribe } = createRouter()
		mocks.useRouterContext.mockReturnValue(router)

		useRouteBlocker(() => ({ shouldBlock: true }))

		expect(mocks.onDestroy).toHaveBeenCalledOnce()
		mocks.onDestroy.mock.calls[0][0]()

		expect(handle.unregister).toHaveBeenCalledOnce()
		expect(unsubscribe).toHaveBeenCalledOnce()
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
