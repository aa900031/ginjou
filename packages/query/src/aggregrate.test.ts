import { describe, expect, it, vi } from 'vitest'
import { createAggregrateFn } from './aggregrate'

describe('aggregrate', () => {
	it('should run 1 times, and return [6,6,6]', async () => {
		const fn = vi.fn(async (r: number): Promise<number> => r)
		const aggregrateFn = createAggregrateFn(
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
			aggregrateFn(1),
			aggregrateFn(2),
			aggregrateFn(3),
		])

		expect(result).toEqual([6, 6, 6])
		expect(fn).toBeCalledTimes(1)
		expect(fn).toBeCalledWith(6)
	})
})
