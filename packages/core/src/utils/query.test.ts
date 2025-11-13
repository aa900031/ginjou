import type { Query } from '@tanstack/query-core'
import { QueryClient } from '@tanstack/query-core'
import { describe, expect, it, vi } from 'vitest'
import { getQuery, resolveQueryEnableds } from './query'

describe('resolveQueryEnableds', () => {
	const mockQuery = {} as Query

	it('should return true if enableds is an empty array', () => {
		expect(resolveQueryEnableds(mockQuery, [])).toBe(true)
	})

	it('should return true if all values are true', () => {
		expect(resolveQueryEnableds(mockQuery, [true, () => true])).toBe(true)
	})

	it('should return false if one of the values is false', () => {
		expect(resolveQueryEnableds(mockQuery, [true, false, () => true])).toBe(
			false,
		)
	})

	it('should return false if one of the functions returns false', () => {
		expect(resolveQueryEnableds(mockQuery, [true, () => false])).toBe(false)
	})

	it('should handle undefined values', () => {
		expect(resolveQueryEnableds(mockQuery, [true, undefined, () => true])).toBe(
			true,
		)
	})

	it('should handle functions that return undefined', () => {
		expect(resolveQueryEnableds(mockQuery, [true, () => undefined])).toBe(true)
	})

	it('should pass the query object to the function', () => {
		const fn = vi.fn()
		resolveQueryEnableds(mockQuery, [fn])
		expect(fn).toHaveBeenCalledWith(mockQuery)
	})
})

describe('getQuery', () => {
	it('should return query from cache', () => {
		const queryKey = ['test']
		const queryClient = new QueryClient()
		const cache = queryClient.getQueryCache()
		const query = cache.build(queryClient, { queryKey })
		cache.add(query)
		expect(getQuery(queryKey, queryClient)).toBe(query)
	})

	it('should throw error if query not found', () => {
		const queryKey = ['test']
		const queryClient = new QueryClient()
		expect(() => getQuery(queryKey, queryClient)).toThrowError('No')
	})
})
