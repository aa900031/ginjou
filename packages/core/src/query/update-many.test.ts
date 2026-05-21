import { QueryClient } from '@tanstack/query-core'
import { describe, expect, it, vi } from 'vitest'
import { AbortDefer } from '../utils/defer'
import { createQueryKey as createGetListQueryKey } from './get-list'
import { createQueryKey as createGetManyQueryKey } from './get-many'
import { createQueryKey as createGetOneQueryKey } from './get-one'
import { MutationMode } from './mutation-mode'
import { createErrorHandler, createMutateAsyncFn, createMutateFn, createMutateHandler, createMutationFn, createSettledHandler, createSuccessHandler } from './update-many'

function seedPostQueries(queryClient: QueryClient) {
	const queryProps = {
		fetcherName: 'default',
		resource: 'posts',
	}
	const listKey = createGetListQueryKey({ props: queryProps as any })
	const manyKey = createGetManyQueryKey({ props: { ...queryProps, ids: [1, 2] } as any })
	const oneKey1 = createGetOneQueryKey({ props: { ...queryProps, id: 1 } as any })
	const oneKey2 = createGetOneQueryKey({ props: { ...queryProps, id: 2 } as any })

	queryClient.setQueryData(listKey, {
		data: [
			{ id: 1, title: 'Initial 1' },
			{ id: 2, title: 'Initial 2' },
		],
		total: 2,
	})
	queryClient.setQueryData(manyKey, {
		data: [
			{ id: 1, title: 'Initial 1' },
			{ id: 2, title: 'Initial 2' },
		],
	})
	queryClient.setQueryData(oneKey1, {
		data: { id: 1, title: 'Initial 1' },
	})
	queryClient.setQueryData(oneKey2, {
		data: { id: 2, title: 'Initial 2' },
	})

	return { listKey, manyKey, oneKey1, oneKey2 }
}

describe('createMutationFn (update-many)', () => {
	it('should call updateMany when the fetcher implements it', async () => {
		const updateMany = vi.fn(async (props: any) => ({
			data: props.ids.map((id: number) => ({
				id,
				...props.params,
			})),
		}))
		const mutationFn = createMutationFn({
			fetchers: {
				default: { updateMany },
			} as any,
			notify: vi.fn(),
			translate: vi.fn((key: string) => key),
			getProps: () => ({
				resource: 'posts',
				ids: [1],
				params: { status: 'draft' },
			}),
		})

		const result = await mutationFn({
			ids: [2, 3],
			params: { status: 'published' },
		} as any, {} as any)

		expect(updateMany).toHaveBeenCalledOnce()
		expect(updateMany.mock.calls[0]![0]).toMatchObject({
			resource: 'posts',
			ids: [2, 3],
			params: { status: 'published' },
			fetcherName: 'default',
			mutationMode: 'pessimistic',
		})
		expect(result).toEqual({
			data: [
				{ id: 2, status: 'published' },
				{ id: 3, status: 'published' },
			],
		})
	})

	it('should fall back to updateOne for each id when updateMany is missing', async () => {
		const updateOne = vi.fn(async (props: any) => ({
			data: {
				id: props.id,
				...props.params,
			},
		}))
		const mutationFn = createMutationFn({
			fetchers: {
				default: { updateOne },
			} as any,
			notify: vi.fn(),
			translate: vi.fn((key: string) => key),
			getProps: () => ({
				resource: 'posts',
				ids: [1],
				params: { status: 'draft' },
			}),
		})

		const result = await mutationFn({
			ids: [2, 3],
			params: { status: 'published' },
		} as any, {} as any)

		expect(updateOne).toHaveBeenCalledTimes(2)
		expect(updateOne.mock.calls[0]![0]).toMatchObject({
			resource: 'posts',
			id: 2,
			params: { status: 'published' },
			fetcherName: 'default',
		})
		expect(updateOne.mock.calls[1]![0]).toMatchObject({
			resource: 'posts',
			id: 3,
			params: { status: 'published' },
			fetcherName: 'default',
		})
		expect(result).toEqual({
			data: [
				{ id: 2, status: 'published' },
				{ id: 3, status: 'published' },
			],
		})
	})

	it('should throw when resource, ids, or params are missing', async () => {
		const mutationFn = createMutationFn({
			fetchers: {
				default: { updateMany: vi.fn() },
			} as any,
			notify: vi.fn(),
			translate: vi.fn((key: string) => key),
			getProps: () => undefined,
		})

		await expect(mutationFn({} as any, {} as any)).rejects.toThrow(
			'[@ginjou/core] Cannot update many records without required mutation props: resource, ids, and params.',
		)
	})
})

function createDeps(overrides?: {
	getProps?: () => any
	onMutate?: any
}) {
	const queryClient = new QueryClient()
	const notify = vi.fn()
	const translate = vi.fn((key: string) => key)
	const getProps = overrides?.getProps ?? (() => ({
		resource: 'posts',
		ids: [1, 2],
		params: { status: 'published' },
		fetcherName: 'default',
	}))
	const onMutate = overrides?.onMutate ?? vi.fn()

	return { queryClient, notify, translate, getProps, onMutate }
}

describe('createMutateHandler (update-many)', () => {
	it('returns a function', () => {
		const deps = createDeps()
		const handler = createMutateHandler(deps)
		expect(typeof handler).toBe('function')
	})

	describe('result always contains previousQueries', () => {
		it('includes previousQueries when onMutate returns undefined', async () => {
			const queryClient = new QueryClient()
			const mockOnMutate = vi.fn().mockResolvedValue(undefined)

			const handler = createMutateHandler({
				queryClient,
				notify: vi.fn(),
				translate: vi.fn((k: string) => k),
				getProps: () => undefined,
				onMutate: mockOnMutate,
			})

			const result = await handler(
				{ resource: 'posts', ids: [1, 2], params: { status: 'draft' } },
				{} as any,
			)

			expect(result).toHaveProperty('previousQueries')
			expect(Array.isArray(result.previousQueries)).toBe(true)
		})

		it('merges onMutate return value with previousQueries', async () => {
			const queryClient = new QueryClient()
			const extraData = { transactionId: 'abc123' }
			const mockOnMutate = vi.fn().mockResolvedValue(extraData)

			const handler = createMutateHandler({
				queryClient,
				notify: vi.fn(),
				translate: vi.fn((k: string) => k),
				getProps: () => undefined,
				onMutate: mockOnMutate,
			})

			const result = await handler(
				{ resource: 'posts', ids: [1, 2], params: { status: 'published' } },
				{} as any,
			)

			expect(result).toHaveProperty('previousQueries')
			expect(result).toHaveProperty('transactionId', 'abc123')
		})

		it('internal previousQueries overrides onMutate previousQueries field', async () => {
			const queryClient = new QueryClient()
			queryClient.setQueryData(['default', 'posts'], { data: [{ id: 1 }, { id: 2 }] })

			const mockOnMutate = vi.fn().mockResolvedValue({ previousQueries: [] })

			const handler = createMutateHandler({
				queryClient,
				notify: vi.fn(),
				translate: vi.fn((k: string) => k),
				getProps: () => undefined,
				onMutate: mockOnMutate,
			})

			const result = await handler(
				{ resource: 'posts', ids: [1, 2], params: { status: 'published' } },
				{} as any,
			)

			// spread order is { ...resultFromCallback, previousQueries } so internal value wins
			expect(result.previousQueries).not.toEqual([])
		})
	})

	describe('onMutate callback is called with resolved props', () => {
		it('calls onMutate with resolved mutation props including ids and params', async () => {
			const queryClient = new QueryClient()
			const mockOnMutate = vi.fn().mockResolvedValue(undefined)

			const handler = createMutateHandler({
				queryClient,
				notify: vi.fn(),
				translate: vi.fn((k: string) => k),
				getProps: () => ({ resource: 'comments', ids: [5, 6], params: { approved: true } }),
				onMutate: mockOnMutate,
			})

			await handler(
				{ resource: 'comments', ids: [5, 6], params: { approved: true } },
				{} as any,
			)

			expect(mockOnMutate).toHaveBeenCalledTimes(1)
			const calledWith = mockOnMutate.mock.calls[0][0]
			expect(calledWith.resource).toBe('comments')
			expect(calledWith.ids).toEqual([5, 6])
			expect(calledWith.params).toEqual({ approved: true })
		})

		it('call-time props override getProps', async () => {
			const queryClient = new QueryClient()
			const mockOnMutate = vi.fn().mockResolvedValue(undefined)

			const handler = createMutateHandler({
				queryClient,
				notify: vi.fn(),
				translate: vi.fn((k: string) => k),
				getProps: () => ({ resource: 'posts', ids: [1], params: { status: 'draft' } }),
				onMutate: mockOnMutate,
			})

			await handler(
				{ resource: 'posts', ids: [100, 200], params: { status: 'published' } },
				{} as any,
			)

			const calledWith = mockOnMutate.mock.calls[0][0]
			expect(calledWith.ids).toEqual([100, 200])
			expect(calledWith.params).toEqual({ status: 'published' })
		})
	})

	describe('pessimistic mode', () => {
		it('does not update cache in pessimistic mode (default)', async () => {
			const queryClient = new QueryClient()
			const setQueriesDataSpy = vi.spyOn(queryClient, 'setQueriesData')
			const mockOnMutate = vi.fn().mockResolvedValue(undefined)

			const handler = createMutateHandler({
				queryClient,
				notify: vi.fn(),
				translate: vi.fn((k: string) => k),
				getProps: () => undefined,
				onMutate: mockOnMutate,
			})

			await handler({
				resource: 'posts',
				ids: [1],
				params: { status: 'archived' },
				mutationMode: MutationMode.Pessimistic,
			}, {} as any)

			expect(setQueriesDataSpy).not.toHaveBeenCalled()
		})
	})

	describe('optimistic mode', () => {
		it('updates cache in optimistic mode', async () => {
			const queryClient = new QueryClient()
			const setQueriesDataSpy = vi.spyOn(queryClient, 'setQueriesData')
			const mockOnMutate = vi.fn().mockResolvedValue(undefined)

			const handler = createMutateHandler({
				queryClient,
				notify: vi.fn(),
				translate: vi.fn((k: string) => k),
				getProps: () => undefined,
				onMutate: mockOnMutate,
			})

			await handler({
				resource: 'posts',
				ids: [1, 2],
				params: { status: 'published' },
				mutationMode: MutationMode.Optimistic,
			}, {} as any)

			expect(setQueriesDataSpy).toHaveBeenCalled()
		})

		it('skips selected optimistic cache groups when optimisticUpdate entries are false', async () => {
			const queryClient = new QueryClient()
			const keys = seedPostQueries(queryClient)
			const handler = createMutateHandler({
				queryClient,
				notify: vi.fn(),
				translate: vi.fn((k: string) => k),
				getProps: () => undefined,
				onMutate: vi.fn(),
			})

			await handler({
				resource: 'posts',
				ids: [1, 2],
				params: { title: 'Updated' },
				mutationMode: MutationMode.Optimistic,
				optimisticUpdate: {
					list: false,
					many: false,
					one: false,
				},
			}, {} as any)

			expect(queryClient.getQueryData(keys.listKey)).toMatchObject({
				data: [{ id: 1, title: 'Initial 1' }, { id: 2, title: 'Initial 2' }],
			})
			expect(queryClient.getQueryData(keys.manyKey)).toMatchObject({
				data: [{ id: 1, title: 'Initial 1' }, { id: 2, title: 'Initial 2' }],
			})
			expect(queryClient.getQueryData(keys.oneKey1)).toMatchObject({
				data: { id: 1, title: 'Initial 1' },
			})
			expect(queryClient.getQueryData(keys.oneKey2)).toMatchObject({
				data: { id: 2, title: 'Initial 2' },
			})
		})

		it('uses custom optimisticUpdate functions', async () => {
			const queryClient = new QueryClient()
			const keys = seedPostQueries(queryClient)
			const list = vi.fn((previous: any, params: any, ids: any[]) => ({
				...previous,
				data: previous.data.map((record: any) => ids.includes(record.id)
					? { ...record, title: `list:${params.title}` }
					: record),
			}))
			const many = vi.fn((previous: any, params: any, ids: any[]) => ({
				...previous,
				data: previous.data.map((record: any) => ids.includes(record.id)
					? { ...record, title: `many:${params.title}` }
					: record),
			}))
			const one = vi.fn((previous: any, params: any, id: any) => ({
				...previous,
				data: {
					...previous.data,
					title: `one:${params.title}:${id}`,
				},
			}))
			const handler = createMutateHandler({
				queryClient,
				notify: vi.fn(),
				translate: vi.fn((k: string) => k),
				getProps: () => undefined,
				onMutate: vi.fn(),
			})

			await handler({
				resource: 'posts',
				ids: [1, 2],
				params: { title: 'Updated' },
				mutationMode: MutationMode.Optimistic,
				optimisticUpdate: {
					list,
					many,
					one,
				},
			}, {} as any)

			expect(list).toHaveBeenCalledWith(expect.anything(), { title: 'Updated' }, [1, 2])
			expect(many).toHaveBeenCalledWith(expect.anything(), { title: 'Updated' }, [1, 2])
			expect(one).toHaveBeenCalledTimes(2)
			expect(queryClient.getQueryData<any>(keys.listKey).data.map((record: any) => record.title)).toEqual(['list:Updated', 'list:Updated'])
			expect(queryClient.getQueryData<any>(keys.manyKey).data.map((record: any) => record.title)).toEqual(['many:Updated', 'many:Updated'])
			expect(queryClient.getQueryData<any>(keys.oneKey1).data.title).toBe('one:Updated:1')
			expect(queryClient.getQueryData<any>(keys.oneKey2).data.title).toBe('one:Updated:2')
		})
	})

	describe('undoable mode', () => {
		it('updates cache in undoable mode', async () => {
			const queryClient = new QueryClient()
			const setQueriesDataSpy = vi.spyOn(queryClient, 'setQueriesData')
			const mockOnMutate = vi.fn().mockResolvedValue(undefined)

			const handler = createMutateHandler({
				queryClient,
				notify: vi.fn(),
				translate: vi.fn((k: string) => k),
				getProps: () => undefined,
				onMutate: mockOnMutate,
			})

			await handler({
				resource: 'posts',
				ids: [1, 2],
				params: { status: 'published' },
				mutationMode: MutationMode.Undoable,
			}, {} as any)

			expect(setQueriesDataSpy).toHaveBeenCalled()
		})
	})

	describe('previousQueries collection', () => {
		it('collects previousQueries from cache before cancelling', async () => {
			const queryClient = new QueryClient()
			queryClient.setQueryData(['default', 'posts'], { data: [{ id: 1 }, { id: 2 }] })

			const mockOnMutate = vi.fn().mockResolvedValue(undefined)

			const handler = createMutateHandler({
				queryClient,
				notify: vi.fn(),
				translate: vi.fn((k: string) => k),
				getProps: () => undefined,
				onMutate: mockOnMutate,
			})

			const result = await handler(
				{ resource: 'posts', ids: [1, 2], params: { status: 'published' } },
				{} as any,
			)

			expect(result.previousQueries.length).toBeGreaterThan(0)
		})

		it('returns empty previousQueries when cache is empty', async () => {
			const queryClient = new QueryClient()
			const mockOnMutate = vi.fn().mockResolvedValue(undefined)

			const handler = createMutateHandler({
				queryClient,
				notify: vi.fn(),
				translate: vi.fn((k: string) => k),
				getProps: () => undefined,
				onMutate: mockOnMutate,
			})

			const result = await handler(
				{ resource: 'posts', ids: [1, 2], params: { status: 'published' } },
				{} as any,
			)

			expect(result.previousQueries).toEqual([])
		})
	})

	describe('onMutate returning undefined (new capability from PR)', () => {
		it('handles async onMutate returning undefined without crashing', async () => {
			const queryClient = new QueryClient()
			const mockOnMutate = vi.fn(async () => undefined)

			const handler = createMutateHandler({
				queryClient,
				notify: vi.fn(),
				translate: vi.fn((k: string) => k),
				getProps: () => undefined,
				onMutate: mockOnMutate,
			})

			await expect(
				handler(
					{ resource: 'posts', ids: [1], params: { status: 'published' } },
					{} as any,
				),
			).resolves.toHaveProperty('previousQueries')
		})

		it('handles async onMutate returning Promise<undefined> without crashing', async () => {
			const queryClient = new QueryClient()
			const mockOnMutate = vi.fn((): Promise<undefined> => Promise.resolve(undefined))

			const handler = createMutateHandler({
				queryClient,
				notify: vi.fn(),
				translate: vi.fn((k: string) => k),
				getProps: () => undefined,
				onMutate: mockOnMutate,
			})

			const result = await handler(
				{ resource: 'posts', ids: [1, 2], params: { title: 'Updated' } },
				{} as any,
			)

			expect(result).toHaveProperty('previousQueries')
		})

		it('result is a valid MutationContext shape when onMutate returns undefined', async () => {
			const queryClient = new QueryClient()
			queryClient.setQueryData(['default', 'posts'], [{ id: 1 }])

			const mockOnMutate = vi.fn().mockResolvedValue(undefined)

			const handler = createMutateHandler({
				queryClient,
				notify: vi.fn(),
				translate: vi.fn((k: string) => k),
				getProps: () => ({
					resource: 'posts',
					ids: [1, 2],
					params: { status: 'draft' },
					mutationMode: MutationMode.Pessimistic,
				}),
				onMutate: mockOnMutate,
			})

			const result = await handler(
				{ resource: 'posts', ids: [1, 2], params: { status: 'draft' } },
				{} as any,
			)

			// MutationContext shape requires previousQueries
			expect(result).toHaveProperty('previousQueries')
			expect(Array.isArray(result.previousQueries)).toBe(true)
		})
	})
})

describe('createSettledHandler (update-many)', () => {
	it('should trigger invalidates and call onSettled with resolved props', async () => {
		const queryClient = new QueryClient()
		const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
		const onSettled = vi.fn()
		const handler = createSettledHandler({
			queryClient,
			getProps: () => ({
				resource: 'posts',
				ids: [1],
				params: { status: 'draft' },
			}),
			onSettled,
		})

		await handler(
			{ data: [{ id: 1, status: 'published' }] } as any,
			null,
			{ ids: [2, 3], params: { status: 'published' } } as any,
			undefined as any,
			{} as any,
		)

		expect(invalidateQueries).toHaveBeenCalled()
		expect(onSettled).toHaveBeenCalledOnce()
		expect(onSettled.mock.calls[0]![2]).toMatchObject({
			resource: 'posts',
			ids: [2, 3],
			params: { status: 'published' },
			fetcherName: 'default',
		})
	})
})

describe('createSuccessHandler (update-many)', () => {
	it('should update cache, notify, publish, and call onSuccess in pessimistic mode', async () => {
		const queryClient = new QueryClient()
		const setQueriesData = vi.spyOn(queryClient, 'setQueriesData')
		const notify = vi.fn()
		const translate = vi.fn((key: string) => key)
		const publish = vi.fn()
		const onSuccess = vi.fn()
		const handler = createSuccessHandler({
			notify,
			translate,
			publish,
			queryClient,
			getProps: () => ({
				resource: 'posts',
				ids: [1],
				params: { status: 'draft' },
				meta: { locale: 'en' },
			}),
			onSuccess,
		})

		await handler({ data: [{ id: 2 }, { id: 3 }] } as any, {
			ids: [2, 3],
			params: { status: 'published' },
		} as any, undefined as any, {} as any)

		expect(setQueriesData).toHaveBeenCalled()
		expect(notify).toHaveBeenCalledOnce()
		expect(notify.mock.calls[0]![1]).toMatchObject({
			key: 'update-posts-notification',
			message: 'notifications.updateSuccess',
			description: 'notifications.success',
			type: 'success',
		})
		expect(publish).toHaveBeenCalledWith({
			channel: 'resources/posts',
			action: 'updated',
			payload: { ids: [2, 3] },
			meta: {
				locale: 'en',
				fetcherName: 'default',
			},
		})
		expect(onSuccess).toHaveBeenCalledOnce()
		expect(onSuccess.mock.calls[0]![1]).toMatchObject({
			resource: 'posts',
			ids: [2, 3],
			params: { status: 'published' },
			fetcherName: 'default',
		})
	})
})

describe('createErrorHandler (update-many)', () => {
	it('should restore previous queries, check error, notify, and call onError', async () => {
		const queryClient = new QueryClient()
		const setQueryData = vi.spyOn(queryClient, 'setQueryData')
		const checkError = vi.fn(async () => ({}))
		const notify = vi.fn()
		const translate = vi.fn((key: string) => key)
		const onError = vi.fn()
		const handler = createErrorHandler({
			queryClient,
			notify,
			translate,
			checkError,
			getProps: () => ({
				resource: 'posts',
				ids: [1],
				params: { status: 'draft' },
			}),
			onError,
		})
		const previousQueries = [[['default', 'posts'], { data: [{ id: 1 }] }]] as any
		const error = new Error('update many failed')

		await handler(error, {
			ids: [2, 3],
			params: { status: 'published' },
		} as any, { previousQueries }, {} as any)

		expect(setQueryData).toHaveBeenCalledWith(['default', 'posts'], { data: [{ id: 1 }] })
		expect(checkError).toHaveBeenCalledWith(error)
		expect(notify).toHaveBeenCalledOnce()
		expect(notify.mock.calls[0]![1]).toMatchObject({
			key: 'update-posts-notification',
			message: 'notifications.updateError',
			description: 'update many failed',
			type: 'error',
		})
		expect(onError).toHaveBeenCalledOnce()
		expect(onError.mock.calls[0]![1]).toMatchObject({
			resource: 'posts',
			ids: [2, 3],
			params: { status: 'published' },
			fetcherName: 'default',
		})
	})

	it('should skip checkError and notify for AbortDefer', async () => {
		const queryClient = new QueryClient()
		const checkError = vi.fn(async () => ({}))
		const notify = vi.fn()
		const onError = vi.fn()
		const handler = createErrorHandler({
			queryClient,
			notify,
			translate: vi.fn((key: string) => key),
			checkError,
			getProps: () => ({
				resource: 'posts',
				ids: [1],
				params: { status: 'draft' },
			}),
			onError,
		})

		await handler(new AbortDefer(), {
			ids: [1],
			params: { status: 'published' },
		} as any, undefined as any, {} as any)

		expect(checkError).not.toHaveBeenCalled()
		expect(notify).not.toHaveBeenCalled()
		expect(onError).toHaveBeenCalledOnce()
	})
})

describe('createMutateFn (update-many)', () => {
	it('should pass an empty object when variables are missing', () => {
		const originFn = vi.fn()
		const mutate = createMutateFn({ originFn })

		mutate()

		expect(originFn).toHaveBeenCalledWith({}, undefined)
	})
})

describe('createMutateAsyncFn (update-many)', () => {
	it('should pass an empty object when variables are missing', async () => {
		const originFn = vi.fn(async () => ({ data: [] }))
		const mutateAsync = createMutateAsyncFn({ originFn })

		await mutateAsync()

		expect(originFn).toHaveBeenCalledWith({}, undefined)
	})
})
