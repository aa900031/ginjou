import type { Fetchers } from './fetchers'
import { QueryClient } from '@tanstack/query-core'
import { describe, expect, it, vi } from 'vitest'
import { createMutationContext } from '../../test/tanstack-utils'
import { NotificationType } from '../notification'
import { MutationMode } from './mutation-mode'
import {
	createErrorHandler,
	createMutateAsyncFn,
	createMutateFn,
	createMutateHandler,
	createMutationFn,
	createSuccessHandler,
} from './update'

const mockUpdateOneResult = { data: { id: 1, status: 'published' } }
const mockUpdateOne = vi.fn(() => Promise.resolve(mockUpdateOneResult))
const mockFetchers: Fetchers = {
	default: {
		updateOne: mockUpdateOne,
	},
}

function createQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	})
}

describe('createMutationFn', () => {
	it('should call updateOne and return the result in pessimistic mode', async () => {
		mockUpdateOne.mockClear()

		const mutationFn = createMutationFn({
			fetchers: mockFetchers,
			notify: vi.fn(),
			translate: vi.fn(key => key),
			getProps: () => undefined,
		})

		const result = await mutationFn(
			{ resource: 'posts', id: 1, params: { status: 'published' }, mutationMode: MutationMode.Pessimistic },
			createMutationContext(),
		)

		expect(mockUpdateOne).toHaveBeenCalledOnce()
		expect(result).toEqual(mockUpdateOneResult)
	})

	it('should call updateOne and return the result in optimistic mode', async () => {
		mockUpdateOne.mockClear()

		const mutationFn = createMutationFn({
			fetchers: mockFetchers,
			notify: vi.fn(),
			translate: vi.fn(key => key),
			getProps: () => undefined,
		})

		const result = await mutationFn(
			{ resource: 'posts', id: 1, params: { status: 'published' }, mutationMode: MutationMode.Optimistic },
			createMutationContext(),
		)

		expect(mockUpdateOne).toHaveBeenCalledOnce()
		expect(result).toEqual(mockUpdateOneResult)
	})

	it('should throw if resource is missing', async () => {
		const mutationFn = createMutationFn({
			fetchers: mockFetchers,
			notify: vi.fn(),
			translate: vi.fn(key => key),
			getProps: () => undefined,
		})

		await expect(mutationFn({ id: 1, params: {} } as any, createMutationContext())).rejects.toThrow()
	})

	it('should throw if id is missing', async () => {
		const mutationFn = createMutationFn({
			fetchers: mockFetchers,
			notify: vi.fn(),
			translate: vi.fn(key => key),
			getProps: () => undefined,
		})

		await expect(mutationFn({ resource: 'posts', params: {} } as any, createMutationContext())).rejects.toThrow()
	})

	it('should throw if params is missing', async () => {
		const mutationFn = createMutationFn({
			fetchers: mockFetchers,
			notify: vi.fn(),
			translate: vi.fn(key => key),
			getProps: () => undefined,
		})

		await expect(mutationFn({ resource: 'posts', id: 1 } as any, createMutationContext())).rejects.toThrow()
	})

	it('should show progress notification in undoable mode', async () => {
		mockUpdateOne.mockClear()
		const mockNotify = vi.fn()

		const mutationFn = createMutationFn({
			fetchers: mockFetchers,
			notify: mockNotify,
			translate: vi.fn(key => key),
			getProps: () => undefined,
		})

		const promise = mutationFn(
			{ resource: 'posts', id: 1, params: { status: 'published' }, mutationMode: MutationMode.Undoable },
			createMutationContext(),
		)

		expect(mockNotify).toHaveBeenCalledOnce()

		await promise
	})
})

describe('createMutateHandler', () => {
	it('should return previousQueries in the result when onMutate returns undefined', async () => {
		const queryClient = createQueryClient()
		const onMutate = vi.fn().mockResolvedValue(undefined)

		const handler = createMutateHandler({
			queryClient,
			notify: vi.fn(),
			translate: vi.fn(key => key),
			getProps: () => undefined,
			onMutate,
		})

		const result = await handler(
			{ resource: 'posts', id: 1, params: { status: 'draft' }, mutationMode: MutationMode.Pessimistic },
			createMutationContext(),
		)

		expect(result).toBeDefined()
		expect(result).toHaveProperty('previousQueries')
		expect(Array.isArray(result?.previousQueries)).toBe(true)
	})

	it('should merge extra properties from onMutate callback with previousQueries', async () => {
		const queryClient = createQueryClient()
		const extraData = { rollbackVersion: 3 }
		const onMutate = vi.fn().mockResolvedValue(extraData)

		const handler = createMutateHandler({
			queryClient,
			notify: vi.fn(),
			translate: vi.fn(key => key),
			getProps: () => undefined,
			onMutate,
		})

		const result = await handler(
			{ resource: 'posts', id: 1, params: {}, mutationMode: MutationMode.Pessimistic },
			createMutationContext(),
		)

		expect(result).toHaveProperty('previousQueries')
		expect(result).toHaveProperty('rollbackVersion', 3)
	})

	it('should call onMutate with resolved props', async () => {
		const queryClient = createQueryClient()
		const onMutate = vi.fn().mockResolvedValue(undefined)

		const handler = createMutateHandler({
			queryClient,
			notify: vi.fn(),
			translate: vi.fn(key => key),
			getProps: () => ({ resource: 'articles', id: 99, params: { title: 'new' } }),
			onMutate,
		})

		await handler(
			{ mutationMode: MutationMode.Pessimistic },
			createMutationContext(),
		)

		expect(onMutate).toHaveBeenCalledOnce()
		const [resolvedProps] = onMutate.mock.calls[0]
		expect(resolvedProps.resource).toBe('articles')
		expect(resolvedProps.id).toBe(99)
	})

	it('should update cache in optimistic mode', async () => {
		const queryClient = createQueryClient()
		const setQueriesDataSpy = vi.spyOn(queryClient, 'setQueriesData')
		const onMutate = vi.fn().mockResolvedValue(undefined)

		const handler = createMutateHandler({
			queryClient,
			notify: vi.fn(),
			translate: vi.fn(key => key),
			getProps: () => undefined,
			onMutate,
		})

		await handler(
			{ resource: 'posts', id: 1, params: { status: 'published' }, mutationMode: MutationMode.Optimistic },
			createMutationContext(),
		)

		expect(setQueriesDataSpy).toHaveBeenCalled()
	})

	it('should update cache in undoable mode', async () => {
		const queryClient = createQueryClient()
		const setQueriesDataSpy = vi.spyOn(queryClient, 'setQueriesData')
		const onMutate = vi.fn().mockResolvedValue(undefined)

		const handler = createMutateHandler({
			queryClient,
			notify: vi.fn(),
			translate: vi.fn(key => key),
			getProps: () => undefined,
			onMutate,
		})

		await handler(
			{ resource: 'posts', id: 1, params: { status: 'published' }, mutationMode: MutationMode.Undoable },
			createMutationContext(),
		)

		expect(setQueriesDataSpy).toHaveBeenCalled()
	})

	it('should not update cache in pessimistic mode', async () => {
		const queryClient = createQueryClient()
		const setQueriesDataSpy = vi.spyOn(queryClient, 'setQueriesData')
		const onMutate = vi.fn().mockResolvedValue(undefined)

		const handler = createMutateHandler({
			queryClient,
			notify: vi.fn(),
			translate: vi.fn(key => key),
			getProps: () => undefined,
			onMutate,
		})

		await handler(
			{ resource: 'posts', id: 1, params: { status: 'published' }, mutationMode: MutationMode.Pessimistic },
			createMutationContext(),
		)

		expect(setQueriesDataSpy).not.toHaveBeenCalled()
	})

	it('should always include previousQueries even when onMutate returns undefined (regression)', async () => {
		// Regression test for SetReturnType fix: onMutate allowed to return undefined
		const queryClient = createQueryClient()
		const onMutate = vi.fn(async () => undefined) // explicitly returns undefined

		const handler = createMutateHandler({
			queryClient,
			notify: vi.fn(),
			translate: vi.fn(key => key),
			getProps: () => undefined,
			onMutate,
		})

		const result = await handler(
			{ resource: 'posts', id: 1, params: {}, mutationMode: MutationMode.Pessimistic },
			createMutationContext(),
		)

		// { ...undefined, previousQueries } must work without throwing
		expect(result).toMatchObject({ previousQueries: expect.any(Array) })
	})
})

describe('createSuccessHandler', () => {
	it('should call onSuccess from prop', async () => {
		const mockOnSuccess = vi.fn()
		const queryClient = createQueryClient()

		const handler = createSuccessHandler({
			notify: vi.fn(),
			translate: vi.fn(key => key),
			publish: vi.fn(),
			queryClient,
			getProps: () => undefined,
			onSuccess: mockOnSuccess,
		})

		await handler(
			{ data: { id: 1 } } as any,
			{ resource: 'posts', id: 1, params: {} } as any,
			{ previousQueries: [] } as any,
			createMutationContext(),
		)

		expect(mockOnSuccess).toHaveBeenCalledOnce()
	})

	it('should notify success in pessimistic mode', async () => {
		const mockNotify = vi.fn()
		const queryClient = createQueryClient()

		const handler = createSuccessHandler({
			notify: mockNotify,
			translate: vi.fn(key => key),
			publish: vi.fn(),
			queryClient,
			getProps: () => undefined,
			onSuccess: undefined,
		})

		await handler(
			{ data: { id: 1, status: 'published' } } as any,
			{ resource: 'posts', id: 1, params: {}, mutationMode: MutationMode.Pessimistic } as any,
			{ previousQueries: [] } as any,
			createMutationContext(),
		)

		expect(mockNotify).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({ type: NotificationType.Success }),
		)
	})

	it('should publish realtime update event', async () => {
		const mockPublish = vi.fn()
		const queryClient = createQueryClient()

		const handler = createSuccessHandler({
			notify: vi.fn(),
			translate: vi.fn(key => key),
			publish: mockPublish,
			queryClient,
			getProps: () => undefined,
			onSuccess: undefined,
		})

		await handler(
			{ data: { id: 1 } } as any,
			{ resource: 'posts', id: 1, params: {}, mutationMode: MutationMode.Pessimistic } as any,
			{ previousQueries: [] } as any,
			createMutationContext(),
		)

		expect(mockPublish).toHaveBeenCalledOnce()
		const [event] = mockPublish.mock.calls[0]
		expect(event.channel).toBe('resources/posts')
	})
})

describe('createErrorHandler', () => {
	it('should restore previous queries on error', async () => {
		const queryClient = createQueryClient()
		const setQueryDataSpy = vi.spyOn(queryClient, 'setQueryData')
		const previousData = { id: 1, title: 'old title' }
		const previousQueryKey = ['posts', 1]

		const handler = createErrorHandler({
			queryClient,
			notify: vi.fn(),
			translate: vi.fn(key => key),
			checkError: vi.fn().mockResolvedValue({}),
			getProps: () => undefined,
			onError: undefined,
		})

		await handler(
			new Error('update failed'),
			{ resource: 'posts', id: 1, params: {} } as any,
			{ previousQueries: [[previousQueryKey, previousData]] } as any,
			createMutationContext(),
		)

		expect(setQueryDataSpy).toHaveBeenCalledWith(previousQueryKey, previousData)
	})

	it('should notify error with correct type', async () => {
		const mockNotify = vi.fn()
		const queryClient = createQueryClient()

		const handler = createErrorHandler({
			queryClient,
			notify: mockNotify,
			translate: vi.fn(key => key),
			checkError: vi.fn().mockResolvedValue({}),
			getProps: () => undefined,
			onError: undefined,
		})

		await handler(
			new Error('server error'),
			{ resource: 'posts', id: 1, params: {} } as any,
			{ previousQueries: [] } as any,
			createMutationContext(),
		)

		expect(mockNotify).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({ type: NotificationType.Error }),
		)
	})

	it('should call checkError with the error', async () => {
		const mockCheckError = vi.fn().mockResolvedValue({})
		const queryClient = createQueryClient()

		const handler = createErrorHandler({
			queryClient,
			notify: vi.fn(),
			translate: vi.fn(key => key),
			checkError: mockCheckError,
			getProps: () => undefined,
			onError: undefined,
		})

		const error = new Error('forbidden')
		await handler(
			error,
			{ resource: 'posts', id: 1, params: {} } as any,
			{ previousQueries: [] } as any,
			createMutationContext(),
		)

		expect(mockCheckError).toHaveBeenCalledWith(error)
	})

	it('should call onError from prop', async () => {
		const mockOnError = vi.fn()
		const queryClient = createQueryClient()

		const handler = createErrorHandler({
			queryClient,
			notify: vi.fn(),
			translate: vi.fn(key => key),
			checkError: vi.fn().mockResolvedValue({}),
			getProps: () => undefined,
			onError: mockOnError,
		})

		const error = new Error('update error')
		await handler(
			error,
			{ resource: 'posts', id: 1, params: {} } as any,
			{ previousQueries: [] } as any,
			createMutationContext(),
		)

		expect(mockOnError).toHaveBeenCalledOnce()
		expect(mockOnError.mock.calls[0][0]).toBe(error)
	})
})

describe('createMutateFn', () => {
	it('should call originFn with provided variables', () => {
		const mockOriginFn = vi.fn()
		const mutateFn = createMutateFn({ originFn: mockOriginFn })
		const variables = { resource: 'posts', id: 1, params: { status: 'draft' } }

		mutateFn(variables, undefined)

		expect(mockOriginFn).toHaveBeenCalledWith(variables, undefined)
	})

	it('should call originFn with empty object when variables are undefined', () => {
		const mockOriginFn = vi.fn()
		const mutateFn = createMutateFn({ originFn: mockOriginFn })

		mutateFn(undefined, undefined)

		expect(mockOriginFn).toHaveBeenCalledWith({}, undefined)
	})
})

describe('createMutateAsyncFn', () => {
	it('should call originFn with provided variables', async () => {
		const mockOriginFn = vi.fn().mockResolvedValue({ data: { id: 1 } })
		const mutateAsyncFn = createMutateAsyncFn({ originFn: mockOriginFn })
		const variables = { resource: 'posts', id: 1, params: { status: 'draft' } }

		await mutateAsyncFn(variables, undefined)

		expect(mockOriginFn).toHaveBeenCalledWith(variables, undefined)
	})

	it('should call originFn with empty object when variables are undefined', async () => {
		const mockOriginFn = vi.fn().mockResolvedValue({ data: { id: 1 } })
		const mutateAsyncFn = createMutateAsyncFn({ originFn: mockOriginFn })

		await mutateAsyncFn(undefined, undefined)

		expect(mockOriginFn).toHaveBeenCalledWith({}, undefined)
	})
})
