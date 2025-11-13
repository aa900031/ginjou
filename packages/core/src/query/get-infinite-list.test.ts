import type { Query } from '@tanstack/query-core'
import { QueryClient } from '@tanstack/query-core'
import { describe, expect, it, vi } from 'vitest'
import { createQueryEnabledFn, getNextPageParam, getPreviousPageParam } from './get-infinite-list'

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

describe('createQueryEnabledFn', () => {
	const mockQuery = {} as Query<any, any, any>
	const queryClient = new QueryClient()
	const getQueryKey = () => ['test']
	vi.spyOn(queryClient.getQueryCache(), 'get').mockReturnValue(mockQuery)

	it('should return true if getEnabled returns true and resource is valid', () => {
		const getEnabled = () => true
		const getResource = () => 'posts'
		const enabledFn = createQueryEnabledFn({ getQueryKey, getEnabled, getResource, queryClient })
		expect(enabledFn()).toBe(true)
	})

	it('should return false if getEnabled returns false', () => {
		const getEnabled = () => false
		const getResource = () => 'posts'
		const enabledFn = createQueryEnabledFn({ getQueryKey, getEnabled, getResource, queryClient })
		expect(enabledFn()).toBe(false)
	})

	it('should return false if resource is empty', () => {
		const getEnabled = () => true
		const getResource = () => ''
		const enabledFn = createQueryEnabledFn({ getQueryKey, getEnabled, getResource, queryClient })
		expect(enabledFn()).toBe(false)
	})
})
