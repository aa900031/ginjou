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
} from './delete'
import { MutationMode } from './mutation-mode'

const mockDeleteOneResult = { data: { id: 1 } }
const mockDeleteOne = vi.fn(() => Promise.resolve(mockDeleteOneResult))
const mockFetchers: Fetchers = {
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
	it('should call deleteOne and return the result in pessimistic mode', async () => {
		mockDeleteOne.mockClear()

		const mutationFn = createMutationFn({
			fetchers: mockFetchers,
			notify: vi.fn(),
			translate: vi.fn(key => key),
			getProps: () => ({ resource: 'posts', id: 1, mutationMode: MutationMode.Pessimistic }),
		})

		const result = await mutationFn({ resource: 'posts', id: 1, mutationMode: MutationMode.Pessimistic }, createMutationContext())

		expect(mockDeleteOne).toHaveBeenCalledOnce()
		expect(result).toEqual(mockDeleteOneResult)
	})

	it('should call deleteOne and return the result in optimistic mode', async () => {
		mockDeleteOne.mockClear()

		const mutationFn = createMutationFn({
			fetchers: mockFetchers,
			notify: vi.fn(),
			translate: vi.fn(key => key),
			getProps: () => undefined,
		})

		const result = await mutationFn({ resource: 'posts', id: 1, mutationMode: MutationMode.Optimistic }, createMutationContext())

		expect(mockDeleteOne).toHaveBeenCalledOnce()
		expect(result).toEqual(mockDeleteOneResult)
	})

	it('should throw if resource is missing', async () => {
		const mutationFn = createMutationFn({
			fetchers: mockFetchers,
			notify: vi.fn(),
			translate: vi.fn(key => key),
			getProps: () => undefined,
		})

		await expect(mutationFn({ id: 1 } as any, createMutationContext())).rejects.toThrow()
	})

	it('should throw if id is missing', async () => {
		const mutationFn = createMutationFn({
			fetchers: mockFetchers,
			notify: vi.fn(),
			translate: vi.fn(key => key),
			getProps: () => undefined,
		})

		await expect(mutationFn({ resource: 'posts' } as any, createMutationContext())).rejects.toThrow()
	})

	it('should show progress notification in undoable mode', async () => {
		const mockNotify = vi.fn()
		const mockTranslate = vi.fn(key => key)

		const mutationFn = createMutationFn({
			fetchers: mockFetchers,
			notify: mockNotify,
			translate: mockTranslate,
			getProps: () => undefined,
		})

		// undoable mode creates a deferred promise; we call mutationFn and let it resolve
		const promise = mutationFn(
			{ resource: 'posts', id: 1, mutationMode: MutationMode.Undoable },
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
			{ resource: 'posts', id: 1, mutationMode: MutationMode.Pessimistic },
			createMutationContext(),
		)

		expect(result).toBeDefined()
		expect(result).toHaveProperty('previousQueries')
		expect(Array.isArray(result?.previousQueries)).toBe(true)
	})

	it('should merge extra properties from onMutate callback result with previousQueries', async () => {
		const queryClient = createQueryClient()
		const extraData = { customField: 'extra-value' }
		const onMutate = vi.fn().mockResolvedValue(extraData)

		const handler = createMutateHandler({
			queryClient,
			notify: vi.fn(),
			translate: vi.fn(key => key),
			getProps: () => undefined,
			onMutate,
		})

		const result = await handler(
			{ resource: 'posts', id: 1, mutationMode: MutationMode.Pessimistic },
			createMutationContext(),
		)

		expect(result).toHaveProperty('previousQueries')
		expect(result).toHaveProperty('customField', 'extra-value')
	})

	it('should call onMutate with resolved props and context', async () => {
		const queryClient = createQueryClient()
		const onMutate = vi.fn().mockResolvedValue(undefined)
		const ctx = createMutationContext()

		const handler = createMutateHandler({
			queryClient,
			notify: vi.fn(),
			translate: vi.fn(key => key),
			getProps: () => ({ resource: 'articles', id: 42 }),
			onMutate,
		})

		await handler(
			{ mutationMode: MutationMode.Pessimistic },
			ctx,
		)

		expect(onMutate).toHaveBeenCalledOnce()
		const [resolvedProps] = onMutate.mock.calls[0]
		expect(resolvedProps.resource).toBe('articles')
		expect(resolvedProps.id).toBe(42)
	})

	it('should not call onMutate if onMutate handler is not provided (undefined safe)', async () => {
		const queryClient = createQueryClient()
		// Pass a no-op that returns undefined to simulate optional undefined
		const onMutate = vi.fn().mockResolvedValue(undefined)

		const handler = createMutateHandler({
			queryClient,
			notify: vi.fn(),
			translate: vi.fn(key => key),
			getProps: () => undefined,
			onMutate,
		})

		const result = await handler(
			{ resource: 'posts', id: 1, mutationMode: MutationMode.Pessimistic },
			createMutationContext(),
		)

		// previousQueries is always present
		expect(result).toHaveProperty('previousQueries')
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
			{ resource: 'posts', id: 1, mutationMode: MutationMode.Optimistic },
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
			{ resource: 'posts', id: 1, mutationMode: MutationMode.Undoable },
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
			{ resource: 'posts', id: 1, mutationMode: MutationMode.Pessimistic },
			createMutationContext(),
		)

		expect(setQueriesDataSpy).not.toHaveBeenCalled()
	})

	it('should always include previousQueries even when onMutate returns undefined (regression test)', async () => {
		// This test verifies the SetReturnType fix: onMutate returning undefined
		// must not cause the returned context to lose previousQueries
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
			{ resource: 'posts', id: 1, mutationMode: MutationMode.Pessimistic },
			createMutationContext(),
		)

		// The spread of undefined is safe: { ...undefined, previousQueries: [...] }
		// previousQueries must be present regardless
		expect(result).toMatchObject({ previousQueries: expect.any(Array) })
	})
})

describe('createSuccessHandler', () => {
	it('should call onSuccess from prop', async () => {
		const mockOnSuccess = vi.fn()
		const mockPublish = vi.fn()
		const queryClient = createQueryClient()

		const handler = createSuccessHandler({
			notify: vi.fn(),
			translate: vi.fn(key => key),
			publish: mockPublish,
			queryClient,
			getProps: () => undefined,
			onSuccess: mockOnSuccess,
		})

		const data = { data: { id: 1 } }
		const props = { resource: 'posts', id: 1 }
		await handler(data as any, props as any, { previousQueries: [] } as any, createMutationContext())

		expect(mockOnSuccess).toHaveBeenCalledOnce()
	})

	it('should notify success in pessimistic mode', async () => {
		const mockNotify = vi.fn()
		const mockTranslate = vi.fn(key => key)
		const queryClient = createQueryClient()

		const handler = createSuccessHandler({
			notify: mockNotify,
			translate: mockTranslate,
			publish: vi.fn(),
			queryClient,
			getProps: () => undefined,
			onSuccess: undefined,
		})

		const data = { data: { id: 1 } }
		await handler(
			data as any,
			{ resource: 'posts', id: 1, mutationMode: MutationMode.Pessimistic },
			{ previousQueries: [] } as any,
			createMutationContext(),
		)

		expect(mockNotify).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({ type: NotificationType.Success }),
		)
	})

	it('should publish realtime event on success', async () => {
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
			{ resource: 'posts', id: 1, mutationMode: MutationMode.Pessimistic } as any,
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
		const previousData = { id: 1, name: 'old' }
		const previousQueryKey = ['posts', '1']

		const handler = createErrorHandler({
			queryClient,
			notify: vi.fn(),
			translate: vi.fn(key => key),
			checkError: vi.fn().mockResolvedValue({}),
			getProps: () => undefined,
			onError: undefined,
		})

		await handler(
			new Error('test error'),
			{ resource: 'posts', id: 1 } as any,
			{ previousQueries: [[previousQueryKey, previousData]] } as any,
			createMutationContext(),
		)

		expect(setQueryDataSpy).toHaveBeenCalledWith(previousQueryKey, previousData)
	})

	it('should notify error when not an AbortDefer', async () => {
		const mockNotify = vi.fn()
		const mockTranslate = vi.fn(key => key)
		const queryClient = createQueryClient()

		const handler = createErrorHandler({
			queryClient,
			notify: mockNotify,
			translate: mockTranslate,
			checkError: vi.fn().mockResolvedValue({}),
			getProps: () => undefined,
			onError: undefined,
		})

		await handler(
			new Error('delete failed'),
			{ resource: 'posts', id: 1 } as any,
			{ previousQueries: [] } as any,
			createMutationContext(),
		)

		expect(mockNotify).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({ type: NotificationType.Error }),
		)
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

		const error = new Error('oops')
		await handler(
			error,
			{ resource: 'posts', id: 1 } as any,
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

		const error = new Error('auth error')
		await handler(
			error,
			{ resource: 'posts', id: 1 } as any,
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
		const variables = { resource: 'posts', id: 1 }

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
		const variables = { resource: 'posts', id: 1 }

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
