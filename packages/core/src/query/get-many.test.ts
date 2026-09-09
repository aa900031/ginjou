import type { Query } from '@tanstack/query-core'
import { QueryClient } from '@tanstack/query-core'
import { describe, expect, it, vi } from 'vitest'
import { createQueryEnabledFn, resolveAggregateArgs } from './get-many'

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

describe('resolveAggregateArgs', () => {
	const base = {
		fetcherName: 'default',
		resource: 'posts',
		meta: undefined as Record<string, unknown> | undefined,
		aggregate: true,
	}
	const fetchers = {} as any
	const context = {} as any
	const call = (props: Partial<typeof base> & { ids: string[] }) =>
		[{ ...base, ...props }, fetchers, context] as Parameters<typeof resolveAggregateArgs>[0][0]
	const resolves = (n: number) => Array.from({ length: n }, () => ({ resolve: vi.fn(), reject: vi.fn() }))

	it('should merge ids for calls with the same fetcher, resource and meta', () => {
		const result = resolveAggregateArgs(
			[call({ ids: ['1', '2'] }), call({ ids: ['2', '3'] })],
			resolves(2),
		)

		expect(result).toHaveLength(1)
		expect(result[0]![0][0].ids).toEqual(['1', '2', '3'])
		expect(result[0]![1]).toHaveLength(2)
	})

	it('should not merge calls with different meta', () => {
		const result = resolveAggregateArgs(
			[call({ ids: ['1'], meta: { lang: 'en' } }), call({ ids: ['2'], meta: { lang: 'zh' } })],
			resolves(2),
		)

		expect(result).toHaveLength(2)
		expect(result[0]![0][0]).toMatchObject({ ids: ['1'], meta: { lang: 'en' } })
		expect(result[1]![0][0]).toMatchObject({ ids: ['2'], meta: { lang: 'zh' } })
	})

	it('should resolve each call with only the records it asked for', async () => {
		const pairs = resolves(2)
		const [group] = resolveAggregateArgs(
			[call({ ids: ['1', '2'] }), call({ ids: ['3'] })],
			pairs,
		)
		const merged = {
			data: [{ id: '1' }, { id: '2' }, { id: '3' }],
			total: 3,
		}

		for (const { resolve } of group![1])
			resolve(merged)

		await expect(pairs[0]!.resolve.mock.calls[0]![0]).resolves.toEqual({
			data: [{ id: '1' }, { id: '2' }],
			total: 3,
		})
		await expect(pairs[1]!.resolve.mock.calls[0]![0]).resolves.toEqual({
			data: [{ id: '3' }],
			total: 3,
		})
	})

	it('should treat meta with different key order as the same', () => {
		const result = resolveAggregateArgs(
			[call({ ids: ['1'], meta: { a: 1, b: 2 } }), call({ ids: ['2'], meta: { b: 2, a: 1 } })],
			resolves(2),
		)

		expect(result).toHaveLength(1)
		expect(result[0]![0][0].ids).toEqual(['1', '2'])
	})
})
