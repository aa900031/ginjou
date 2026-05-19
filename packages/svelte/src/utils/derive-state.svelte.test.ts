import { beforeEach, describe, expect, it, vi } from 'vitest'
import { deriveState } from './derive-state.svelte'

const watchCalls = vi.hoisted(() => [] as Array<{
	source: () => unknown
	callback: (value: unknown, oldValue: unknown) => void | (() => void)
}>)

vi.mock('./watch.svelte', () => ({
	watch(source: () => unknown, callback: (value: unknown, oldValue: unknown) => void | (() => void)) {
		watchCalls.push({ source, callback })
		return () => {}
	},
}))

describe('deriveState', () => {
	beforeEach(() => {
		watchCalls.length = 0
	})

	it('should derive initial value immediately', () => {
		// eslint-disable-next-line prefer-const
		let count = 2
		const result = deriveState<number, number>(
			() => count,
			value => value * 3,
		)

		expect(result.value).toBe(6)
		expect(watchCalls).toHaveLength(1)
	})

	it('should update when the source changes', () => {
		let count = 2
		const result = deriveState<number, number>(
			() => count,
			value => value * 3,
		)

		count = 4
		watchCalls[0].callback(count, 2)

		expect(result.value).toBe(12)
	})

	it('should pass previous value to the derive function', () => {
		let count = 1
		const result = deriveState<number, number>(
			() => count,
			(value, prev) => (prev ?? 0) + value,
		)

		expect(result.value).toBe(1)

		count = 2
		watchCalls[0].callback(count, 1)

		expect(result.value).toBe(3)
	})

	it('should allow manual state updates between derivations', () => {
		let count = 1
		const result = deriveState<number, number>(
			() => count,
			(value, prev) => (prev ?? 0) + value,
		)

		result.value = 10

		count = 2
		watchCalls[0].callback(count, 1)

		expect(result.value).toBe(12)
	})
})
