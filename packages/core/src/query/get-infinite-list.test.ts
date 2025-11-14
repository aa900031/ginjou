import type { Query } from '@tanstack/query-core'
import { QueryClient } from '@tanstack/query-core'
import { describe, expect, it, vi } from 'vitest'
import { createGetNextPageParamFn, createGetPreviousPageParamFn, createQueryEnabledFn } from './get-infinite-list'

describe('get infinite list', () => {
	describe('for getNextPageParam', () => {
		it('should get undefine when deafult', () => {
			const getNextPageParam = createGetNextPageParamFn()
			const nextPage = getNextPageParam({
				data: [],
				total: 10,
			}, [], 0, [])
			expect(nextPage).toBe(undefined)
		})
		it('should get value from pagination', () => {
			const getNextPageParam = createGetNextPageParamFn()
			const nextPage = getNextPageParam({
				data: [],
				total: 10,
				pagination: {
					current: 2,
					perPage: 3,
				},
			}, [], 1, [1])
			expect(nextPage).toBe(3)
		})
		it('should get value from cursor', () => {
			const getNextPageParam = createGetNextPageParamFn()
			const nextPage = getNextPageParam({
				data: [],
				total: 10,
				cursor: {
					next: 2,
				},
			}, [], 1, [1])
			expect(nextPage).toBe(2)
		})
	})

	describe('for getPreviousPageParam', () => {
		it('should get undefine when deafult', () => {
			const getPreviousPageParam = createGetPreviousPageParamFn()
			const previousPage = getPreviousPageParam({
				data: [],
				total: 10,
			}, [], 0, [])
			expect(previousPage).toBe(undefined)
		})
		it('should get value from pagination', () => {
			const getPreviousPageParam = createGetPreviousPageParamFn()
			const previousPage = getPreviousPageParam({
				data: [],
				total: 10,
				pagination: {
					current: 2,
					perPage: 3,
				},
			}, [], 1, [1])
			expect(previousPage).toBe(1)
		})
		it('should get value from cursor', () => {
			const getPreviousPageParam = createGetPreviousPageParamFn()
			const previousPage = getPreviousPageParam({
				data: [],
				total: 10,
				cursor: {
					next: 2,
					prev: 1,
				},
			}, [], 1, [1])
			expect(previousPage).toBe(1)
		})
	})
})

describe('createQueryEnabledFn', () => {
	const mockQuery = {} as Query<any, any, any>
	const queryClient = new QueryClient()
	const getQueryKey = () => ['test']
	const getQueryOptions = () => undefined
	vi.spyOn(queryClient.getQueryCache(), 'get').mockReturnValue(mockQuery)

	it('should return true if getEnabled returns true and resource is valid', () => {
		const getEnabled = () => true
		const getResource = () => 'posts'
		const enabledFn = createQueryEnabledFn({ getQueryKey, getEnabled, getResource, getQueryOptions, queryClient })
		expect(enabledFn()).toBe(true)
	})

	it('should return false if getEnabled returns false', () => {
		const getEnabled = () => false
		const getResource = () => 'posts'
		const enabledFn = createQueryEnabledFn({ getQueryKey, getEnabled, getResource, getQueryOptions, queryClient })
		expect(enabledFn()).toBe(false)
	})

	it('should return false if resource is empty', () => {
		const getEnabled = () => true
		const getResource = () => ''
		const enabledFn = createQueryEnabledFn({ getQueryKey, getEnabled, getResource, getQueryOptions, queryClient })
		expect(enabledFn()).toBe(false)
	})

	it('should handle function-based getEnabled correctly', () => {
		const getResource = () => 'posts'
		const getEnabled = () => (_query: Query<any, any, any>) => true
		const enabledFn = createQueryEnabledFn({ getQueryKey, getEnabled, getResource, getQueryOptions, queryClient })
		expect(enabledFn(mockQuery)).toBe(true)
	})
})
