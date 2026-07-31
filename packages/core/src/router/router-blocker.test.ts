import type { RouterBlockerHandle, RouterBlockShouldInput } from './router'
import { describe, expect, it, vi } from 'vitest'
import { RouterBlockerAction } from './router'
import { createShouldBlockFn, handleChangeLocation, proceed, reset, State } from './router-blocker'

function createBlockerContext(
	action: RouterBlockShouldInput['action'],
): RouterBlockShouldInput {
	return {
		currentLocation: { path: '/posts' },
		nextLocation: action === RouterBlockerAction.Unload ? undefined : { path: '/posts/1' },
		action,
	}
}

function createHandle(): RouterBlockerHandle {
	return {
		unregister: vi.fn(),
		proceed: vi.fn(),
		reset: vi.fn(),
	}
}

describe('createShouldBlockFn', () => {
	it('should return the current value without touching the state on unload', () => {
		for (const value of [true, false]) {
			const setState = vi.fn()
			const shouldBlock = createShouldBlockFn({ getShouldBlock: () => value, setState })

			expect(shouldBlock(createBlockerContext(RouterBlockerAction.Unload))).toBe(value)
			expect(setState).not.toHaveBeenCalled()
		}
	})

	it('should not block and not touch the state when shouldBlock is false', () => {
		const setState = vi.fn()
		const shouldBlock = createShouldBlockFn({ getShouldBlock: () => false, setState })

		expect(shouldBlock(createBlockerContext(RouterBlockerAction.Push))).toBe(false)
		expect(setState).not.toHaveBeenCalled()
	})

	it('should block and set the state when shouldBlock is true', () => {
		const setState = vi.fn()
		const shouldBlock = createShouldBlockFn({ getShouldBlock: () => true, setState })

		expect(shouldBlock(createBlockerContext(RouterBlockerAction.Push))).toBe(true)
		expect(setState).toHaveBeenCalledWith(State.Blocked)
	})

	it('should pass the context untouched to the shouldBlock function', () => {
		const setState = vi.fn()
		const fn = vi.fn((_context: RouterBlockShouldInput): boolean => true)
		const shouldBlock = createShouldBlockFn({ getShouldBlock: () => fn, setState })
		const context = createBlockerContext(RouterBlockerAction.Push)

		shouldBlock(context)

		expect(fn).toHaveBeenCalledOnce()
		expect(fn.mock.calls[0][0]).toBe(context)
	})

	it('should use the return value of the shouldBlock function', () => {
		for (const value of [true, false]) {
			const setState = vi.fn()
			const shouldBlock = createShouldBlockFn({ getShouldBlock: () => (): boolean => value, setState })

			expect(shouldBlock(createBlockerContext(RouterBlockerAction.Push))).toBe(value)

			if (value)
				expect(setState).toHaveBeenCalledWith(State.Blocked)
			else
				expect(setState).not.toHaveBeenCalled()
		}
	})

	it('should return the shouldBlock function result without touching the state on unload', () => {
		for (const value of [true, false]) {
			const setState = vi.fn()
			const shouldBlock = createShouldBlockFn({ getShouldBlock: () => (): boolean => value, setState })

			expect(shouldBlock(createBlockerContext(RouterBlockerAction.Unload))).toBe(value)
			expect(setState).not.toHaveBeenCalled()
		}
	})
})

describe('handleChangeLocation', () => {
	it('should clear the proceeding state', () => {
		const setState = vi.fn()

		handleChangeLocation({ state: State.Proceeding, setState })

		expect(setState).toHaveBeenCalledWith(State.Unblocked)
	})

	it('should do nothing otherwise', () => {
		for (const state of [State.Blocked, State.Unblocked] as const) {
			const setState = vi.fn()

			handleChangeLocation({ state, setState })

			expect(setState).not.toHaveBeenCalled()
		}
	})
})

describe('proceed', () => {
	it('should set the proceeding state and proceed the handle', () => {
		const setState = vi.fn()
		const handle = createHandle()

		proceed({ setState, handle })

		expect(setState).toHaveBeenCalledWith(State.Proceeding)
		expect(handle.proceed).toHaveBeenCalledOnce()
	})
})

describe('reset', () => {
	it('should set the unblocked state and reset the handle', () => {
		const setState = vi.fn()
		const handle = createHandle()

		reset({ setState, handle })

		expect(setState).toHaveBeenCalledWith(State.Unblocked)
		expect(handle.reset).toHaveBeenCalledOnce()
	})
})
