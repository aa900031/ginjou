import type { Filters, Sorters } from '@ginjou/core'
import { describe, expect, it } from 'vitest'
import {
	filters as filtersCodec,
	parseFilters,
	parseSorters,
	sorters as sortersCodec,
	stringifyFilters,
	stringifySorters,
} from '.'

describe('filters codec', () => {
	it('should preserve value types and escape syntax characters', () => {
		const filters: Filters = [
			{ field: 'profile.name', operator: 'eq', value: 'a~b:c' },
			{ field: 'views', operator: 'gte', value: 100 },
			{ field: 'featured', operator: 'eq', value: true },
			{ field: 'deletedAt', operator: 'eq', value: null },
			{ field: 'category', operator: 'in', value: ['news', 'guide'] },
			{ field: 'optional', operator: 'eq', value: undefined },
		]

		const value = stringifyFilters(filters)

		expect(value).toBe('!!profile.name~eq~a*-b:c~~!views~gte~100~~!featured~eq~_T~~!deletedAt~eq~_N~~!category~in~!news~guide~~~!optional~eq~_U')
		expect(value).not.toMatch(/[[\]()]|%5B|%5D|%28|%29/i)
		expect(parseFilters(value)).toEqual(filters)
	})

	it('should preserve nested, duplicate, keyed, and empty conditionals', () => {
		const filters: Filters = [
			{ field: 'status', operator: 'eq', value: 'published' },
			{
				key: 'search.v1',
				operator: 'or',
				value: [
					{ field: 'title', operator: 'contains', value: 'ginjou' },
					{
						operator: 'and',
						value: [
							{ field: 'views', operator: 'gte', value: 100 },
							{ field: 'featured', operator: 'eq', value: true },
						],
					},
					{
						operator: 'and',
						value: [
							{ field: 'likes', operator: 'gte', value: 50 },
						],
					},
					{ operator: 'or', value: [] },
				],
			},
		]

		const value = stringifyFilters(filters)

		expect(value).toBe('!!status~eq~published~~!or~!!title~contains~ginjou~~!and~!!views~gte~100~~!featured~eq~_T~~~~!and~!!likes~gte~50~~~~!or~!~~~search.v1')
		expect(parseFilters(value)).toEqual(filters)
	})

	it('should reject malformed filters', () => {
		expect(() => parseFilters('!status~eq~published')).toThrow('Invalid filter')
		expect(() => parseFilters('!!status~or~published')).toThrow('Invalid logical filter')
	})

	it('should parse an empty query value', () => {
		expect(parseFilters('')).toEqual([])
	})

	it('should expose a syncRoute-compatible codec', () => {
		expect(filtersCodec).toEqual({
			parse: parseFilters,
			stringify: stringifyFilters,
		})
	})
})

describe('sorters codec', () => {
	it('should stringify and parse sorters', () => {
		const sorters: Sorters = [
			{ field: 'createdAt', order: 'desc' },
			{ field: 'profile:name', order: 'asc' },
		]

		const value = stringifySorters(sorters)

		expect(value).toBe('!!createdAt~desc~~!profile:name~asc')
		expect(parseSorters(value)).toEqual(sorters)
	})

	it('should reject malformed sorters', () => {
		expect(() => parseSorters('!!createdAt~sideways')).toThrow('Invalid sorter')
	})

	it('should parse an empty query value', () => {
		expect(parseSorters('')).toEqual([])
	})

	it('should expose a syncRoute-compatible codec', () => {
		expect(sortersCodec).toEqual({
			parse: parseSorters,
			stringify: stringifySorters,
		})
	})
})
