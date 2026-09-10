import type { Query, QueryFunction } from '@tanstack/query-core'
import type { BaseRecord, GetManyResult } from './fetcher'
import { QueryClient } from '@tanstack/query-core'
import { describe, expect, it, vi } from 'vitest'
import { createQueryEnabledFn, createQueryFn, resolveAggregateArgs } from './get-many'

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
		aggregate: true,
	}
	const fetchers = {} as any
	const context = {} as any
	const call = (ids: string[], meta?: Record<string, unknown>): Parameters<typeof resolveAggregateArgs>[0][0] =>
		[{ ...base, ids, meta }, fetchers, context]
	const pair = () => ({ resolve: vi.fn(), reject: vi.fn() })

	it('should merge ids for calls with the same fetcher, resource and meta', () => {
		const pairs = [pair(), pair()]
		const result = resolveAggregateArgs(
			[call(['1', '2']), call(['2', '3'])],
			pairs,
		)

		expect(result).toHaveLength(1)
		expect(result[0]![0][0].ids).toEqual(['1', '2', '3'])
		expect(result[0]![1]).toEqual(pairs)
	})

	it('should not merge calls with different meta', () => {
		const result = resolveAggregateArgs(
			[call(['1'], { lang: 'en' }), call(['2'], { lang: 'zh' })],
			[pair(), pair()],
		)

		expect(result).toHaveLength(2)
		expect(result[0]![0][0]).toMatchObject({ ids: ['1'], meta: { lang: 'en' } })
		expect(result[1]![0][0]).toMatchObject({ ids: ['2'], meta: { lang: 'zh' } })
	})

	it('should treat meta with different key order as the same', () => {
		const result = resolveAggregateArgs(
			[call(['1'], { a: 1, b: 2 }), call(['2'], { b: 2, a: 1 })],
			[pair(), pair()],
		)

		expect(result).toHaveLength(1)
		expect(result[0]![0][0].ids).toEqual(['1', '2'])
	})
})

describe('createQueryFn', () => {
	it('should give each aggregated caller only the records it asked for', async () => {
		const getMany = vi.fn(async ({ ids }: { ids: string[] }) => ({ data: ids.map(id => ({ id })) }))
		const fetchers = { default: { getMany } } as any
		const queryClient = new QueryClient()
		const run = (ids: string[]) => (createQueryFn({
			fetchers,
			queryClient,
			getProps: () => ({ fetcherName: 'default', resource: 'posts', aggregate: true, ids, meta: undefined }),
		}) as QueryFunction<GetManyResult<BaseRecord>>)({} as any)

		const [a, b] = await Promise.all([run(['1', '2']), run(['3'])])

		expect(getMany).toHaveBeenCalledTimes(1)
		expect(getMany.mock.calls[0]![0].ids).toEqual(['1', '2', '3'])
		expect(a).toEqual({ data: [{ id: '1' }, { id: '2' }] })
		expect(b).toEqual({ data: [{ id: '3' }] })
	})
})
