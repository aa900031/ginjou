import type { RouteBlocker, RouterBlockShouldFn, RouterBlockShouldInput } from '@ginjou/core'
import type { UseRouteBlockerResult } from '../router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useWarnUnsaved } from './warn-unsaved.svelte'

const mocks = vi.hoisted(() => ({
	useControllerContext: vi.fn(),
	useRouteBlocker: vi.fn(),
	watchCalls: [] as Array<{
		source: () => unknown
		callback: (value: unknown, oldValue: unknown) => void
		previous?: unknown
	}>,
}))

vi.mock('../router', () => ({
	useRouteBlocker: mocks.useRouteBlocker,
}))

vi.mock('./context', () => ({
	useControllerContext: mocks.useControllerContext,
}))

vi.mock('../utils/watch.svelte', () => ({
	watch(
		source: () => unknown,
		callback: (value: unknown, oldValue: unknown) => void,
		options?: { immediate?: boolean },
	) {
		const call = { source, callback, previous: undefined as unknown }
		mocks.watchCalls.push(call)
		if (options?.immediate) {
			call.previous = source()
			callback(call.previous, undefined)
		}

		return () => {}
	},
}))

function createBlocker() {
	let state = $state<RouteBlocker.StateValues>('unblocked')
	const proceed = vi.fn(() => {
		state = 'proceeding'
	})
	const reset = vi.fn(() => {
		state = 'unblocked'
	})

	const blocker: UseRouteBlockerResult = {
		get state() {
			return state
		},
		proceed,
		reset,
	}

	return {
		blocker,
		proceed,
		reset,
		block: () => {
			state = 'blocked'
		},
	}
}

function callShouldBlock(
	nextPath: string | undefined = '/posts',
): boolean {
	const props = mocks.useRouteBlocker.mock.calls[0][0]() as { shouldBlock: RouterBlockShouldFn }
	const input: RouterBlockShouldInput = {
		currentLocation: { path: '/posts/1/edit', query: { page: '1' } },
		nextLocation: nextPath == null
			? undefined
			: { path: nextPath, query: { page: '2' } },
	}

	return props.shouldBlock(input)
}

function flushWatch() {
	for (const call of mocks.watchCalls) {
		const value = call.source()
		call.callback(value, call.previous)
		call.previous = value
	}
}

describe('useWarnUnsaved', () => {
	beforeEach(() => {
		mocks.useControllerContext.mockReset()
		mocks.useRouteBlocker.mockReset()
		mocks.watchCalls.length = 0

		mocks.useControllerContext.mockReturnValue(undefined)
	})

	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it('should use the browser confirmation by default', async () => {
		const { blocker, proceed, block } = createBlocker()
		mocks.useRouteBlocker.mockReturnValue(blocker)
		const confirm = vi.fn(() => true)
		vi.stubGlobal('confirm', confirm)

		const result = useWarnUnsaved(() => ({ enabled: true }))
		result.active = true
		block()
		flushWatch()

		await vi.waitFor(() => expect(proceed).toHaveBeenCalledOnce())
		expect(confirm).toHaveBeenCalledWith('You have unsaved changes. Are you sure you want to leave this page?')
	})

	it('should proceed when the confirm resolves true', async () => {
		const { blocker, proceed, reset, block } = createBlocker()
		mocks.useRouteBlocker.mockReturnValue(blocker)

		const confirm = vi.fn(async () => true)
		const result = useWarnUnsaved(() => ({ enabled: true, confirm }))

		result.active = true
		expect(result.state).toBe('active')

		block()
		flushWatch()
		expect(result.state).toBe('confirming')

		await vi.waitFor(() => expect(proceed).toHaveBeenCalledOnce())
		expect(reset).not.toHaveBeenCalled()
		expect(confirm).toHaveBeenCalledOnce()
	})

	it('should reset when the confirm resolves false', async () => {
		const { blocker, proceed, reset, block } = createBlocker()
		mocks.useRouteBlocker.mockReturnValue(blocker)

		const confirm = vi.fn(async () => false)
		const result = useWarnUnsaved(() => ({ enabled: true, confirm }))

		result.active = true
		block()
		flushWatch()

		await vi.waitFor(() => expect(reset).toHaveBeenCalledOnce())
		expect(proceed).not.toHaveBeenCalled()
	})

	it('should not confirm twice while already confirming', async () => {
		const { blocker, block } = createBlocker()
		mocks.useRouteBlocker.mockReturnValue(blocker)

		const confirm = vi.fn(async () => true)
		const result = useWarnUnsaved(() => ({ enabled: true, confirm }))

		result.active = true
		block()
		flushWatch()
		flushWatch()

		await vi.waitFor(() => expect(confirm).toHaveBeenCalledOnce())
	})

	it('should stay inactive when enabled is false', () => {
		const { blocker } = createBlocker()
		mocks.useRouteBlocker.mockReturnValue(blocker)

		const result = useWarnUnsaved(() => ({ enabled: false }))

		result.active = true

		expect(result.active).toBe(true)
		expect(result.state).toBe('inactive')
		expect(mocks.useRouteBlocker.mock.calls[0][0]().enabled).toBe(false)
	})

	// Every navigation reaches the predicate now, so this is where the default judgement lives:
	// unsaved work cares about leaving the page, not about the query changing under it.
	describe('shouldBlock', () => {
		it('should block a navigation that leaves the path', () => {
			const { blocker } = createBlocker()
			mocks.useRouteBlocker.mockReturnValue(blocker)

			const result = useWarnUnsaved(() => ({ enabled: true }))
			result.active = true

			expect(callShouldBlock('/posts')).toBe(true)
		})

		it('should not block a navigation that only changes the query', () => {
			const { blocker } = createBlocker()
			mocks.useRouteBlocker.mockReturnValue(blocker)

			const result = useWarnUnsaved(() => ({ enabled: true }))
			result.active = true

			expect(callShouldBlock('/posts/1/edit')).toBe(false)
		})

		it('should block an unload', () => {
			const { blocker } = createBlocker()
			mocks.useRouteBlocker.mockReturnValue(blocker)

			const result = useWarnUnsaved(() => ({ enabled: true }))
			result.active = true

			expect(callShouldBlock(undefined)).toBe(true)
		})

		it('should not block while there is nothing unsaved', () => {
			const { blocker } = createBlocker()
			mocks.useRouteBlocker.mockReturnValue(blocker)

			useWarnUnsaved(() => ({ enabled: true }))

			expect(callShouldBlock('/posts')).toBe(false)
		})
	})

	it('should expose the three states', async () => {
		const { blocker, block } = createBlocker()
		mocks.useRouteBlocker.mockReturnValue(blocker)

		const confirm = vi.fn(async () => true)
		const result = useWarnUnsaved(() => ({ enabled: true, confirm }))

		expect(result.state).toBe('inactive')

		result.active = true
		expect(result.state).toBe('active')

		block()
		flushWatch()
		expect(result.state).toBe('confirming')

		await vi.waitFor(() => expect(result.state).toBe('active'))
		expect(result.active).toBe(true)
	})

	it('should fall back to the controller option', () => {
		const { blocker } = createBlocker()
		mocks.useRouteBlocker.mockReturnValue(blocker)

		const confirm = vi.fn(() => true)
		mocks.useControllerContext.mockReturnValue({
			warnUnsaved: {
				enabled: true,
				confirm,
			},
		})

		const result = useWarnUnsaved()

		result.active = true

		expect(result.state).toBe('active')
		expect(callShouldBlock()).toBe(true)
	})
})
