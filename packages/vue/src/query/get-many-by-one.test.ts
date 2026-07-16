import type { Fetchers, GetOneFn, GetOneResult, RecordKey } from '@ginjou/core'
import { describe, expect, it, vi } from 'vitest'
import { ref, unref } from 'vue-demi'
import { MockFetchers, MockPosts, queryClient } from '../../test/mock-fetcher'
import { mountTestApp } from '../../test/mount'
import { useGetManyByOne } from './get-many-by-one'

describe('useGetManyByOne', () => {
	it('should fetch each record by id and combine records', async () => {
		const getOne = createGetOneMock()

		const { result } = mountTestApp(
			() => useGetManyByOne({
				resource: 'posts',
				ids: ['1', '2'],
			}),
			{
				queryClient,
				fetchers: createFetchers(getOne),
			},
		)

		await vi.waitFor(() => {
			expect(unref(result.isSuccess)).toBeTruthy()
		})

		expect(unref(result.records)).toEqual(MockPosts)
		expect(getOne).toHaveBeenCalledTimes(2)
		expect(getOne).toHaveBeenNthCalledWith(1, {
			resource: 'posts',
			id: '1',
			meta: undefined,
			fetcherName: 'default',
		}, expect.any(Object))
		expect(getOne).toHaveBeenNthCalledWith(2, {
			resource: 'posts',
			id: '2',
			meta: undefined,
			fetcherName: 'default',
		}, expect.any(Object))
	})

	it('should expose refetch and refetch each underlying query', async () => {
		const getOne = createGetOneMock()

		const { result } = mountTestApp(
			() => useGetManyByOne({
				resource: 'posts',
				ids: ['1', '2'],
			}),
			{
				queryClient,
				fetchers: createFetchers(getOne),
			},
		)

		await vi.waitFor(() => {
			expect(unref(result.isSuccess)).toBeTruthy()
		})

		expect(result.refetch).toEqual(expect.any(Function))
		await result.refetch()

		expect(getOne).toHaveBeenCalledTimes(4)
		expect(getOne).toHaveBeenNthCalledWith(3, {
			resource: 'posts',
			id: '1',
			meta: undefined,
			fetcherName: 'default',
		}, expect.any(Object))
		expect(getOne).toHaveBeenNthCalledWith(4, {
			resource: 'posts',
			id: '2',
			meta: undefined,
			fetcherName: 'default',
		}, expect.any(Object))
	})

	it('should react to ids changes', async () => {
		const getOne = createGetOneMock()
		const ids = ref(['1'])

		const { result } = mountTestApp(
			() => useGetManyByOne({
				resource: 'posts',
				ids,
			}),
			{
				queryClient,
				fetchers: createFetchers(getOne),
			},
		)

		await vi.waitFor(() => {
			expect(unref(result.records)).toEqual([MockPosts[0]])
		})

		ids.value = ['2']

		await vi.waitFor(() => {
			expect(unref(result.records)).toEqual([MockPosts[1]])
		})

		expect(getOne).toHaveBeenCalledTimes(2)
		expect(getOne).toHaveBeenLastCalledWith({
			resource: 'posts',
			id: '2',
			meta: undefined,
			fetcherName: 'default',
		}, expect.any(Object))
	})

	it('should return empty records when ids are empty', async () => {
		const getOne = createGetOneMock()

		const { result } = mountTestApp(
			() => useGetManyByOne({
				resource: 'posts',
				ids: [],
			}),
			{
				queryClient,
				fetchers: createFetchers(getOne),
			},
		)

		await vi.waitFor(() => {
			expect(unref(result.records)).toEqual([])
		})

		expect(unref(result.isSuccess)).toBeTruthy()
		expect(getOne).not.toHaveBeenCalled()
	})

	it('should not fetch if queryOptions.enabled is false', async () => {
		const getOne = createGetOneMock()

		const { result } = mountTestApp(
			() => useGetManyByOne({
				resource: 'posts',
				ids: ['1', '2'],
				queryOptions: {
					enabled: false,
				},
			}),
			{
				queryClient,
				fetchers: createFetchers(getOne),
			},
		)

		expect(unref(result.isFetched)).toBeFalsy()
		expect(unref(result.records)).toBeUndefined()
		expect(getOne).not.toHaveBeenCalled()
	})

	it('should support per-id queryOptions function', async () => {
		const queryOptions = vi.fn(({ id, index }: { id: RecordKey, index: number }) => ({
			select: (result: GetOneResult<typeof MockPosts[number]>) => ({
				data: {
					...result.data,
					title: `${index}:${id}:${result.data.title}`,
				},
			}),
		}))
		const getOne = createGetOneMock()

		const { result } = mountTestApp(
			() => useGetManyByOne({
				resource: 'posts',
				ids: ['1', '2'],
				queryOptions,
			}),
			{
				queryClient,
				fetchers: createFetchers(getOne),
			},
		)

		await vi.waitFor(() => {
			expect(unref(result.records)).toEqual([
				{
					...MockPosts[0],
					title: `0:1:${MockPosts[0]!.title}`,
				},
				{
					...MockPosts[1],
					title: `1:2:${MockPosts[1]!.title}`,
				},
			])
		})

		expect(queryOptions).toHaveBeenCalledWith({ id: '1', index: 0 })
		expect(queryOptions).toHaveBeenCalledWith({ id: '2', index: 1 })
		expect(getOne).toHaveBeenCalledTimes(2)
		expect(getOne).toHaveBeenNthCalledWith(1, {
			resource: 'posts',
			id: '1',
			meta: undefined,
			fetcherName: 'default',
		}, expect.any(Object))
		expect(getOne).toHaveBeenNthCalledWith(2, {
			resource: 'posts',
			id: '2',
			meta: undefined,
			fetcherName: 'default',
		}, expect.any(Object))
	})
})

function createFetchers(
	getOne: GetOneFn<typeof MockPosts[number]>,
): Fetchers {
	return {
		default: {
			...MockFetchers.default,
			getOne,
		},
	}
}

function createGetOneMock(): GetOneFn<typeof MockPosts[number]> {
	return vi.fn(async (props) => {
		const record = MockPosts.find(item => item.id === props.id)
		if (!record)
			throw new Error(`Missing mock post: ${props.id}`)

		return {
			data: record,
		}
	})
}
