import type { Query } from '@tanstack/query-core'
import { QueryClient } from '@tanstack/query-core'
import { describe, expect, it, vi } from 'vitest'
import { createQueryEnabledFn } from './get-list'

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
