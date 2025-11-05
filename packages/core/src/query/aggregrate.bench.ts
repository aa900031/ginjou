import { beforeEach, bench, describe, vi } from 'vitest'
import { createAggregrateFn } from './aggregrate'

describe('createAggregrateFn', () => {
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

	beforeEach(() => fn.mockClear())

	bench('aggregation 1~3', async () => {
		await Promise.all(
			Array.from({ length: 3 }).map((item, index) => aggregrateFn(index + 1)),
		)
	})
	bench('aggregation 1~10', async () => {
		await Promise.all([
			Array.from({ length: 10 }).map((item, index) => aggregrateFn(index + 1)),
		])
	})
})
