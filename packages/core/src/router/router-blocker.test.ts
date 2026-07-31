import type { RouterBlockerHandle, RouterBlockShouldInput } from './router'
import type { Entry } from './router-blocker'
import { describe, expect, it, vi } from 'vitest'
import { RouterBlockerAction } from './router'
import { checkEntries, createShouldBlockFn, handleChangeLocation, proceed, reset, State } from './router-blocker'

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

describe('checkEntries', () => {
	const input = createBlockerContext(RouterBlockerAction.Push)

	it('should allow the navigation when no entry blocks it', async () => {
		const entries: Entry[] = [{ shouldBlock: () => false }, { shouldBlock: () => false }]

		await expect(checkEntries(entries, input)).resolves.toBe(true)
	})

	it('should hold the navigation until the blocking entry settles', async () => {
		const entry: Entry = { shouldBlock: () => true }

		const pending = checkEntries([entry], input)

		expect(entry.resolve).toBeTypeOf('function')
		await expect(Promise.race([pending, 'pending'])).resolves.toBe('pending')

		entry.resolve!(true)
		await expect(pending).resolves.toBe(true)
		expect(entry.resolve).toBeUndefined()
	})

	it('should refuse the navigation when an entry resets', async () => {
		const entry: Entry = { shouldBlock: () => true }

		const pending = checkEntries([entry], input)
		entry.resolve!(false)

		await expect(pending).resolves.toBe(false)
	})

	it('should ask the remaining entries once one proceeds', async () => {
		const first: Entry = { shouldBlock: () => true }
		const second = vi.fn(() => false)

		const pending = checkEntries([first, { shouldBlock: second }], input)
		first.resolve!(true)

		await expect(pending).resolves.toBe(true)
		expect(second).toHaveBeenCalledWith(input)
	})

	it('should keep the newer navigation settleable when it supersedes an older one', async () => {
		const entry: Entry = { shouldBlock: () => true }

		const superseded = checkEntries([entry], input)
		const latest = checkEntries([entry], input)

		// Taking over releases the navigation that was being held.
		await expect(superseded).resolves.toBe(false)

		// ...but the one that took over is still held, and must still be settleable.
		expect(entry.resolve).toBeTypeOf('function')
		entry.resolve!(true)
		await expect(latest).resolves.toBe(true)
	})
})
