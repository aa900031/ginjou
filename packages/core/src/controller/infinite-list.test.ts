import { describe, expect, it } from 'vitest'
import { RouterGoType } from '../router'
import { getPageCount, getPaginationForQuery, getTotal, toRouterGoParams } from './infinite-list'

describe('getPaginationForQuery', () => {
	it('should convert currentPage and perPage into query pagination', () => {
		expect(getPaginationForQuery({
			currentPage: 3,
			perPage: 20,
		})).toEqual({
			current: 3,
			perPage: 20,
		})
	})
})

describe('getPageCount', () => {
	it('should return undefined when there is no last page total', () => {
		expect(getPageCount({
			queryData: undefined,
			perPage: 10,
		})).toBeUndefined()

		expect(getPageCount({
			queryData: {
				pages: [{ data: [] }],
				pageParams: [],
			} as any,
			perPage: 10,
		})).toBeUndefined()
	})

	it('should calculate page count from the last page total and perPage', () => {
		expect(getPageCount({
			queryData: {
				pages: [
					{ data: [], total: 5 },
					{ data: [], total: 21 },
				],
				pageParams: [1, 2],
			} as any,
			perPage: 10,
		})).toBe(3)
	})

	it('should return 1 when perPage is falsy and total exists', () => {
		expect(getPageCount({
			queryData: {
				pages: [{ data: [], total: 21 }],
				pageParams: [1],
			} as any,
			perPage: 0,
		})).toBe(1)
	})
})

describe('getTotal', () => {
	it('should return the total from the last page', () => {
		expect(getTotal({
			queryData: {
				pages: [
					{ data: [], total: 5 },
					{ data: [], total: 21 },
				],
				pageParams: [1, 2],
			} as any,
		})).toBe(21)
	})

	it('should return undefined when query data is missing', () => {
		expect(getTotal({
			queryData: undefined,
		})).toBeUndefined()
	})
})

describe('toRouterGoParams', () => {
	const sorters = [{ field: 'createdAt', order: 'desc' }] as const
	const filters = [{ field: 'published', operator: 'eq', value: true }] as const

	it('should return false when syncRoute is disabled', () => {
		expect(toRouterGoParams({
			syncRouteFromProp: false,
			perPageLocation: 10,
			sortersLocation: undefined,
			filtersLocation: undefined,
			perPage: 20,
			sorters: [...sorters],
			filters: [...filters],
		})).toBe(false)
	})

	it('should return false when route values already match current values', () => {
		expect(toRouterGoParams({
			syncRouteFromProp: true,
			perPageLocation: 10,
			sortersLocation: [...sorters],
			filtersLocation: [...filters],
			perPage: 10,
			sorters: [...sorters],
			filters: [...filters],
		})).toBe(false)
	})

	it('should create replace navigation params when values changed', () => {
		expect(toRouterGoParams({
			syncRouteFromProp: true,
			perPageLocation: 10,
			sortersLocation: [{ field: 'title', order: 'asc' }],
			filtersLocation: [{ field: 'category', operator: 'eq', value: 'news' }],
			perPage: 20,
			sorters: [...sorters],
			filters: [...filters],
		})).toEqual({
			type: RouterGoType.Replace,
			keepQuery: true,
			query: {
				perPage: 20,
				sorters: JSON.stringify(sorters),
				filters: JSON.stringify(filters),
			},
		})
	})

	it('should respect custom syncRoute fields and stringifiers', () => {
		expect(toRouterGoParams({
			syncRouteFromProp: {
				perPage: { field: 'limit' },
				sorters: {
					field: 'sort',
					stringify: value => `sort:${value.length}`,
				},
				filters: {
					field: 'filter',
					stringify: value => `filter:${value.length}`,
				},
			},
			perPageLocation: 10,
			sortersLocation: undefined,
			filtersLocation: undefined,
			perPage: 20,
			sorters: [...sorters],
			filters: [...filters],
		})).toEqual({
			type: RouterGoType.Replace,
			keepQuery: true,
			query: {
				limit: 20,
				sort: 'sort:1',
				filter: 'filter:1',
			},
		})
	})
})
