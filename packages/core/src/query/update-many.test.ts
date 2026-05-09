import { QueryClient } from '@tanstack/query-core'
import { describe, expect, it, vi } from 'vitest'
import { MutationMode } from './mutation-mode'
import { createMutateHandler } from './update-many'

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
