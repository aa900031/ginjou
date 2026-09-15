import { describe, expect, it, vi } from 'vitest'
import { createFetcher } from './fetcher'

function createQuery(response: Record<string, any>) {
	const query: Record<string, any> = {
		abortSignal: vi.fn(() => query),
		delete: vi.fn(() => query),
		eq: vi.fn(() => query),
		in: vi.fn(() => query),
		order: vi.fn(() => query),
		update: vi.fn(() => query),
		match: vi.fn(() => query),
		range: vi.fn(() => query),
		select: vi.fn(() => query),
		then: (resolve: (value: any) => any, reject: (reason: any) => any) =>
			Promise.resolve(response).then(resolve, reject),
	}

	return query
}

describe('createFetcher', () => {
	it('should forward query abort signals', async () => {
		const controller = new AbortController()
		const context = { signal: controller.signal } as any
		const listQuery = createQuery({ data: [], count: 0, error: null })
		const manyQuery = createQuery({ data: [], error: null })
		const oneQuery = createQuery({ data: [{ id: 1 }], error: null })
		const client = {
			from: vi.fn()
				.mockReturnValueOnce(listQuery)
				.mockReturnValueOnce(manyQuery)
				.mockReturnValueOnce(oneQuery),
		}
		const fetcher = createFetcher({ client: client as any })

		await fetcher.getList({ resource: 'posts' }, context)
		await fetcher.getMany({ resource: 'posts', ids: [1] }, context)
		await fetcher.getOne({ resource: 'posts', id: 1 }, context)

		expect(listQuery.abortSignal).toHaveBeenCalledWith(controller.signal)
		expect(manyQuery.abortSignal).toHaveBeenCalledWith(controller.signal)
		expect(oneQuery.abortSignal).toHaveBeenCalledWith(controller.signal)
	})

	it('should work without a query context', async () => {
		const query = createQuery({ data: [], count: 0, error: null })
		const fetcher = createFetcher({
			client: { from: vi.fn(() => query) } as any,
		})

		await expect(fetcher.getList({ resource: 'posts' })).resolves.toEqual({
			data: [],
			total: 0,
		})
		expect(query.abortSignal).not.toHaveBeenCalled()
	})

	describe('updateMany', () => {
		it('should update rows by id column and return the selected rows', async () => {
			const query = createQuery({ data: [{ id: 1 }, { id: 2 }], error: null })
			const fetcher = createFetcher({
				client: { from: vi.fn(() => query) } as any,
			})

			const result = await fetcher.updateMany({
				resource: 'posts',
				ids: [1, 2],
				params: { status: 'archived' },
				meta: { idColumnName: 'post_id', select: 'id,status' },
			})

			expect(query.update).toHaveBeenCalledWith({ status: 'archived' })
			expect(query.in).toHaveBeenCalledWith('post_id', [1, 2])
			expect(query.select).toHaveBeenCalledWith('id,status')
			expect(result).toEqual({ data: [{ id: 1 }, { id: 2 }] })
		})
	})

	describe('deleteMany', () => {
		it('should delete rows by id and throw on error', async () => {
			const query = createQuery({ data: [{ id: 1 }], error: null })
			const fetcher = createFetcher({
				client: { from: vi.fn(() => query) } as any,
			})

			await expect(fetcher.deleteMany({ resource: 'posts', ids: [1] })).resolves.toEqual({
				data: [{ id: 1 }],
			})
			expect(query.delete).toHaveBeenCalled()
			expect(query.in).toHaveBeenCalledWith('id', [1])
			expect(query.select).toHaveBeenCalledWith('*')

			const failing = createQuery({ data: null, error: new Error('nope') })
			const failingFetcher = createFetcher({
				client: { from: vi.fn(() => failing) } as any,
			})
			await expect(failingFetcher.deleteMany({ resource: 'posts', ids: [1] })).rejects.toThrow('nope')
		})
	})

	describe('custom', () => {
		it('should call a postgres function for rpc urls with filters, sorters and abort signal', async () => {
			const controller = new AbortController()
			const query = createQuery({ data: [{ id: 1 }], error: null })
			const client = {
				rpc: vi.fn(() => query),
				functions: { invoke: vi.fn() },
			}
			const fetcher = createFetcher({ client: client as any })

			const result = await fetcher.custom({
				url: 'rpc/search_posts',
				method: 'post',
				payload: { q: 'hello' },
				filters: [{ field: 'status', operator: 'eq', value: 'published' }],
				sorters: [{ field: 'title', order: 'asc' }],
			}, { signal: controller.signal } as any)

			expect(client.rpc).toHaveBeenCalledWith('search_posts', { q: 'hello' }, { get: false, head: false })
			expect(query.abortSignal).toHaveBeenCalledWith(controller.signal)
			expect(query.eq).toHaveBeenCalledWith('status', 'published')
			expect(query.order).toHaveBeenCalledWith('title', { ascending: true })
			expect(client.functions.invoke).not.toHaveBeenCalled()
			expect(result).toEqual({ data: [{ id: 1 }] })
		})

		it('should invoke an edge function for other urls', async () => {
			const client = {
				rpc: vi.fn(),
				functions: { invoke: vi.fn(async () => ({ data: { ok: true }, error: null })) },
			}
			const fetcher = createFetcher({ client: client as any })

			const result = await fetcher.custom({
				url: 'send-email',
				method: 'post',
				payload: { to: 'a@example.com' },
				query: { dry: 'true' },
				headers: { 'x-test': '1' },
			})

			expect(client.functions.invoke).toHaveBeenCalledWith('send-email?dry=true', {
				method: 'POST',
				body: { to: 'a@example.com' },
				headers: { 'x-test': '1' },
			})
			expect(client.rpc).not.toHaveBeenCalled()
			expect(result).toEqual({ data: { ok: true } })
		})
	})
})
