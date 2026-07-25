import { describe, expect, it } from 'vitest'
import { FilterOperator, isConditionalFilterOperator, isFilterOperator, isLogicalFilterOperator, isSortOrder, SortOrder } from './fetcher'

describe('isSortOrder', () => {
	it('should accept sort orders and reject other values', () => {
		expect(isSortOrder(SortOrder.Asc)).toBe(true)
		expect(isSortOrder(SortOrder.Desc)).toBe(true)
		expect(isSortOrder('sideways')).toBe(false)
		expect(isSortOrder(undefined)).toBe(false)
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
