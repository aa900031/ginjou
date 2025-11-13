import type { Query } from '@tanstack/query-core'
import { QueryClient } from '@tanstack/query-core'
import { describe, expect, it, vi } from 'vitest'
import { createQueryEnabledFn } from './get-one'

describe('createQueryEnabledFn', () => {
	const mockQuery = {} as Query<any, any, any>
	const queryClient = new QueryClient()
	const getQueryKey = () => ['test']
	vi.spyOn(queryClient.getQueryCache(), 'get').mockReturnValue(mockQuery)

	it('should return true if getEnabled returns true and id is valid', () => {
		const getEnabled = () => true
		const getId = () => '1'
		const enabledFn = createQueryEnabledFn({ getQueryKey, getEnabled, getId, queryClient })
		expect(enabledFn()).toBe(true)
	})

	it('should return false if getEnabled returns false', () => {
		const getEnabled = () => false
		const getId = () => '1'
		const enabledFn = createQueryEnabledFn({ getQueryKey, getEnabled, getId, queryClient })
		expect(enabledFn()).toBe(false)
	})

	it('should return false if id is empty', () => {
		const getEnabled = () => true
		const getId = () => ''
		const enabledFn = createQueryEnabledFn({ getQueryKey, getEnabled, getId, queryClient })
		expect(enabledFn()).toBe(false)
	})
})
