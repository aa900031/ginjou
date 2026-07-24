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

		expect(value).toBe('profile%2Ename:eq:s.a%7Eb%3Ac~views:gte:n.100~featured:eq:b.1~deletedAt:eq:z~category:in:j.%5B%22news%22%2C%22guide%22%5D~optional:eq:u')
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

		expect(value).toBe('status:eq:s.published~or@search%2Ev1.title:contains:s.ginjou~or@search%2Ev1.and_0.views:gte:n.100~or@search%2Ev1.and_0.featured:eq:b.1~or@search%2Ev1.and_1.likes:gte:n.50~or@search%2Ev1.or:')
		expect(parseFilters(value)).toEqual(filters)
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

		expect(value).toBe('createdAt:desc~profile%3Aname:asc')
		expect(parseSorters(value)).toEqual(sorters)
	})

	it('should expose a syncRoute-compatible codec', () => {
		expect(sortersCodec).toEqual({
			parse: parseSorters,
			stringify: stringifySorters,
		})
	})
})
