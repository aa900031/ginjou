import { QueryClient } from '@tanstack/query-core'
import { describe, expect, it, vi } from 'vitest'
import { AbortDefer } from '../utils/defer'
import {
	createErrorHandler,
	createMutateAsyncFn,
	createMutateFn,
	createMutationFn,
	createSettledHandler,
	createSuccessHandler,
} from './update'

describe('createMutationFn (update)', () => {
	it('should call updateOne with resolved props', async () => {
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
				id: 1,
				params: { title: 'from-props' },
			}),
		})

		const result = await mutationFn({
			id: 2,
			params: { title: 'from-call' },
		} as any, {} as any)

		expect(updateOne).toHaveBeenCalledOnce()
		expect(updateOne.mock.calls[0]![0]).toMatchObject({
			resource: 'posts',
			id: 2,
			params: { title: 'from-call' },
			fetcherName: 'default',
			mutationMode: 'pessimistic',
		})
		expect(result).toEqual({
			data: {
				id: 2,
				title: 'from-call',
			},
		})
	})

	it('should throw when resource, id, or params are missing', async () => {
		const mutationFn = createMutationFn({
			fetchers: {
				default: { updateOne: vi.fn() },
			} as any,
			notify: vi.fn(),
			translate: vi.fn((key: string) => key),
			getProps: () => undefined,
		})

		await expect(mutationFn({} as any, {} as any)).rejects.toThrow(
			'[@ginjou/core] Cannot update record without required mutation props: resource, id, and params.',
		)
	})
})

describe('createSettledHandler (update)', () => {
	it('should trigger invalidates and call onSettled with resolved props', async () => {
		const queryClient = new QueryClient()
		const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
		const onSettled = vi.fn()
		const handler = createSettledHandler({
			queryClient,
			getProps: () => ({
				resource: 'posts',
				id: 1,
				params: { title: 'from-props' },
			}),
			onSettled,
		})

		await handler(
			{ data: { id: 1, title: 'Updated' } } as any,
			null,
			{ id: 2, params: { title: 'from-call' } } as any,
			undefined as any,
			{} as any,
		)

		expect(invalidateQueries).toHaveBeenCalled()
		expect(onSettled).toHaveBeenCalledOnce()
		expect(onSettled.mock.calls[0]![2]).toMatchObject({
			resource: 'posts',
			id: 2,
			params: { title: 'from-call' },
			fetcherName: 'default',
		})
	})
})

describe('createSuccessHandler (update)', () => {
	it('should update cache, notify, publish, and call onSuccess in pessimistic mode', async () => {
		const queryClient = new QueryClient()
		const setQueriesData = vi.spyOn(queryClient, 'setQueriesData')
		const notify = vi.fn()
		const translate = vi.fn((key: string) => key)
		const publish = vi.fn()
		const onSuccess = vi.fn()
		const handler = createSuccessHandler({
			queryClient,
			notify,
			translate,
			publish,
			getProps: () => ({
				resource: 'posts',
				id: 1,
				params: { title: 'from-props' },
				meta: { locale: 'en' },
			}),
			onSuccess,
		})
		const data = { data: { id: 2, title: 'Updated' } }

		await handler(data as any, {
			id: 2,
			params: { title: 'from-call' },
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
			payload: { ids: [2] },
			meta: {
				locale: 'en',
				fetcherName: 'default',
			},
		})
		expect(onSuccess).toHaveBeenCalledOnce()
		expect(onSuccess.mock.calls[0]![1]).toMatchObject({
			resource: 'posts',
			id: 2,
			params: { title: 'from-call' },
			fetcherName: 'default',
		})
	})
})

describe('createErrorHandler (update)', () => {
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
				id: 1,
				params: { title: 'from-props' },
			}),
			onError,
		})
		const error = new Error('update failed')
		const previousQueries = [[['default', 'posts'], { data: [{ id: 1 }] }]] as any

		await handler(error, {
			id: 2,
			params: { title: 'from-call' },
		} as any, { previousQueries }, {} as any)

		expect(setQueryData).toHaveBeenCalledWith(['default', 'posts'], { data: [{ id: 1 }] })
		expect(checkError).toHaveBeenCalledWith(error)
		expect(notify).toHaveBeenCalledOnce()
		expect(notify.mock.calls[0]![1]).toMatchObject({
			key: 'update-posts-notification',
			message: 'notifications.updateError',
			description: 'update failed',
			type: 'error',
		})
		expect(onError).toHaveBeenCalledOnce()
		expect(onError.mock.calls[0]![1]).toMatchObject({
			resource: 'posts',
			id: 2,
			params: { title: 'from-call' },
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
				id: 1,
				params: { title: 'from-props' },
			}),
			onError,
		})

		await handler(new AbortDefer(), {
			id: 1,
			params: { title: 'from-call' },
		} as any, undefined as any, {} as any)

		expect(checkError).not.toHaveBeenCalled()
		expect(notify).not.toHaveBeenCalled()
		expect(onError).toHaveBeenCalledOnce()
	})
})

describe('createMutateFn (update)', () => {
	it('should pass an empty object when variables are missing', () => {
		const originFn = vi.fn()
		const mutate = createMutateFn({ originFn })

		mutate()

		expect(originFn).toHaveBeenCalledWith({}, undefined)
	})
})

describe('createMutateAsyncFn (update)', () => {
	it('should pass an empty object when variables are missing', async () => {
		const originFn = vi.fn(async () => ({ data: { id: 1 } }))
		const mutateAsync = createMutateAsyncFn({ originFn })

		await mutateAsync()

		expect(originFn).toHaveBeenCalledWith({}, undefined)
	})
})
