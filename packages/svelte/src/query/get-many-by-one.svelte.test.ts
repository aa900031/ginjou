import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGetManyByOne } from './get-many-by-one.svelte'

const mocks = vi.hoisted(() => ({
	createCombineFn: vi.fn(),
	createQueries: vi.fn(),
	resolveQueryProps: vi.fn(),
	useFetchersContext: vi.fn(),
	useQueryClientContext: vi.fn(),
}))

vi.mock('@ginjou/core', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@ginjou/core')>()

	return {
		...actual,
		GetManyByOne: {
			...actual.GetManyByOne,
			createCombineFn: mocks.createCombineFn,
			resolveQueryProps: mocks.resolveQueryProps,
		},
	}
})

vi.mock('@tanstack/svelte-query', () => ({
	createQueries: mocks.createQueries,
}))

vi.mock('./fetchers', () => ({
	useFetchersContext: mocks.useFetchersContext,
}))

vi.mock('./query-client', () => ({
	useQueryClientContext: mocks.useQueryClientContext,
}))

describe('useGetManyByOne', () => {
	beforeEach(() => {
		mocks.createCombineFn.mockReset()
		mocks.createQueries.mockReset()
		mocks.resolveQueryProps.mockReset()
		mocks.useFetchersContext.mockReset()
		mocks.useQueryClientContext.mockReset()

		mocks.createCombineFn.mockReturnValue(vi.fn())
		mocks.createQueries.mockReturnValue({
			data: {
				data: [{ id: '1' }, { id: '2' }],
			},
		})
		mocks.resolveQueryProps.mockReturnValue({
			ids: ['1', '2'],
			resource: 'posts',
			fetcherName: 'default',
		})
		mocks.useFetchersContext.mockReturnValue({
			default: {},
		})
		mocks.useQueryClientContext.mockReturnValue({
			name: 'query-client',
		})
	})

	it('should expose records accessor, wire createQueries options, and forward static metadata', async () => {
		const queryOptions = vi.fn()
		const getOne = vi.fn().mockResolvedValue({ data: { id: '1' } })
		mocks.useFetchersContext.mockReturnValue({
			default: { getOne },
		})

		const result = useGetManyByOne({
			ids: ['1', '2'],
			resource: 'posts',
			meta: {
				scope: 'admin',
			},
			queryOptions,
		} as any)

		const createQueriesOptions = mocks.createQueries.mock.calls[0][0]()
		const getQueryClient = mocks.createQueries.mock.calls[0][1]

		expect(result.records).toEqual([{ id: '1' }, { id: '2' }])
		expect(mocks.resolveQueryProps).toHaveBeenCalledWith({
			ids: ['1', '2'],
			resource: 'posts',
			fetcherName: undefined,
		})
		expect(createQueriesOptions.queries).toHaveLength(2)
		expect(createQueriesOptions.combine).toBe(mocks.createCombineFn.mock.results[0]?.value)
		expect(getQueryClient()).toEqual({
			name: 'query-client',
		})

		await createQueriesOptions.queries[0].queryFn({})

		expect(getOne).toHaveBeenCalledWith({
			id: '1',
			resource: 'posts',
			fetcherName: 'default',
			meta: {
				scope: 'admin',
			},
		}, expect.any(Object))
	})

	it('should generate distinct metadata for each query and fetcher', async () => {
		const getOne = vi.fn().mockResolvedValue({ data: { id: '1' } })
		const meta = vi.fn(({ id, index }) => ({ id, index }))
		mocks.useFetchersContext.mockReturnValue({
			default: { getOne },
		})

		useGetManyByOne({
			ids: ['1', '2'],
			resource: 'posts',
			meta,
		} as any)

		const queries = mocks.createQueries.mock.calls[0][0]().queries as {
			queryFn: (context: object) => Promise<unknown>
			queryKey: unknown[]
		}[]
		await Promise.all(queries.map(query => query.queryFn({})))

		expect(meta).toHaveBeenNthCalledWith(1, { id: '1', index: 0 })
		expect(meta).toHaveBeenNthCalledWith(2, { id: '2', index: 1 })
		expect(queries.map(query => query.queryKey[query.queryKey.length - 1])).toEqual([
			{ meta: { id: '1', index: 0 } },
			{ meta: { id: '2', index: 1 } },
		])
		expect(getOne).toHaveBeenNthCalledWith(1, {
			id: '1',
			resource: 'posts',
			fetcherName: 'default',
			meta: { id: '1', index: 0 },
		}, expect.any(Object))
		expect(getOne).toHaveBeenNthCalledWith(2, {
			id: '2',
			resource: 'posts',
			fetcherName: 'default',
			meta: { id: '2', index: 1 },
		}, expect.any(Object))
	})
})
