import { SortOrder } from '@ginjou/core'
import { describe, expect, it } from 'vitest'
import { genSorters } from './sorters'

describe('genSorters', () => {
	it('should return undefined if sorters are void or undefined', () => {
		expect(genSorters()).toBeUndefined()
		expect(genSorters(undefined)).toBeUndefined()
	})

	it('should return undefined if sorters array is empty', () => {
		expect(genSorters([])).toBeUndefined()
	})

	it('should handle a single sorter', () => {
		const sorters = [{ field: 'name', order: SortOrder.Asc }]
		expect(genSorters(sorters)).toEqual({
			sorts: ['name'],
			orders: [SortOrder.Asc],
			_sort: 'name',
			_order: SortOrder.Asc,
		})
	})

	it('should handle multiple sorters', () => {
		const sorters = [
			{ field: 'name', order: SortOrder.Asc },
			{ field: 'age', order: SortOrder.Desc },
		]
		expect(genSorters(sorters)).toEqual({
			sorts: ['name', 'age'],
			orders: [SortOrder.Asc, SortOrder.Desc],
			_sort: 'name,age',
			_order: `${SortOrder.Asc},${SortOrder.Desc}`,
		})
	})

	it('should handle different sort orders', () => {
		const sorters = [
			{ field: 'date', order: SortOrder.Desc },
			{ field: 'id', order: SortOrder.Asc },
		]
		expect(genSorters(sorters)).toEqual({
			sorts: ['date', 'id'],
			orders: [SortOrder.Desc, SortOrder.Asc],
			_sort: 'date,id',
			_order: `${SortOrder.Desc},${SortOrder.Asc}`,
		})
	})
})
