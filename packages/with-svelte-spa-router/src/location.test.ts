import { describe, expect, it } from 'vitest'
import { buildPath, defaultParseQuery, defaultStringifyQuery } from './location'

describe('buildPath', () => {
	it('maps navigation while preserving the current query', () => {
		expect(buildPath(
			{ to: '/next', query: { page: 2 }, hash: 'results', keepQuery: true },
			'/current',
			'filter=active&page=1',
			defaultParseQuery,
			defaultStringifyQuery,
		)).toBe('/next?filter=active&page=2#results')
	})
})
