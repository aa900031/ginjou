import type { Filter, Filters, Sort, Sorters } from './fetcher'
import { describe, expect, it } from 'vitest'
import { filterFilters, FilterOperator, filterSorters, findFilter, findSorter, isConditionalFilter, isConditionalFilterOperator, isFilterOperator, isLogicalFilter, isLogicalFilterOperator, isSortOrder, isTargetFilter, isTargetSorter, SortOrder } from './fetcher'

describe('isSortOrder', () => {
	it('should accept sort orders and reject other values', () => {
		expect(isSortOrder(SortOrder.Asc)).toBe(true)
		expect(isSortOrder(SortOrder.Desc)).toBe(true)
		expect(isSortOrder('sideways')).toBe(false)
		expect(isSortOrder(undefined)).toBe(false)
	})
})

describe('sorter helpers', () => {
	const titleAsc: Sort = { field: 'title', order: SortOrder.Asc }
	const createdAtDesc: Sort = { field: 'createdAt', order: SortOrder.Desc }
	const titleAscAgain: Sort = { field: 'title', order: SortOrder.Asc }
	const sorters: Sorters = [titleAsc, createdAtDesc, titleAscAgain]

	it('should match, filter and find sorters', () => {
		expect(isTargetSorter(titleAsc, { field: 'title', order: SortOrder.Asc })).toBe(true)
		expect(isTargetSorter(createdAtDesc, { field: 'title', order: SortOrder.Asc })).toBe(false)
		expect(isTargetSorter(createdAtDesc, { field: 'createdAt' })).toBe(true)
		expect(filterSorters(sorters, { field: 'title', order: SortOrder.Asc })).toEqual([titleAsc, titleAscAgain])
		expect(findSorter(sorters, { field: 'title' })).toBe(titleAsc)
	})
})

describe('isFilterOperator', () => {
	it('should accept any filter operator and reject other values', () => {
		expect(isFilterOperator(FilterOperator.eq)).toBe(true)
		expect(isFilterOperator(FilterOperator.and)).toBe(true)
		expect(isFilterOperator('toString')).toBe(false)
		expect(isFilterOperator(undefined)).toBe(false)
	})
})

describe('isConditionalFilterOperator', () => {
	it('should accept only and/or', () => {
		expect(isConditionalFilterOperator(FilterOperator.and)).toBe(true)
		expect(isConditionalFilterOperator(FilterOperator.or)).toBe(true)
		expect(isConditionalFilterOperator(FilterOperator.eq)).toBe(false)
	})
})

describe('isLogicalFilterOperator', () => {
	it('should accept logical filter operators', () => {
		expect(isLogicalFilterOperator(FilterOperator.eq)).toBe(true)
		expect(isLogicalFilterOperator(FilterOperator.nendswiths)).toBe(true)
	})

	it('should reject conditional operators and unknown values', () => {
		expect(isLogicalFilterOperator(FilterOperator.and)).toBe(false)
		expect(isLogicalFilterOperator(FilterOperator.or)).toBe(false)
		expect(isLogicalFilterOperator('toString')).toBe(false)
		expect(isLogicalFilterOperator(undefined)).toBe(false)
	})
})

describe('filter helpers', () => {
	const statusPublished: Filter = { field: 'status', operator: FilterOperator.eq, value: 'published' }
	const statusNotDraft: Filter = { field: 'status', operator: FilterOperator.ne, value: 'draft' }
	const titleContains: Filter = { field: 'title', operator: FilterOperator.contains, value: 'ginjou' }
	const andGroup: Filter = { operator: FilterOperator.and, value: [titleContains] }
	const orGroup: Filter = { operator: FilterOperator.or, value: [statusNotDraft, andGroup] }
	const statusArchived: Filter = { field: 'status', operator: FilterOperator.eq, value: 'archived' }
	const filters: Filters = [statusPublished, orGroup, statusArchived]

	it('should match field and optional operator', () => {
		expect(isLogicalFilter(statusPublished)).toBe(true)
		expect(isConditionalFilter(statusPublished)).toBe(false)
		expect(isLogicalFilter(orGroup)).toBe(false)
		expect(isConditionalFilter(orGroup)).toBe(true)
		expect(isTargetFilter(statusPublished, { field: 'status' })).toBe(true)
		expect(isTargetFilter(statusPublished, { field: 'status', operator: FilterOperator.ne })).toBe(false)
		expect(isTargetFilter(orGroup, { field: 'status' })).toBe(false)
	})

	it('should filter shallow or deeply nested filters', () => {
		expect(filterFilters(filters, { field: 'status' })).toEqual([statusPublished, statusArchived])
		expect(filterFilters(filters, { field: 'status' }, true)).toEqual([
			statusPublished,
			{ ...orGroup, value: [statusNotDraft] },
			statusArchived,
		])
		expect(filterFilters(filters, { field: 'title' }, true)).toEqual([
			{ ...orGroup, value: [{ ...andGroup, value: [titleContains] }] },
		])
		expect(findFilter(filters, { field: 'title' }, true)).toBe(titleContains)
	})
})
