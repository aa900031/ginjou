import type { Fetchers } from './fetchers'
import { QueryClient } from '@tanstack/query-core'
import { describe, expect, it, vi } from 'vitest'
import { createMutationContext } from '../../test/tanstack-utils'
import { NotificationType } from '../notification'
import {
	createErrorHandler,
	createMutateAsyncFn,
	createMutateFn,
	createMutateHandler,
	createMutationFn,
	createSuccessHandler,
} from './delete-many'
import { MutationMode } from './mutation-mode'

const mockDeleteManyResult = { data: [{ id: 1 }, { id: 2 }] }
const mockDeleteMany = vi.fn(() => Promise.resolve(mockDeleteManyResult))
const mockDeleteOne = vi.fn((props: any) => Promise.resolve({ data: { id: props.id } }))

const mockFetchersWithDeleteMany: Fetchers = {
	default: {
		deleteMany: mockDeleteMany,
	},
}

const mockFetchersWithDeleteOne: Fetchers = {
	default: {
		deleteOne: mockDeleteOne,
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
	it('should call deleteMany when it exists and return the result', async () => {
		mockDeleteMany.mockClear()

		const mutationFn = createMutationFn({
			fetchers: mockFetchersWithDeleteMany,
			notify: vi.fn(),
			translate: vi.fn(key => key),
			getProps: () => undefined,
		})

		const result = await mutationFn(
			{ resource: 'posts', ids: [1, 2], mutationMode: MutationMode.Pessimistic },
			createMutationContext(),
		)

		expect(mockDeleteMany).toHaveBeenCalledOnce()
		expect(result).toEqual(mockDeleteManyResult)
	})

	it('should fall back to deleteOne for each id when deleteMany does not exist', async () => {
		mockDeleteOne.mockClear()

		const mutationFn = createMutationFn({
			fetchers: mockFetchersWithDeleteOne,
			notify: vi.fn(),
			translate: vi.fn(key => key),
			getProps: () => undefined,
		})

		await mutationFn(
			{ resource: 'posts', ids: [1, 2], mutationMode: MutationMode.Pessimistic },
			createMutationContext(),
		)

		expect(mockDeleteOne).toHaveBeenCalledTimes(2)
	})

	it('should throw if resource is missing', async () => {
		const mutationFn = createMutationFn({
			fetchers: mockFetchersWithDeleteMany,
			notify: vi.fn(),
			translate: vi.fn(key => key),
			getProps: () => undefined,
		})

		await expect(mutationFn({ ids: [1] } as any, createMutationContext())).rejects.toThrow()
	})

	it('should throw if ids is missing', async () => {
		const mutationFn = createMutationFn({
			fetchers: mockFetchersWithDeleteMany,
			notify: vi.fn(),
			translate: vi.fn(key => key),
			getProps: () => undefined,
		})

		await expect(mutationFn({ resource: 'posts' } as any, createMutationContext())).rejects.toThrow()
	})

	it('should show progress notification in undoable mode', async () => {
		mockDeleteMany.mockClear()
		const mockNotify = vi.fn()

		const mutationFn = createMutationFn({
			fetchers: mockFetchersWithDeleteMany,
			notify: mockNotify,
			translate: vi.fn(key => key),
			getProps: () => undefined,
		})

		const promise = mutationFn(
			{ resource: 'posts', ids: [1], mutationMode: MutationMode.Undoable },
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
			{ resource: 'posts', ids: [1, 2], mutationMode: MutationMode.Pessimistic },
			createMutationContext(),
		)

		expect(result).toBeDefined()
		expect(result).toHaveProperty('previousQueries')
		expect(Array.isArray(result?.previousQueries)).toBe(true)
	})

	it('should merge extra properties from onMutate callback with previousQueries', async () => {
		const queryClient = createQueryClient()
		const extraData = { batchId: 'batch-123' }
		const onMutate = vi.fn().mockResolvedValue(extraData)

		const handler = createMutateHandler({
			queryClient,
			notify: vi.fn(),
			translate: vi.fn(key => key),
			getProps: () => undefined,
			onMutate,
		})

		const result = await handler(
			{ resource: 'posts', ids: [1, 2], mutationMode: MutationMode.Pessimistic },
			createMutationContext(),
		)

		expect(result).toHaveProperty('previousQueries')
		expect(result).toHaveProperty('batchId', 'batch-123')
	})

	it('should call onMutate with resolved props', async () => {
		const queryClient = createQueryClient()
		const onMutate = vi.fn().mockResolvedValue(undefined)

		const handler = createMutateHandler({
			queryClient,
			notify: vi.fn(),
			translate: vi.fn(key => key),
			getProps: () => ({ resource: 'comments', ids: [10, 20] }),
			onMutate,
		})

		await handler(
			{ mutationMode: MutationMode.Pessimistic },
			createMutationContext(),
		)

		expect(onMutate).toHaveBeenCalledOnce()
		const [resolvedProps] = onMutate.mock.calls[0]
		expect(resolvedProps.resource).toBe('comments')
		expect(resolvedProps.ids).toEqual([10, 20])
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
			{ resource: 'posts', ids: [1, 2], mutationMode: MutationMode.Optimistic },
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
			{ resource: 'posts', ids: [1, 2], mutationMode: MutationMode.Undoable },
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
			{ resource: 'posts', ids: [1, 2], mutationMode: MutationMode.Pessimistic },
			createMutationContext(),
		)

		expect(setQueriesDataSpy).not.toHaveBeenCalled()
	})

	it('should always include previousQueries even when onMutate returns undefined (regression)', async () => {
		// Regression test for the SetReturnType fix: onMutate allowed to return undefined
		const queryClient = createQueryClient()
		const onMutate = vi.fn(async () => undefined)

		const handler = createMutateHandler({
			queryClient,
			notify: vi.fn(),
			translate: vi.fn(key => key),
			getProps: () => undefined,
			onMutate,
		})

		const result = await handler(
			{ resource: 'posts', ids: [1], mutationMode: MutationMode.Pessimistic },
			createMutationContext(),
		)

		// Spread of undefined is safe, previousQueries must always be present
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

		const data = { data: [{ id: 1 }, { id: 2 }] }
		await handler(data as any, { resource: 'posts', ids: [1, 2] } as any, { previousQueries: [] } as any, createMutationContext())

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
			{ data: [{ id: 1 }] } as any,
			{ resource: 'posts', ids: [1], mutationMode: MutationMode.Pessimistic } as any,
			{ previousQueries: [] } as any,
			createMutationContext(),
		)

		expect(mockNotify).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({ type: NotificationType.Success }),
		)
	})

	it('should publish a realtime delete event', async () => {
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
			{ data: [{ id: 1 }] } as any,
			{ resource: 'posts', ids: [1], mutationMode: MutationMode.Pessimistic } as any,
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
		const previousData = [{ id: 1 }]
		const previousQueryKey = ['posts']

		const handler = createErrorHandler({
			queryClient,
			notify: vi.fn(),
			translate: vi.fn(key => key),
			checkError: vi.fn().mockResolvedValue({}),
			getProps: () => undefined,
			onError: undefined,
		})

		await handler(
			new Error('delete many failed'),
			{ resource: 'posts', ids: [1] } as any,
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
			new Error('bulk delete error'),
			{ resource: 'posts', ids: [1, 2] } as any,
			{ previousQueries: [] } as any,
			createMutationContext(),
		)

		expect(mockNotify).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({ type: NotificationType.Error }),
		)
	})

	it('should call onError prop if defined', async () => {
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

		const error = new Error('test')
		await handler(
			error,
			{ resource: 'posts', ids: [1] } as any,
			{ previousQueries: [] } as any,
			createMutationContext(),
		)

		expect(mockOnError).toHaveBeenCalledOnce()
		expect(mockOnError.mock.calls[0][0]).toBe(error)
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

		const error = new Error('unauthorized')
		await handler(
			error,
			{ resource: 'posts', ids: [1] } as any,
			{ previousQueries: [] } as any,
			createMutationContext(),
		)

		expect(mockCheckError).toHaveBeenCalledWith(error)
	})
})

describe('createMutateFn', () => {
	it('should call originFn with provided variables', () => {
		const mockOriginFn = vi.fn()
		const mutateFn = createMutateFn({ originFn: mockOriginFn })
		const variables = { resource: 'posts', ids: [1, 2] }

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
		const mockOriginFn = vi.fn().mockResolvedValue({ data: [{ id: 1 }] })
		const mutateAsyncFn = createMutateAsyncFn({ originFn: mockOriginFn })
		const variables = { resource: 'posts', ids: [1] }

		await mutateAsyncFn(variables, undefined)

		expect(mockOriginFn).toHaveBeenCalledWith(variables, undefined)
	})

	it('should call originFn with empty object when variables are undefined', async () => {
		const mockOriginFn = vi.fn().mockResolvedValue({ data: [] })
		const mutateAsyncFn = createMutateAsyncFn({ originFn: mockOriginFn })

		await mutateAsyncFn(undefined, undefined)

		expect(mockOriginFn).toHaveBeenCalledWith({}, undefined)
	})
})
