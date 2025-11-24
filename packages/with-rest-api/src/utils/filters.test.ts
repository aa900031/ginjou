import { FilterOperator } from '@ginjou/core'
import { describe, expect, it } from 'vitest'
import { genFilters } from './filters'

describe('genFilters', () => {
	it('should return undefined if filters are void or undefined', () => {
		expect(genFilters()).toBeUndefined()
		expect(genFilters(undefined)).toBeUndefined()
	})

	it('should return undefined if filters array is empty', () => {
		expect(genFilters([])).toBeUndefined()
	})

	it('should throw an error for "or" operator', () => {
		const filters = [{ operator: FilterOperator.or, value: [] }] as any
		expect(() => genFilters(filters)).toThrowError(
			'[@ginjou/with-rest-api]: `operator: or` is not supported.',
		)
	})

	it('should throw an error for "and" operator', () => {
		const filters = [{ operator: FilterOperator.and, value: [] }] as any
		expect(() => genFilters(filters)).toThrowError(
			'[@ginjou/with-rest-api]: `operator: and` is not supported.',
		)
	})

	it('should handle "q" field correctly', () => {
		const filters = [{ field: 'q', operator: FilterOperator.eq, value: 'search_term' }] as any
		expect(genFilters(filters)).toEqual({ q: 'search_term' })
	})

	it('should handle "eq" operator (default)', () => {
		const filters = [{ field: 'name', operator: FilterOperator.eq, value: 'John Doe' }] as any
		expect(genFilters(filters)).toEqual({ name: 'John Doe' })
	})

	it('should handle "ne" operator', () => {
		const filters = [{ field: 'status', operator: FilterOperator.ne, value: 'active' }] as any
		expect(genFilters(filters)).toEqual({ status_ne: 'active' })
	})

	it('should handle "gte" operator', () => {
		const filters = [{ field: 'age', operator: FilterOperator.gte, value: 18 }] as any
		expect(genFilters(filters)).toEqual({ age_gte: 18 })
	})

	it('should handle "lte" operator', () => {
		const filters = [{ field: 'age', operator: FilterOperator.lte, value: 65 }] as any
		expect(genFilters(filters)).toEqual({ age_lte: 65 })
	})

	it('should handle "contains" operator', () => {
		const filters = [{ field: 'description', operator: FilterOperator.contains, value: 'test' }] as any
		expect(genFilters(filters)).toEqual({ description_like: 'test' })
	})

	it('should handle multiple filters', () => {
		const filters = [
			{ field: 'name', operator: FilterOperator.eq, value: 'Jane Doe' },
			{ field: 'age', operator: FilterOperator.gte, value: 25 },
			{ field: 'title', operator: FilterOperator.contains, value: 'engineer' },
		] as any
		expect(genFilters(filters)).toEqual({
			name: 'Jane Doe',
			age_gte: 25,
			title_like: 'engineer',
		})
	})

	it('should prioritize "q" field over other filters on the same field', () => {
		const filters = [
			{ field: 'q', operator: FilterOperator.eq, value: 'global search' },
			{ field: 'q', operator: FilterOperator.contains, value: 'another search' },
		] as any
		// The last 'q' filter should override previous ones, due to forEach iterating and result being an object.
		expect(genFilters(filters)).toEqual({ q: 'another search' })
	})

	it('should handle unsupported operators gracefully by defaulting to empty string for operator', () => {
		const filters = [{ field: 'color', operator: 'unsupported' as any, value: 'red' }] as any
		expect(genFilters(filters)).toEqual({ color: 'red' })
	})
})
