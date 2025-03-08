import { describe, expect, it } from 'vitest'
import { getNextPageParam, getPreviousPageParam } from './get-infinite-list'

describe('get infinite list', () => {
	describe('for getNextPageParam', () => {
		it('should get undefine when deafult', () => {
			const hasNextPage = getNextPageParam({
				data: [],
				total: 10,
			})
			expect(hasNextPage).toBe(undefined)
		})
		it('should get value from pagination', () => {
			const hasNextPage = getNextPageParam({
				data: [],
				total: 10,
				pagination: {
					current: 2,
					perPage: 3,
				},
			})
			expect(hasNextPage).toBe(3)
		})
		it('should get value from cursor', () => {
			const hasNextPage = getNextPageParam({
				data: [],
				total: 10,
				cursor: {
					next: 2,
				},
			})
			expect(hasNextPage).toBe(2)
		})
	})

	describe('for getPreviousPageParam', () => {
		it('should get undefine when deafult', () => {
			const hasPreviousPage = getPreviousPageParam({
				data: [],
				total: 10,
			})
			expect(hasPreviousPage).toBe(undefined)
		})
		it('should get value from pagination', () => {
			const hasPreviousPage = getPreviousPageParam({
				data: [],
				total: 10,
				pagination: {
					current: 2,
					perPage: 3,
				},
			})
			expect(hasPreviousPage).toBe(1)
		})
		it('should get value from cursor', () => {
			const hasPreviousPage = getPreviousPageParam({
				data: [],
				total: 10,
				cursor: {
					next: 2,
					prev: 1,
				},
			})
			expect(hasPreviousPage).toBe(1)
		})
	})
})
