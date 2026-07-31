import type { Router, RouterBlockShouldFn, RouterBlockShouldInput } from '@ginjou/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useRouteBlocker } from './route-blocker.svelte'

const mocks = vi.hoisted(() => ({
	onDestroy: vi.fn(),
	useRouterContext: vi.fn(),
}))

vi.mock('svelte', () => ({
	onDestroy: mocks.onDestroy,
}))

vi.mock('./context', () => ({
	useRouterContext: mocks.useRouterContext,
}))

function createBlockerContext(
	action: RouterBlockShouldInput['action'],
): RouterBlockShouldInput {
	return {
		currentLocation: { pathname: '/current' } as any,
		nextLocation: action === 'unload' ? undefined : { pathname: '/next' } as any,
		action,
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
		callShouldBlock: (action: RouterBlockShouldInput['action']) => shouldBlock!(createBlockerContext(action)),
		emitChangeLocation: () => onChange!(),
	}
}

describe('useRouteBlocker', () => {
	beforeEach(() => {
		mocks.onDestroy.mockReset()
		mocks.useRouterContext.mockReset()
	})

	it('should transition unblocked -> blocked -> proceeding -> unblocked', () => {
		const { router, handle, callShouldBlock, emitChangeLocation } = createRouter()
		mocks.useRouterContext.mockReturnValue(router)

		const result = useRouteBlocker(() => ({ shouldBlock: true }))

		expect(result.state).toBe('unblocked')

		expect(callShouldBlock('push')).toBe(true)
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

		callShouldBlock('push')
		expect(result.state).toBe('blocked')

		result.reset()
		expect(result.state).toBe('unblocked')
		expect(handle.reset).toHaveBeenCalledOnce()
	})

	it('should not block when shouldBlock is false', () => {
		const { router, callShouldBlock } = createRouter()
		mocks.useRouterContext.mockReturnValue(router)

		const result = useRouteBlocker(() => ({ shouldBlock: false }))

		expect(callShouldBlock('push')).toBe(false)
		expect(result.state).toBe('unblocked')
	})

	it('should keep the state untouched on unload', () => {
		const { router, callShouldBlock } = createRouter()
		mocks.useRouterContext.mockReturnValue(router)

		const result = useRouteBlocker(() => ({ shouldBlock: true }))

		expect(callShouldBlock('unload')).toBe(true)
		expect(result.state).toBe('unblocked')
	})

	it('should support a shouldBlock function receiving the context', () => {
		const { router, callShouldBlock } = createRouter()
		mocks.useRouterContext.mockReturnValue(router)
		const fn = vi.fn((context: RouterBlockShouldInput): boolean => context.action !== 'unload')

		const result = useRouteBlocker(() => ({ shouldBlock: fn }))

		expect(callShouldBlock('push')).toBe(true)
		expect(result.state).toBe('blocked')
		expect(fn.mock.calls[0][0]).toEqual(createBlockerContext('push'))

		expect(callShouldBlock('unload')).toBe(false)
		expect(fn.mock.calls[1][0]).toEqual(createBlockerContext('unload'))
	})

	it('should unregister and unsubscribe on destroy', () => {
		const { router, handle, unsubscribe } = createRouter()
		mocks.useRouterContext.mockReturnValue(router)

		useRouteBlocker(() => ({ shouldBlock: true }))

		expect(mocks.onDestroy).toHaveBeenCalledOnce()
		mocks.onDestroy.mock.calls[0][0]()

		expect(handle.unregister).toHaveBeenCalledOnce()
		expect(unsubscribe).toHaveBeenCalledOnce()
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
