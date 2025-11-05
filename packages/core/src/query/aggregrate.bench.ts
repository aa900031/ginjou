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

	bench('with aggregation', async () => {
		await Promise.all([
			aggregrateFn(1),
			aggregrateFn(2),
			aggregrateFn(3),
		])
	})
})
