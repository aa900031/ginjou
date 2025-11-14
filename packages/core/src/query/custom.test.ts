import type { Query } from '@tanstack/query-core'
import { QueryClient } from '@tanstack/query-core'
import { describe, expect, it, vi } from 'vitest'
import { createQueryEnabledFn } from './custom'

describe('createQueryEnabledFn', () => {
	const mockQuery = {} as Query<any, any, any>
	const queryClient = new QueryClient()
	const getQueryKey = () => ['test']
	vi.spyOn(queryClient.getQueryCache(), 'get').mockReturnValue(mockQuery)

	it('should return true if getEnabled returns true and id is valid', () => {
		const getEnabled = () => true
		const enabledFn = createQueryEnabledFn({ getQueryKey, getEnabled, queryClient })
		expect(enabledFn()).toBe(true)
	})

	it('should return false if getEnabled returns false', () => {
		const getEnabled = () => false
		const enabledFn = createQueryEnabledFn({ getQueryKey, getEnabled, queryClient })
		expect(enabledFn()).toBe(false)
	})

	it('should handle function-based getEnabled correctly', () => {
		const getEnabled = () => (_query: Query<any, any, any>) => true
		const enabledFn = createQueryEnabledFn({ getQueryKey, getEnabled, queryClient })
		expect(enabledFn(mockQuery)).toBe(true)
	})

	it('should handle function-based getEnabled correctly (false)', () => {
		const getEnabled = () => (_query: Query<any, any, any>) => false
		const enabledFn = createQueryEnabledFn({ getQueryKey, getEnabled, queryClient })
		expect(enabledFn(mockQuery)).toBe(false)
	})
})
