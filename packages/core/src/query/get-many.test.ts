import type { Query } from '@tanstack/query-core'
import { QueryClient } from '@tanstack/query-core'
import { describe, expect, it, vi } from 'vitest'
import { createPlaceholderDataFn, createQueryEnabledFn } from './get-many'
import { createQueryKey as createGetOneQueryKey } from './get-one'

describe('createQueryEnabledFn', () => {
	const mockQuery = {} as Query<any, any, any>
	const queryClient = new QueryClient()
	const getQueryKey = () => ['test']
	const getQueryOptions = () => undefined
	vi.spyOn(queryClient.getQueryCache(), 'get').mockReturnValue(mockQuery)

	it('should return true if getEnabled returns true, resource is valid and ids are not empty', () => {
		const getEnabled = () => true
		const getResource = () => 'posts'
		const getIds = () => ['1', '2']
		const enabledFn = createQueryEnabledFn({ getQueryKey, getEnabled, getResource, getIds, getQueryOptions, queryClient })
		expect(enabledFn()).toBe(true)
	})

	it('should return false if getEnabled returns false', () => {
		const getEnabled = () => false
		const getResource = () => 'posts'
		const getIds = () => ['1', '2']
		const enabledFn = createQueryEnabledFn({ getQueryKey, getEnabled, getResource, getIds, getQueryOptions, queryClient })
		expect(enabledFn()).toBe(false)
	})

	it('should return false if resource is empty', () => {
		const getEnabled = () => true
		const getResource = () => ''
		const getIds = () => ['1', '2']
		const enabledFn = createQueryEnabledFn({ getQueryKey, getEnabled, getResource, getIds, getQueryOptions, queryClient })
		expect(enabledFn()).toBe(false)
	})

	it('should return false if ids is empty', () => {
		const getEnabled = () => true
		const getResource = () => 'posts'
		const getIds = () => []
		const enabledFn = createQueryEnabledFn({ getQueryKey, getEnabled, getResource, getIds, getQueryOptions, queryClient })
		expect(enabledFn()).toBe(false)
	})

	it('should handle function-based getEnabled correctly', () => {
		const getResource = () => 'posts'
		const getIds = () => ['1', '2']
		const getEnabled = () => (_query: Query<any, any, any>) => true
		const enabledFn = createQueryEnabledFn({ getQueryKey, getEnabled, getResource, getIds, getQueryOptions, queryClient })
		expect(enabledFn(mockQuery)).toBe(true)
	})
})

describe('createPlaceholderDataFn', () => {
	const base = {
		fetcherName: 'default',
		resource: 'posts',
		meta: undefined,
		aggregate: true,
	}

	function setup(ids: string[], queryClient = new QueryClient()) {
		const placeholderDataFn = createPlaceholderDataFn({
			getProps: () => ({ ...base, ids }),
			queryClient,
		})
		return { queryClient, placeholderDataFn }
	}

	function cacheGetOne(queryClient: QueryClient, id: string, title: string) {
		queryClient.setQueryData(
			createGetOneQueryKey({ props: { ...base, id } }),
			{ data: { id, title } },
		)
	}

	it('should unwrap cached getOne results into records', () => {
		const { queryClient, placeholderDataFn } = setup(['1', '2'])
		cacheGetOne(queryClient, '1', 'one')
		cacheGetOne(queryClient, '2', 'two')

		expect(placeholderDataFn(undefined, undefined)).toEqual({
			data: [
				{ id: '1', title: 'one' },
				{ id: '2', title: 'two' },
			],
		})
	})

	it('should fall back to previous data if any id is not cached', () => {
		const { queryClient, placeholderDataFn } = setup(['1', '2'])
		cacheGetOne(queryClient, '1', 'one')
		const previous = { data: [{ id: '0', title: 'zero' }] }

		expect(placeholderDataFn(undefined, undefined)).toBeUndefined()
		expect(placeholderDataFn(previous, undefined)).toBe(previous)
	})

	it('should return undefined if ids is empty', () => {
		const { placeholderDataFn } = setup([])

		expect(placeholderDataFn(undefined, undefined)).toBeUndefined()
	})

	it('should respect queryKeyHashFn from queryClient default options', () => {
		const queryKeyHashFn = vi.fn((key: readonly unknown[]) => `custom:${JSON.stringify(key)}`)
		const { queryClient, placeholderDataFn } = setup(['1'], new QueryClient({
			defaultOptions: { queries: { queryKeyHashFn } },
		}))
		cacheGetOne(queryClient, '1', 'one')

		expect(placeholderDataFn(undefined, undefined)).toEqual({
			data: [{ id: '1', title: 'one' }],
		})
		expect(queryKeyHashFn).toHaveBeenCalled()
	})
})
