import type { RouteBlocker } from '@ginjou/core'
import type { UseRouteBlockerResult } from '../router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useWarnUnsaved } from './warn-unsaved.svelte'

const mocks = vi.hoisted(() => ({
	useControllerContext: vi.fn(),
	useRouteBlocker: vi.fn(),
	watchCalls: [] as Array<{
		source: () => unknown
		callback: (value: unknown, oldValue: unknown) => void
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
		mocks.watchCalls.push({ source, callback })
		if (options?.immediate)
			callback(source(), undefined)

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

function flushWatch() {
	for (const { source, callback } of mocks.watchCalls)
		callback(source(), undefined)
}

describe('useWarnUnsaved', () => {
	beforeEach(() => {
		mocks.useControllerContext.mockReset()
		mocks.useRouteBlocker.mockReset()
		mocks.watchCalls.length = 0

		mocks.useControllerContext.mockReturnValue(undefined)
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
		expect(mocks.useRouteBlocker.mock.calls[0][0]().shouldBlock).toBe(false)
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
		expect(mocks.useRouteBlocker.mock.calls[0][0]().shouldBlock).toBe(true)
	})
})
