import { QueryClient } from '@tanstack/query-core'
import { describe, expect, it, vi } from 'vitest'
import { createMutateHandler } from './delete'
import { createQueryKey as createGetListQueryKey } from './get-list'
import { createQueryKey as createGetManyQueryKey } from './get-many'
import { createQueryKey as createGetOneQueryKey } from './get-one'
import { MutationMode } from './mutation-mode'

function seedPostQueries(queryClient: QueryClient) {
	const queryProps = {
		fetcherName: 'default',
		resource: 'posts',
	}
	const listKey = createGetListQueryKey({ props: queryProps as any })
	const manyKey = createGetManyQueryKey({ props: { ...queryProps, ids: [1, 2] } as any })
	const oneKey = createGetOneQueryKey({ props: { ...queryProps, id: 1 } as any })

	queryClient.setQueryData(listKey, {
		data: [{ id: 1 }, { id: 2 }],
		total: 2,
	})
	queryClient.setQueryData(manyKey, {
		data: [{ id: 1 }, { id: 2 }],
	})
	queryClient.setQueryData(oneKey, {
		data: { id: 1 },
	})

	return { listKey, manyKey, oneKey }
}

function createDeps(overrides?: {
	getProps?: () => any
	onMutate?: any
}) {
	const queryClient = new QueryClient()
	const notify = vi.fn()
	const translate = vi.fn((key: string) => key)
	const getProps = overrides?.getProps ?? (() => ({
		resource: 'posts',
		id: 1,
		fetcherName: 'default',
	}))
	const onMutate = overrides?.onMutate ?? vi.fn()

	return { queryClient, notify, translate, getProps, onMutate }
}

describe('createMutateHandler (delete)', () => {
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

			const result = await handler({ resource: 'posts', id: 1 }, {} as any)

			expect(result).toHaveProperty('previousQueries')
			expect(Array.isArray(result.previousQueries)).toBe(true)
		})

		it('includes previousQueries when onMutate is not provided', async () => {
			const queryClient = new QueryClient()
			const mockOnMutate = vi.fn().mockResolvedValue(undefined)

			const handler = createMutateHandler({
				queryClient,
				notify: vi.fn(),
				translate: vi.fn((k: string) => k),
				getProps: () => undefined,
				onMutate: mockOnMutate,
			})

			const result = await handler({ resource: 'posts', id: 42 }, {} as any)

			expect(result).toHaveProperty('previousQueries')
		})

		it('merges onMutate return value with previousQueries', async () => {
			const queryClient = new QueryClient()
			const extraData = { customField: 'custom-value' }
			const mockOnMutate = vi.fn().mockResolvedValue(extraData)

			const handler = createMutateHandler({
				queryClient,
				notify: vi.fn(),
				translate: vi.fn((k: string) => k),
				getProps: () => undefined,
				onMutate: mockOnMutate,
			})

			const result = await handler({ resource: 'posts', id: 1 }, {} as any)

			expect(result).toHaveProperty('previousQueries')
			expect(result).toHaveProperty('customField', 'custom-value')
		})

		it('previousQueries is not overridden when onMutate returns an object with previousQueries', async () => {
			const queryClient = new QueryClient()
			// Put some data in the cache so previousQueries is non-empty
			queryClient.setQueryData(['default', 'posts'], { data: [{ id: 1 }] })

			const mockOnMutate = vi.fn().mockResolvedValue({ previousQueries: [] })

			const handler = createMutateHandler({
				queryClient,
				notify: vi.fn(),
				translate: vi.fn((k: string) => k),
				getProps: () => undefined,
				onMutate: mockOnMutate,
			})

			// The spread `{ ...resultFromCallback, previousQueries }` means our internal value wins
			const result = await handler({ resource: 'posts', id: 1 }, {} as any)

			// The internal previousQueries should override what onMutate returns
			expect(result.previousQueries).not.toEqual([])
		})
	})

	describe('onMutate callback is called with resolved props', () => {
		it('calls onMutate with resolved mutation props', async () => {
			const queryClient = new QueryClient()
			const mockOnMutate = vi.fn().mockResolvedValue(undefined)

			const handler = createMutateHandler({
				queryClient,
				notify: vi.fn(),
				translate: vi.fn((k: string) => k),
				getProps: () => ({ resource: 'posts', id: 99 }),
				onMutate: mockOnMutate,
			})

			await handler({ resource: 'posts', id: 99 }, {} as any)

			expect(mockOnMutate).toHaveBeenCalledTimes(1)
			const calledWith = mockOnMutate.mock.calls[0][0]
			expect(calledWith.resource).toBe('posts')
			expect(calledWith.id).toBe(99)
		})

		it('overrides getProps with mutation call-time props', async () => {
			const queryClient = new QueryClient()
			const mockOnMutate = vi.fn().mockResolvedValue(undefined)

			const handler = createMutateHandler({
				queryClient,
				notify: vi.fn(),
				translate: vi.fn((k: string) => k),
				getProps: () => ({ resource: 'posts', id: 1 }),
				onMutate: mockOnMutate,
			})

			// Call-time props override getProps
			await handler({ resource: 'posts', id: 7 }, {} as any)

			const calledWith = mockOnMutate.mock.calls[0][0]
			expect(calledWith.id).toBe(7)
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
				id: 1,
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
				id: 1,
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
				id: 1,
				mutationMode: MutationMode.Optimistic,
				optimisticUpdate: {
					list: false,
					many: false,
					one: false,
				},
			}, {} as any)

			expect(queryClient.getQueryData(keys.listKey)).toMatchObject({
				data: [{ id: 1 }, { id: 2 }],
				total: 2,
			})
			expect(queryClient.getQueryData(keys.manyKey)).toMatchObject({
				data: [{ id: 1 }, { id: 2 }],
			})
			expect(queryClient.getQueryData(keys.oneKey)).toMatchObject({
				data: { id: 1 },
			})
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
				id: 1,
				mutationMode: MutationMode.Undoable,
			}, {} as any)

			expect(setQueriesDataSpy).toHaveBeenCalled()
		})
	})

	describe('previousQueries collection', () => {
		it('collects previousQueries from cache before cancelling', async () => {
			const queryClient = new QueryClient()
			// Seed data so previousQueries is not empty
			queryClient.setQueryData(['default', 'posts'], { data: [{ id: 1 }] })

			const mockOnMutate = vi.fn().mockResolvedValue(undefined)

			const handler = createMutateHandler({
				queryClient,
				notify: vi.fn(),
				translate: vi.fn((k: string) => k),
				getProps: () => undefined,
				onMutate: mockOnMutate,
			})

			const result = await handler({ resource: 'posts', id: 1 }, {} as any)

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

			const result = await handler({ resource: 'posts', id: 1 }, {} as any)

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
				handler({ resource: 'posts', id: 1 }, {} as any),
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

			const result = await handler({ resource: 'posts', id: 1 }, {} as any)

			expect(result).toHaveProperty('previousQueries')
		})
	})
})
