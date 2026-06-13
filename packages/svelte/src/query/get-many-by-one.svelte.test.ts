import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGetManyByOne } from './get-many-by-one.svelte'

const mocks = vi.hoisted(() => ({
	createCombineFn: vi.fn(),
	createQueries: vi.fn(),
	getQueriesOptions: vi.fn(),
	resolveQueryProps: vi.fn(),
	useFetchersContext: vi.fn(),
	useQueryClientContext: vi.fn(),
}))

vi.mock('@ginjou/core', () => ({
	GetManyByOne: {
		createCombineFn: mocks.createCombineFn,
		getQueriesOptions: mocks.getQueriesOptions,
		resolveQueryProps: mocks.resolveQueryProps,
	},
}))

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
		mocks.getQueriesOptions.mockReset()
		mocks.resolveQueryProps.mockReset()
		mocks.useFetchersContext.mockReset()
		mocks.useQueryClientContext.mockReset()

		mocks.createCombineFn.mockReturnValue(vi.fn())
		mocks.createQueries.mockReturnValue({
			data: {
				data: [{ id: '1' }, { id: '2' }],
			},
		})
		mocks.getQueriesOptions.mockReturnValue([
			{
				queryKey: ['posts', '1'],
				enabled: true,
			},
			{
				queryKey: ['posts', '2'],
				enabled: true,
			},
		])
		mocks.resolveQueryProps.mockReturnValue({
			ids: ['1', '2'],
			resource: 'posts',
			meta: {
				scope: 'admin',
			},
			fetcherName: 'default',
		})
		mocks.useFetchersContext.mockReturnValue({
			default: {},
		})
		mocks.useQueryClientContext.mockReturnValue({
			name: 'query-client',
		})
	})

	it('should expose records accessor and wire createQueries options', () => {
		const queryOptions = vi.fn()

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
			meta: {
				scope: 'admin',
			},
			fetcherName: undefined,
		})
		expect(mocks.getQueriesOptions).toHaveBeenCalledWith({
			queryProps: {
				ids: ['1', '2'],
				resource: 'posts',
				meta: {
					scope: 'admin',
				},
				fetcherName: 'default',
			},
			fetchers: {
				default: {},
			},
			queryOptions,
			queryClient: {
				name: 'query-client',
			},
		})

		expect(createQueriesOptions.queries).toEqual([
			{
				queryKey: ['posts', '1'],
				enabled: true,
			},
			{
				queryKey: ['posts', '2'],
				enabled: true,
			},
		])
		expect(createQueriesOptions.combine).toBe(mocks.createCombineFn.mock.results[0]?.value)
		expect(getQueryClient()).toEqual({
			name: 'query-client',
		})
	})
})
