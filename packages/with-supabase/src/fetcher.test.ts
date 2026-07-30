import { describe, expect, it, vi } from 'vitest'
import { createFetcher } from './fetcher'

function createQuery(response: Record<string, any>) {
	const query: Record<string, any> = {
		abortSignal: vi.fn(() => query),
		eq: vi.fn(() => query),
		in: vi.fn(() => query),
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
})
