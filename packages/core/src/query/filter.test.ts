import type { Filter, Filters } from './filter'
import { describe, expect, it } from 'vitest'
import { FilterOperator, findFilter, isConditionalFilter, isConditionalFilterOperator, isFilterOperator, isLogicalFilter, isLogicalFilterOperator, isTargetFilter, selectFilters } from './filter'

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

	it('should narrow filters and match field with optional operator', () => {
		expect(isLogicalFilter(statusPublished)).toBe(true)
		expect(isConditionalFilter(statusPublished)).toBe(false)
		expect(isLogicalFilter(orGroup)).toBe(false)
		expect(isConditionalFilter(orGroup)).toBe(true)
		expect(isTargetFilter(statusPublished, { field: 'status' })).toBe(true)
		expect(isTargetFilter(statusPublished, { field: 'status', operator: FilterOperator.ne })).toBe(false)
		expect(isTargetFilter(orGroup, { field: 'status' })).toBe(false)
	})

	it('should select shallow or deeply nested filters', () => {
		expect(selectFilters(filters, { field: 'status' })).toEqual([statusPublished, statusArchived])
		expect(selectFilters(filters, { field: 'status' }, { deep: true })).toEqual([
			statusPublished,
			{ ...orGroup, value: [statusNotDraft] },
			statusArchived,
		])
		expect(selectFilters(filters, { field: 'title' }, { deep: true })).toEqual([
			{ ...orGroup, value: [{ ...andGroup, value: [titleContains] }] },
		])
		expect(findFilter(filters, { field: 'title' }, { deep: true })).toBe(titleContains)
	})
})
