import type { RuleOptions } from './invalidate'
import { QueryClient } from '@tanstack/query-core'
import { describe, expect, it, vi } from 'vitest'
import { createInvalidator } from './invalidate'

function seedQueries(queryClient: QueryClient, keys: unknown[][]) {
	for (const key of keys)
		queryClient.setQueryData(key, { data: null })
}

function isInvalidated(queryClient: QueryClient, key: unknown[]) {
	return queryClient.getQueryState(key)?.isInvalidated ?? false
}

describe('createInvalidator', () => {
	it('resolves invalidates when applying defaults', async () => {
		const queryClient = new QueryClient()
		const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
		const resolveInvalidates = vi.fn((): RuleOptions => ['list'])
		const invalidate = createInvalidator({
			getFetcherName: () => 'primary',
			getInvalidates: () => undefined,
			getResource: () => 'posts',
			queryClient,
		})

		await invalidate({
			invalidates: resolveInvalidates,
		}, {
			defaults: { invalidates: ['resource'] },
		})

		expect(resolveInvalidates).toHaveBeenCalledWith({
			defaults: { invalidates: ['resource'] },
			props: { invalidates: resolveInvalidates },
		})
		expect(invalidateQueries).toHaveBeenCalledWith(
			{ queryKey: ['primary', 'posts', 'getList'], type: 'all', refetchType: 'active' },
			{ cancelRefetch: false },
		)
		expect(invalidateQueries).toHaveBeenCalledWith(
			{ queryKey: ['primary', 'posts', 'getInfiniteList'], type: 'all', refetchType: 'active' },
			{ cancelRefetch: false },
		)
	})

	it('invalidates one queries by id prefix and many queries containing affected ids for string rules', async () => {
		const queryClient = new QueryClient()
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => undefined,
			getResource: () => undefined,
			queryClient,
		})
		const keys = {
			one1: ['default', 'posts', 'getOne', 1, { meta: undefined }],
			one3WithMeta: ['default', 'posts', 'getOne', 3, { meta: { fields: ['title'] } }],
			one4: ['default', 'posts', 'getOne', 4, { meta: undefined }],
			manyWith3: ['default', 'posts', 'getMany', ['5', '3'], { meta: undefined }],
			manyWithout: ['default', 'posts', 'getMany', ['5', '6'], { meta: undefined }],
			otherResource: ['default', 'authors', 'getOne', 1, { meta: undefined }],
		}
		seedQueries(queryClient, Object.values(keys))

		const mutationProps = {
			invalidates: ['one', 'many'] as RuleOptions,
			resource: 'posts',
			ids: [1, 2],
			meta: { lang: 'en' },
		}
		await invalidate(mutationProps, {
			data: { data: [{ id: 2 }, { id: 3 }] },
		})

		expect(isInvalidated(queryClient, keys.one1)).toBe(true)
		expect(isInvalidated(queryClient, keys.one3WithMeta)).toBe(true)
		expect(isInvalidated(queryClient, keys.one4)).toBe(false)
		expect(isInvalidated(queryClient, keys.manyWith3)).toBe(true)
		expect(isInvalidated(queryClient, keys.manyWithout)).toBe(false)
		expect(isInvalidated(queryClient, keys.otherResource)).toBe(false)
	})

	it('uses single props id and result id for string many rule', async () => {
		const queryClient = new QueryClient()
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => undefined,
			getResource: () => 'posts',
			queryClient,
		})
		const keys = {
			manyWith1: ['default', 'posts', 'getMany', ['1', '9'], { meta: undefined }],
			manyWith4: ['default', 'posts', 'getMany', ['4'], { meta: { lang: 'en' } }],
			manyWithout: ['default', 'posts', 'getMany', ['9'], { meta: undefined }],
		}
		seedQueries(queryClient, Object.values(keys))

		const mutationProps = { invalidates: ['many'] as RuleOptions, id: 1 }
		await invalidate(mutationProps, {
			data: { data: { id: 4 } },
		})

		expect(isInvalidated(queryClient, keys.manyWith1)).toBe(true)
		expect(isInvalidated(queryClient, keys.manyWith4)).toBe(true)
		expect(isInvalidated(queryClient, keys.manyWithout)).toBe(false)
	})

	it('prefers user predicate over the many predicate', async () => {
		const queryClient = new QueryClient()
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => undefined,
			getResource: () => 'posts',
			queryClient,
		})
		const keys = {
			manyWith1: ['default', 'posts', 'getMany', ['1'], { meta: undefined }],
			manyWithout: ['default', 'posts', 'getMany', ['9'], { meta: undefined }],
		}
		seedQueries(queryClient, Object.values(keys))

		const mutationProps = {
			invalidates: {
				rules: ['many'],
				queryFilters: { predicate: query => (query.queryKey[3] as string[] | undefined)?.[0] === '9' },
			} as RuleOptions,
			id: 1,
		}
		await invalidate(mutationProps, { data: undefined })

		expect(isInvalidated(queryClient, keys.manyWith1)).toBe(false)
		expect(isInvalidated(queryClient, keys.manyWithout)).toBe(true)
	})

	it('requires mutation context for string one and many rules', async () => {
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => undefined,
			getResource: () => 'posts',
			queryClient: new QueryClient(),
		})

		await expect(invalidate({ invalidates: ['one'] })).rejects.toThrow('Mutation context is required')
		await expect(invalidate({ invalidates: ['many'] })).rejects.toThrow('Mutation context is required')
	})

	it('uses id prefix for object one rules without meta and exact keys with meta', async () => {
		const queryClient = new QueryClient()
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => undefined,
			getResource: () => undefined,
			queryClient,
		})
		const keys = {
			one1WithMeta: ['default', 'authors', 'getOne', 1, { meta: { lang: 'en' } }],
			legacy2: ['legacy', 'authors', 'getOne', 2, { meta: undefined }],
			legacy3: ['legacy', 'authors', 'getOne', 3, { meta: undefined }],
			one5Exact: ['default', 'authors', 'getOne', 5, { meta: { lang: 'en' } }],
			one5Other: ['default', 'authors', 'getOne', 5, { meta: { lang: 'fr' } }],
			manyExact: ['default', 'authors', 'getMany', ['1', '2'], { meta: { lang: 'en' } }],
			manyReordered: ['default', 'authors', 'getMany', ['2', '1'], { meta: undefined }],
		}
		seedQueries(queryClient, Object.values(keys))

		await invalidate({
			invalidates: [
				{ target: 'one', resource: 'authors', id: 1 },
				{ target: 'one', resource: 'authors', ids: [2, 3], fetcherName: 'legacy' },
				{ target: 'one', resource: 'authors', id: 5, meta: { lang: 'en' } },
				{ target: 'many', resource: 'authors', ids: [1, 2] },
			],
		})

		expect(isInvalidated(queryClient, keys.one1WithMeta)).toBe(true)
		expect(isInvalidated(queryClient, keys.legacy2)).toBe(true)
		expect(isInvalidated(queryClient, keys.legacy3)).toBe(true)
		expect(isInvalidated(queryClient, keys.one5Exact)).toBe(true)
		expect(isInvalidated(queryClient, keys.one5Other)).toBe(false)
		expect(isInvalidated(queryClient, keys.manyExact)).toBe(true)
		expect(isInvalidated(queryClient, keys.manyReordered)).toBe(false)
	})

	it('supports object rule options and replaces default filters and options', async () => {
		const queryClient = new QueryClient()
		const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => undefined,
			getResource: () => 'posts',
			queryClient,
		})

		await invalidate({
			invalidates: {
				rules: ['resource'],
				queryFilters: { refetchType: 'all' },
				options: { throwOnError: true },
			},
		})

		expect(invalidateQueries).toHaveBeenCalledOnce()
		expect(invalidateQueries).toHaveBeenCalledWith(
			{ queryKey: ['default', 'posts'], refetchType: 'all' },
			{ throwOnError: true },
		)
	})

	it('skips object rule options with false or empty rules', async () => {
		const queryClient = new QueryClient()
		const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => ({ rules: false }),
			getResource: () => 'posts',
			queryClient,
		})

		await invalidate({}, { defaults: { invalidates: ['list'] } })
		await invalidate({ invalidates: { rules: [] } })

		expect(invalidateQueries).not.toHaveBeenCalled()
	})

	it('passes context defaults to the resolve function and accepts object result', async () => {
		const queryClient = new QueryClient()
		const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => undefined,
			getResource: () => 'posts',
			queryClient,
		})

		await invalidate({
			invalidates: ({ defaults }) => ({
				rules: [...(defaults?.invalidates || []), { target: 'resource', resource: 'comments' }],
				queryFilters: { type: 'active' },
			}),
		}, { defaults: { invalidates: ['list'] } })

		expect(invalidateQueries.mock.calls.map(([filters]) => filters)).toEqual([
			{ queryKey: ['default', 'posts', 'getList'], type: 'active' },
			{ queryKey: ['default', 'posts', 'getInfiniteList'], type: 'active' },
			{ queryKey: ['default', 'comments'], type: 'active' },
		])
	})

	it('lets call props override defaults and supports false', async () => {
		const queryClient = new QueryClient()
		const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => ['all'],
			getResource: () => undefined,
			queryClient,
		})

		await invalidate({ invalidates: false })

		expect(invalidateQueries).not.toHaveBeenCalled()
	})

	it('validates required props when executed', async () => {
		const queryClient = new QueryClient()
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => undefined,
			getResource: () => undefined,
			queryClient,
		})

		await expect(invalidate({})).rejects.toThrow('`invalidates` is required')
		await expect(invalidate({ invalidates: ['list'] })).rejects.toThrow('`resource` is required')
	})
})
