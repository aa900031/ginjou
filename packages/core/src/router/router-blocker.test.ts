import type { RouterBlockShouldInput } from './router'
import type { Entry } from './router-blocker'
import { describe, expect, it, vi } from 'vitest'
import { checkEntries, createShouldBlockFn, handleChangeLocation, shouldRegister, State } from './router-blocker'

/** A missing `nextLocation` is what marks the page being unloaded rather than navigated. */
function createBlockerContext(
	unload = false,
): RouterBlockShouldInput {
	return {
		currentLocation: { path: '/posts' },
		nextLocation: unload ? undefined : { path: '/posts/1' },
	}
}

describe('shouldRegister', () => {
	it('should register while enabled', () => {
		expect(shouldRegister({ enabled: undefined, state: State.Unblocked })).toBe(true)
		expect(shouldRegister({ enabled: true, state: State.Unblocked })).toBe(true)
	})

	it('should let the entry go once disabled and idle', () => {
		expect(shouldRegister({ enabled: false, state: State.Unblocked })).toBe(false)
	})

	it('should keep the entry while a navigation is riding on it', () => {
		expect(shouldRegister({ enabled: false, state: State.Blocked })).toBe(true)
		expect(shouldRegister({ enabled: false, state: State.Proceeding })).toBe(true)
	})
})

describe('createShouldBlockFn', () => {
	it('should return the current value without touching the state on unload', () => {
		for (const value of [true, false]) {
			const setState = vi.fn()
			const shouldBlock = createShouldBlockFn({ getShouldBlock: () => value, setState })

			expect(shouldBlock(createBlockerContext(true))).toBe(value)
			expect(setState).not.toHaveBeenCalled()
		}
	})

	it('should not block and not touch the state when shouldBlock is false', () => {
		const setState = vi.fn()
		const shouldBlock = createShouldBlockFn({ getShouldBlock: () => false, setState })

		expect(shouldBlock(createBlockerContext())).toBe(false)
		expect(setState).not.toHaveBeenCalled()
	})

	it('should block and set the state when shouldBlock is true', () => {
		const setState = vi.fn()
		const shouldBlock = createShouldBlockFn({ getShouldBlock: () => true, setState })

		expect(shouldBlock(createBlockerContext())).toBe(true)
		expect(setState).toHaveBeenCalledWith(State.Blocked)
	})

	it('should pass the context untouched to the shouldBlock function', () => {
		const setState = vi.fn()
		const fn = vi.fn((_context: RouterBlockShouldInput): boolean => true)
		const shouldBlock = createShouldBlockFn({ getShouldBlock: () => fn, setState })
		const context = createBlockerContext()

		shouldBlock(context)

		expect(fn).toHaveBeenCalledOnce()
		expect(fn.mock.calls[0][0]).toBe(context)
	})

	it('should use the return value of the shouldBlock function', () => {
		for (const value of [true, false]) {
			const setState = vi.fn()
			const shouldBlock = createShouldBlockFn({ getShouldBlock: () => (): boolean => value, setState })

			expect(shouldBlock(createBlockerContext())).toBe(value)

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

			expect(shouldBlock(createBlockerContext(true))).toBe(value)
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

describe('checkEntries', () => {
	const input = createBlockerContext()

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

	it('should skip an entry removed before its turn', async () => {
		const holder: Entry = { shouldBlock: () => true }
		const queued = vi.fn(() => true)
		const entries = new Set<Entry>([holder, { shouldBlock: queued }])

		const pending = checkEntries(entries, input)

		// The queued entry's owner goes away while the user is still deciding on the hold. Asking it
		// anyway would install a `resolve` nobody holds the handle for any more.
		entries.delete([...entries][1])
		holder.resolve!(true)

		await expect(pending).resolves.toBe(true)
		expect(queued).not.toHaveBeenCalled()
	})

	it('should ask an entry registered while the navigation is held', async () => {
		const holder: Entry = { shouldBlock: () => true }
		const entries = new Set<Entry>([holder])

		const pending = checkEntries(entries, input)

		const late = vi.fn(() => false)
		entries.add({ shouldBlock: late })
		holder.resolve!(true)

		await expect(pending).resolves.toBe(true)
		expect(late).toHaveBeenCalledWith(input)
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
