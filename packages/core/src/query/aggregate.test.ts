import { describe, expect, it, vi } from 'vitest'
import { createAggregateFn } from './aggregate'

describe('aggregate', () => {
	it('should run 1 times, and return [6,6,6]', async () => {
		const fn = vi.fn(async (r: number): Promise<number> => r)
		const aggregateFn = createAggregateFn(
			fn,
			(allArgs, allResolves) => [
				[
					[
						allArgs.reduce((sum, [num]) => (sum += num), 0),
					] as any,
					allResolves,
				],
			],
		)

		const result = await Promise.all([
			aggregateFn(1),
			aggregateFn(2),
			aggregateFn(3),
		])

		expect(result).toEqual([6, 6, 6])
		expect(fn).toBeCalledTimes(1)
		expect(fn).toBeCalledWith(6)
	})
})
