import type { Sort, Sorters } from './sorter'
import { describe, expect, it } from 'vitest'
import { findSorter, isSortOrder, isTargetSorter, selectSorters, SortOrder } from './sorter'

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

	it('should match, select and find sorters', () => {
		expect(isTargetSorter(titleAsc, { field: 'title', order: SortOrder.Asc })).toBe(true)
		expect(isTargetSorter(createdAtDesc, { field: 'title', order: SortOrder.Asc })).toBe(false)
		expect(isTargetSorter(createdAtDesc, { field: 'createdAt' })).toBe(true)
		expect(selectSorters(sorters, { field: 'title', order: SortOrder.Asc })).toEqual([titleAsc, titleAscAgain])
		expect(findSorter(sorters, { field: 'title' })).toBe(titleAsc)
	})
})
