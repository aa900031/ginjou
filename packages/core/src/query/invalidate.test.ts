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
	it('resolves invalidates from a function with the context', async () => {
		const queryClient = new QueryClient()
		const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
		const resolveInvalidates = vi.fn((): RuleOptions => ['list'])
		const invalidate = createInvalidator({
			getFetcherName: () => 'primary',
			getInvalidates: () => undefined,
			getResource: () => 'posts',
			getId: () => undefined,
			getIds: () => undefined,
			queryClient,
		})

		await invalidate({
			invalidates: resolveInvalidates,
			ids: [1],
		}, {
			data: { data: { id: 1 } },
		})

		expect(resolveInvalidates).toHaveBeenCalledWith({
			ids: [1],
			data: { data: { id: 1 } },
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

	it('invalidates one queries by id and many queries containing context ids for string rules', async () => {
		const queryClient = new QueryClient()
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => undefined,
			getResource: () => undefined,
			getId: () => undefined,
			getIds: () => undefined,
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

		await invalidate({
			invalidates: ['one', 'many'],
			resource: 'posts',
			ids: [1, 2, 3],
		})

		expect(isInvalidated(queryClient, keys.one1)).toBe(true)
		expect(isInvalidated(queryClient, keys.one3WithMeta)).toBe(true)
		expect(isInvalidated(queryClient, keys.one4)).toBe(false)
		expect(isInvalidated(queryClient, keys.manyWith3)).toBe(true)
		expect(isInvalidated(queryClient, keys.manyWithout)).toBe(false)
		expect(isInvalidated(queryClient, keys.otherResource)).toBe(false)
	})

	it('collects ids from result data, ids and id, dropping missing and duplicate ones', async () => {
		const queryClient = new QueryClient()
		const resolveInvalidates = vi.fn((): RuleOptions => ['one'])
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => resolveInvalidates,
			getResource: () => 'posts',
			getId: () => undefined,
			getIds: () => undefined,
			queryClient,
		})
		const keys = {
			one1: ['default', 'posts', 'getOne', 1, { meta: undefined }],
			one2: ['default', 'posts', 'getOne', 2, { meta: undefined }],
		}
		seedQueries(queryClient, Object.values(keys))

		const data = { data: [{ id: 2 }, undefined, {}] }
		await invalidate({ ids: [1, 2], id: 1 }, { data })

		expect(resolveInvalidates).toHaveBeenCalledWith({ ids: [2, 1], data })
		expect(isInvalidated(queryClient, keys.one1)).toBe(true)
		expect(isInvalidated(queryClient, keys.one2)).toBe(true)
	})

	it('runs user predicate for string many rule without affected ids', async () => {
		const queryClient = new QueryClient()
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => undefined,
			getResource: () => 'posts',
			getId: () => undefined,
			getIds: () => undefined,
			queryClient,
		})
		const keys = {
			many1: ['default', 'posts', 'getMany', ['1'], { meta: undefined }],
			many9: ['default', 'posts', 'getMany', ['9'], { meta: undefined }],
		}
		seedQueries(queryClient, Object.values(keys))

		await invalidate({
			invalidates: {
				rules: ['many'],
				filters: { predicate: query => (query.queryKey[3] as string[] | undefined)?.[0] === '9' },
			},
		}, { data: { data: {} } })

		expect(isInvalidated(queryClient, keys.many1)).toBe(false)
		expect(isInvalidated(queryClient, keys.many9)).toBe(true)
	})

	it('matches many queries containing any id', async () => {
		const queryClient = new QueryClient()
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => undefined,
			getResource: () => 'posts',
			getId: () => undefined,
			getIds: () => undefined,
			queryClient,
		})
		const keys = {
			manyWith1: ['default', 'posts', 'getMany', ['1', '9'], { meta: undefined }],
			manyWith4: ['default', 'posts', 'getMany', ['4'], { meta: { lang: 'en' } }],
			manyWithout: ['default', 'posts', 'getMany', ['9'], { meta: undefined }],
		}
		seedQueries(queryClient, Object.values(keys))

		await invalidate({ invalidates: ['many'], ids: [1, 4] })

		expect(isInvalidated(queryClient, keys.manyWith1)).toBe(true)
		expect(isInvalidated(queryClient, keys.manyWith4)).toBe(true)
		expect(isInvalidated(queryClient, keys.manyWithout)).toBe(false)
	})

	it('narrows rule matching with the user predicate', async () => {
		const queryClient = new QueryClient()
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => undefined,
			getResource: () => 'posts',
			getId: () => undefined,
			getIds: () => undefined,
			queryClient,
		})
		const keys = {
			manyOnly1: ['default', 'posts', 'getMany', ['1'], { meta: undefined }],
			manyWith1: ['default', 'posts', 'getMany', ['1', '2'], { meta: undefined }],
			manyWithout: ['default', 'posts', 'getMany', ['9'], { meta: undefined }],
			one1: ['default', 'posts', 'getOne', 1, { meta: { lang: 'en' } }],
			one1Plain: ['default', 'posts', 'getOne', 1, { meta: undefined }],
		}
		seedQueries(queryClient, Object.values(keys))

		await invalidate({
			invalidates: {
				rules: ['many', 'one'],
				filters: {
					predicate: query => query.queryKey[2] === 'getOne'
						? (query.queryKey[4] as { meta?: unknown }).meta != null
						: (query.queryKey[3] as string[]).length === 1,
					exact: true,
				},
			},
			id: 1,
		})

		expect(isInvalidated(queryClient, keys.manyOnly1)).toBe(true)
		expect(isInvalidated(queryClient, keys.manyWith1)).toBe(false)
		expect(isInvalidated(queryClient, keys.manyWithout)).toBe(false)
		expect(isInvalidated(queryClient, keys.one1)).toBe(true)
		expect(isInvalidated(queryClient, keys.one1Plain)).toBe(false)
	})

	it('invalidates every many query of the resource without ids', async () => {
		const queryClient = new QueryClient()
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => undefined,
			getResource: () => 'posts',
			getId: () => undefined,
			getIds: () => undefined,
			queryClient,
		})
		const keys = {
			many1: ['default', 'posts', 'getMany', ['1'], { meta: undefined }],
			many9: ['default', 'posts', 'getMany', ['9'], { meta: { lang: 'en' } }],
			otherResource: ['default', 'authors', 'getMany', ['1'], { meta: undefined }],
		}
		seedQueries(queryClient, Object.values(keys))

		await invalidate({ invalidates: ['many', { target: 'many', resource: 'authors', ids: [] }] })

		expect(isInvalidated(queryClient, keys.many1)).toBe(true)
		expect(isInvalidated(queryClient, keys.many9)).toBe(true)
		expect(isInvalidated(queryClient, keys.otherResource)).toBe(false)

		await invalidate({ invalidates: [{ target: 'many', resource: 'authors' }] })

		expect(isInvalidated(queryClient, keys.otherResource)).toBe(true)
	})

	it('matches object many rules without ids by meta as a subset', async () => {
		const queryClient = new QueryClient()
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => undefined,
			getResource: () => 'posts',
			getId: () => undefined,
			getIds: () => undefined,
			queryClient,
		})
		const keys = {
			manyEn: ['default', 'posts', 'getMany', ['1'], { meta: { lang: 'en', fields: ['title'] } }],
			manyFr: ['default', 'posts', 'getMany', ['2'], { meta: { lang: 'fr' } }],
			manyPlain: ['default', 'posts', 'getMany', ['3'], { meta: undefined }],
		}
		seedQueries(queryClient, Object.values(keys))

		await invalidate({ invalidates: [{ target: 'many', meta: { lang: 'en' } }] })

		expect(isInvalidated(queryClient, keys.manyEn)).toBe(true)
		expect(isInvalidated(queryClient, keys.manyFr)).toBe(false)
		expect(isInvalidated(queryClient, keys.manyPlain)).toBe(false)
	})

	it('warns and skips string one rules without ids', async () => {
		const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		try {
			const queryClient = new QueryClient()
			const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
			const invalidate = createInvalidator({
				getFetcherName: () => undefined,
				getInvalidates: () => undefined,
				getResource: () => 'posts',
				getId: () => undefined,
				getIds: () => undefined,
				queryClient,
			})

			await invalidate({ invalidates: ['one', 'list'] })

			expect(consoleWarn).toHaveBeenCalledOnce()
			expect(invalidateQueries.mock.calls.map(([filters]) => filters!.queryKey)).toEqual([
				['default', 'posts', 'getList'],
				['default', 'posts', 'getInfiniteList'],
			])
		}
		finally {
			consoleWarn.mockRestore()
		}
	})

	it('matches object rules by ids and meta as a subset', async () => {
		const queryClient = new QueryClient()
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => undefined,
			getResource: () => undefined,
			getId: () => undefined,
			getIds: () => undefined,
			queryClient,
		})
		const keys = {
			one1WithMeta: ['default', 'authors', 'getOne', 1, { meta: { lang: 'en' } }],
			legacy2: ['legacy', 'authors', 'getOne', 2, { meta: undefined }],
			legacy3: ['legacy', 'authors', 'getOne', 3, { meta: undefined }],
			one5Exact: ['default', 'authors', 'getOne', 5, { meta: { lang: 'en' } }],
			one5Other: ['default', 'authors', 'getOne', 5, { meta: { lang: 'fr' } }],
			one5Superset: ['default', 'authors', 'getOne', 5, { meta: { lang: 'en', fields: ['name'] } }],
			manyExact: ['default', 'authors', 'getMany', ['1', '2'], { meta: { lang: 'en' } }],
			manyReordered: ['default', 'authors', 'getMany', ['2', '1'], { meta: undefined }],
			manyLonger: ['default', 'authors', 'getMany', ['1', '2', '3'], { meta: undefined }],
			manyMetaExact: ['default', 'authors', 'getMany', ['7'], { meta: { lang: 'en' } }],
			manyMetaSuperset: ['default', 'authors', 'getMany', ['7'], { meta: { lang: 'en', fields: ['name'] } }],
		}
		seedQueries(queryClient, Object.values(keys))

		await invalidate({
			invalidates: [
				{ target: 'one', resource: 'authors', id: 1 },
				{ target: 'one', resource: 'authors', ids: [2, 3], fetcherName: 'legacy' },
				{ target: 'one', resource: 'authors', id: 5, meta: { lang: 'en' } },
				{ target: 'many', resource: 'authors', ids: [1, 2] },
				{ target: 'many', resource: 'authors', ids: [7], meta: { lang: 'en' } },
				{ target: 'many', resource: 'authors', ids: [] },
			],
		})

		expect(isInvalidated(queryClient, keys.one1WithMeta)).toBe(true)
		expect(isInvalidated(queryClient, keys.legacy2)).toBe(true)
		expect(isInvalidated(queryClient, keys.legacy3)).toBe(true)
		expect(isInvalidated(queryClient, keys.one5Exact)).toBe(true)
		expect(isInvalidated(queryClient, keys.one5Other)).toBe(false)
		expect(isInvalidated(queryClient, keys.one5Superset)).toBe(true)
		expect(isInvalidated(queryClient, keys.manyExact)).toBe(true)
		expect(isInvalidated(queryClient, keys.manyReordered)).toBe(false)
		expect(isInvalidated(queryClient, keys.manyLonger)).toBe(false)
		expect(isInvalidated(queryClient, keys.manyMetaExact)).toBe(true)
		expect(isInvalidated(queryClient, keys.manyMetaSuperset)).toBe(true)
	})

	it('supports object rule options and replaces default filters and options', async () => {
		const queryClient = new QueryClient()
		const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => undefined,
			getResource: () => 'posts',
			getId: () => undefined,
			getIds: () => undefined,
			queryClient,
		})

		await invalidate({
			invalidates: {
				rules: ['resource'],
				filters: { refetchType: 'all' },
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
			getId: () => undefined,
			getIds: () => undefined,
			queryClient,
		})

		await invalidate()
		await invalidate({ invalidates: { rules: [] } })

		expect(invalidateQueries).not.toHaveBeenCalled()
	})

	it('accepts an object result from the resolve function', async () => {
		const queryClient = new QueryClient()
		const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => undefined,
			getResource: () => 'posts',
			getId: () => undefined,
			getIds: () => undefined,
			queryClient,
		})

		await invalidate({
			invalidates: () => ({
				rules: ['list', { target: 'resource', resource: 'comments' }],
				filters: { type: 'active' },
			}),
		})

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
			getId: () => undefined,
			getIds: () => undefined,
			queryClient,
		})

		await invalidate({ invalidates: false })

		expect(invalidateQueries).not.toHaveBeenCalled()
	})

	it('uses hook-level props when called without arguments', async () => {
		const queryClient = new QueryClient()
		const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => ['resource'],
			getResource: () => 'posts',
			getId: () => undefined,
			getIds: () => undefined,
			queryClient,
		})

		await invalidate()

		expect(invalidateQueries).toHaveBeenCalledWith(
			{ queryKey: ['default', 'posts'], type: 'all', refetchType: 'active' },
			{ cancelRefetch: false },
		)
	})

	it('does not invalidate anything when a later rule is invalid', async () => {
		const queryClient = new QueryClient()
		const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => undefined,
			getResource: () => 'posts',
			getId: () => undefined,
			getIds: () => undefined,
			queryClient,
		})

		await expect(invalidate({ invalidates: ['list', { target: 'unknown' } as any] })).rejects.toThrow('Unsupported invalidate target')
		await expect(invalidate({
			invalidates: ['resource', { target: 'one', resource: 'posts', id: 1, ids: [2] } as any],
		})).rejects.toThrow('Exactly one of `id` or `ids`')

		expect(invalidateQueries).not.toHaveBeenCalled()
	})

	it('matches one queries by the raw id value', async () => {
		const queryClient = new QueryClient()
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => undefined,
			getResource: () => 'posts',
			getId: () => undefined,
			getIds: () => undefined,
			queryClient,
		})
		const keys = {
			oneNumber: ['default', 'posts', 'getOne', 1, { meta: undefined }],
			oneString: ['default', 'posts', 'getOne', '2', { meta: undefined }],
			oneOther: ['default', 'posts', 'getOne', 3, { meta: undefined }],
		}
		seedQueries(queryClient, Object.values(keys))

		await invalidate({ invalidates: ['one'], ids: ['1', '2'] })

		expect(isInvalidated(queryClient, keys.oneNumber)).toBe(false)
		expect(isInvalidated(queryClient, keys.oneString)).toBe(true)
		expect(isInvalidated(queryClient, keys.oneOther)).toBe(false)
	})

	it('uses a single id from props', async () => {
		const queryClient = new QueryClient()
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => ['one'],
			getResource: () => 'posts',
			getId: () => undefined,
			getIds: () => undefined,
			queryClient,
		})
		const key = ['default', 'posts', 'getOne', 2, { meta: undefined }]
		seedQueries(queryClient, [key])

		await invalidate({ id: 2 })

		expect(isInvalidated(queryClient, key)).toBe(true)
	})

	it('passes an empty context to the resolve function when called without one', async () => {
		const queryClient = new QueryClient()
		const resolveInvalidates = vi.fn((): RuleOptions => ['list'])
		const invalidate = createInvalidator({
			getFetcherName: () => 'primary',
			getInvalidates: () => resolveInvalidates,
			getResource: () => 'posts',
			getId: () => undefined,
			getIds: () => undefined,
			queryClient,
		})

		await invalidate()

		expect(resolveInvalidates).toHaveBeenCalledWith({ ids: [], data: undefined })
	})

	it('falls back to call resource when an object rule omits it', async () => {
		const queryClient = new QueryClient()
		const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => undefined,
			getResource: () => 'posts',
			getId: () => undefined,
			getIds: () => undefined,
			queryClient,
		})

		await invalidate({ invalidates: [{ target: 'resource' }, { target: 'list', resource: undefined }] })

		expect(invalidateQueries.mock.calls.map(([filters]) => filters!.queryKey)).toEqual([
			['default', 'posts'],
			['default', 'posts', 'getList'],
			['default', 'posts', 'getInfiniteList'],
		])
	})

	it('treats string and number ids as the same id', async () => {
		const queryClient = new QueryClient()
		const resolveInvalidates = vi.fn((): RuleOptions => [])
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => resolveInvalidates,
			getResource: () => 'posts',
			getId: () => undefined,
			getIds: () => undefined,
			queryClient,
		})

		await invalidate({ ids: ['1', 1, 2] })

		expect(resolveInvalidates).toHaveBeenCalledWith({ ids: ['1', 2], data: undefined })
	})

	it('skips object one and many rules with empty ids', async () => {
		const queryClient = new QueryClient()
		const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => undefined,
			getResource: () => 'posts',
			getId: () => undefined,
			getIds: () => undefined,
			queryClient,
		})
		const emptyManyKey = ['default', 'posts', 'getMany', [], { meta: undefined }]
		seedQueries(queryClient, [emptyManyKey])

		await invalidate({ invalidates: [{ target: 'one', ids: [] }, { target: 'many', ids: [] }] })

		expect(invalidateQueries).not.toHaveBeenCalled()
		expect(isInvalidated(queryClient, emptyManyKey)).toBe(false)
	})

	it('rejects malformed invalidates with a descriptive error', async () => {
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => undefined,
			getResource: () => 'posts',
			getId: () => undefined,
			getIds: () => undefined,
			queryClient: new QueryClient(),
		})

		await expect(invalidate({ invalidates: { filters: { type: 'all' } } as any })).rejects.toThrow('`invalidates` must be an array of rules')
		await expect(invalidate({ invalidates: 'list' as any })).rejects.toThrow('`invalidates` must be an array of rules')
		await expect(invalidate({ invalidates: (async () => ['list']) as any })).rejects.toThrow('The `invalidates` callback must return')
		await expect(invalidate({ invalidates: (() => undefined) as any })).rejects.toThrow('The `invalidates` callback must return')
	})

	it('collects the id of a single result record', async () => {
		const queryClient = new QueryClient()
		const resolveInvalidates = vi.fn((_context: { ids: unknown[] }): RuleOptions => [])
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => resolveInvalidates,
			getResource: () => 'posts',
			getId: () => undefined,
			getIds: () => undefined,
			queryClient,
		})

		await invalidate({ id: '1' }, { data: { data: { id: 1 } } })
		await invalidate({}, { data: { data: { count: 2 } } })

		expect(resolveInvalidates.mock.calls.map(([context]) => context.ids)).toEqual([[1], []])
	})

	it('merges id and ids from props', async () => {
		const queryClient = new QueryClient()
		const resolveInvalidates = vi.fn((): RuleOptions => [])
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => resolveInvalidates,
			getResource: () => 'posts',
			getId: () => undefined,
			getIds: () => undefined,
			queryClient,
		})

		await invalidate({ ids: [2, 3], id: 1 })

		expect(resolveInvalidates).toHaveBeenCalledWith({ ids: [2, 3, 1], data: undefined })
	})

	it('uses hook-level id and ids as defaults that call props override', async () => {
		const queryClient = new QueryClient()
		const resolveInvalidates = vi.fn((_context: { ids: unknown[] }): RuleOptions => [])
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => resolveInvalidates,
			getResource: () => 'posts',
			getId: () => 1,
			getIds: () => [2, 3],
			queryClient,
		})

		await invalidate()
		await invalidate({ id: 9 })
		await invalidate({ ids: [7] })

		expect(resolveInvalidates.mock.calls.map(([context]) => context.ids)).toEqual([
			[2, 3, 1],
			[2, 3, 9],
			[7, 1],
		])
	})

	it('validates required props when executed', async () => {
		const queryClient = new QueryClient()
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => undefined,
			getResource: () => undefined,
			getId: () => undefined,
			getIds: () => undefined,
			queryClient,
		})

		await expect(invalidate({})).rejects.toThrow('`invalidates` is required')
		await expect(invalidate({ invalidates: ['list'] })).rejects.toThrow('`resource` is required')
	})
})
