import { describe, expect, it } from 'vitest'
import { getNextPageParam, getPreviousPageParam } from './get-infinite-list'

describe('get infinite list', () => {
	describe('for getNextPageParam', () => {
		it('should get undefine when deafult', () => {
			const nextPage = getNextPageParam({
				data: [],
				total: 10,
			})
			expect(nextPage).toBe(undefined)
		})
		it('should get value from pagination', () => {
			const nextPage = getNextPageParam({
				data: [],
				total: 10,
				pagination: {
					current: 2,
					perPage: 3,
				},
			})
			expect(nextPage).toBe(3)
		})
		it('should get value from cursor', () => {
			const nextPage = getNextPageParam({
				data: [],
				total: 10,
				cursor: {
					next: 2,
				},
			})
			expect(nextPage).toBe(2)
		})
	})

	describe('for getPreviousPageParam', () => {
		it('should get undefine when deafult', () => {
			const previousPage = getPreviousPageParam({
				data: [],
				total: 10,
			})
			expect(previousPage).toBe(undefined)
		})
		it('should get value from pagination', () => {
			const previousPage = getPreviousPageParam({
				data: [],
				total: 10,
				pagination: {
					current: 2,
					perPage: 3,
				},
			})
			expect(previousPage).toBe(1)
		})
		it('should get value from cursor', () => {
			const previousPage = getPreviousPageParam({
				data: [],
				total: 10,
				cursor: {
					next: 2,
					prev: 1,
				},
			})
			expect(previousPage).toBe(1)
		})
	})
})
