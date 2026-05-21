import { QueryClient } from '@tanstack/query-core'
import { describe, expect, it, vi } from 'vitest'
import {
	createErrorHandler,
	createMutateAsyncFn,
	createMutateFn,
	createMutationFn,
	createSuccessHandler,
} from './create'

describe('createMutationFn', () => {
	it('should call createOne with resolved props', async () => {
		const createOne = vi.fn(async (props: any) => ({
			data: {
				id: 1,
				title: props.params.title,
			},
		}))
		const mutationFn = createMutationFn({
			fetchers: {
				default: {
					createOne,
				},
			} as any,
			getProps: () => ({
				resource: 'posts',
				params: { title: 'from-props' },
			}),
		})

		const result = await mutationFn({
			params: { title: 'from-call' },
		} as any, {} as any)

		expect(createOne).toHaveBeenCalledOnce()
		expect(createOne.mock.calls[0]![0]).toMatchObject({
			resource: 'posts',
			params: { title: 'from-call' },
			fetcherName: 'default',
		})
		expect(result).toEqual({
			data: {
				id: 1,
				title: 'from-call',
			},
		})
	})

	it('should throw when resource or params are missing', async () => {
		const mutationFn = createMutationFn({
			fetchers: {
				default: {
					createOne: vi.fn(),
				},
			} as any,
			getProps: () => undefined,
		})

		await expect(mutationFn({} as any, {} as any)).rejects.toThrow(
			'[@ginjou/core] Cannot create record without required mutation props: resource and params.',
		)
	})
})

describe('createSuccessHandler', () => {
	it('should notify, publish, invalidate, and call onSuccess with resolved props', async () => {
		const queryClient = new QueryClient()
		const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
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
				params: { title: 'from-props' },
				meta: { locale: 'en' },
			}),
			onSuccess,
		})
		const data = {
			data: {
				id: 1,
				title: 'Created',
			},
		}

		await handler(data as any, {
			params: { title: 'from-call' },
		} as any, undefined as any, {} as any)

		expect(notify).toHaveBeenCalledOnce()
		expect(notify.mock.calls[0]![1]).toMatchObject({
			key: 'create-posts-notification',
			message: 'notifications.createSuccess',
			description: 'notifications.success',
			type: 'success',
		})

		expect(invalidateQueries).toHaveBeenCalled()
		expect(publish).toHaveBeenCalledWith({
			channel: 'resources/posts',
			action: 'created',
			payload: { ids: [1] },
			meta: {
				locale: 'en',
				fetcherName: 'default',
			},
		})
		expect(onSuccess).toHaveBeenCalledOnce()
		expect(onSuccess.mock.calls[0]![1]).toMatchObject({
			resource: 'posts',
			params: { title: 'from-call' },
			fetcherName: 'default',
		})
	})
})

describe('createErrorHandler', () => {
	it('should check error, notify, and call onError with resolved props', async () => {
		const checkError = vi.fn(async () => ({}))
		const notify = vi.fn()
		const translate = vi.fn((key: string) => key)
		const onError = vi.fn()
		const handler = createErrorHandler({
			notify,
			translate,
			checkError,
			getProps: () => ({
				resource: 'posts',
				params: { title: 'from-props' },
			}),
			onError,
		})
		const error = new Error('create failed')

		await handler(error, {
			params: { title: 'from-call' },
		} as any, undefined as any, {} as any)

		expect(checkError).toHaveBeenCalledWith(error)
		expect(notify).toHaveBeenCalledOnce()
		expect(notify.mock.calls[0]![1]).toMatchObject({
			key: 'create-posts-notification',
			message: 'notifications.createError',
			description: 'create failed',
			type: 'error',
		})
		expect(onError).toHaveBeenCalledOnce()
		expect(onError.mock.calls[0]![1]).toMatchObject({
			resource: 'posts',
			params: { title: 'from-call' },
			fetcherName: 'default',
		})
	})
})

describe('createMutateFn', () => {
	it('should pass an empty object when variables are missing', () => {
		const originFn = vi.fn()
		const mutate = createMutateFn({
			originFn,
		})

		mutate()

		expect(originFn).toHaveBeenCalledWith({}, undefined)
	})
})

describe('createMutateAsyncFn', () => {
	it('should pass an empty object when variables are missing', async () => {
		const originFn = vi.fn(async () => ({ data: { id: 1 } }))
		const mutateAsync = createMutateAsyncFn({
			originFn,
		})

		await mutateAsync()

		expect(originFn).toHaveBeenCalledWith({}, undefined)
	})
})
