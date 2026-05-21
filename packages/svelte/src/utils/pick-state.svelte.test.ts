import { beforeEach, describe, expect, it, vi } from 'vitest'
import { pickState } from './pick-state.svelte'

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

describe('pickState', () => {
	beforeEach(() => {
		watchCalls.length = 0
	})

	it('should get a nested value', () => {
		// eslint-disable-next-line prefer-const
		let props = {
			a: {
				b: {
					c: true,
				},
			},
		}
		const result = pickState<{ c: boolean }, { a: { b: { c: boolean } } }>(
			() => props,
			({ prop }) => prop.a.b,
		)

		expect(result.value).toEqual({ c: true })
		expect(watchCalls).toHaveLength(1)
	})

	it('should update when the source changes', () => {
		let props = {
			current: 1,
		}
		const result = pickState<number, { current: number }>(
			() => props,
			({ prop }) => prop.current,
		)

		props = {
			current: 2,
		}
		watchCalls[0].callback(props, { current: 1 })

		expect(result.value).toBe(2)
	})

	it('should pass previous value to the getter', () => {
		let props = {
			current: 1,
		}
		const result = pickState<number, { current: number }>(
			() => props,
			({ prop, prev }) => (prev ?? 0) + prop.current,
		)

		expect(result.value).toBe(1)

		props = {
			current: 2,
		}
		watchCalls[0].callback(props, { current: 1 })

		expect(result.value).toBe(3)
	})
})
