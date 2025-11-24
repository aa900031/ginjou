import * as sdk from '@directus/sdk'
import { SortOrder } from '@ginjou/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createFetcher } from './fetcher'

// Mock the entire @directus/sdk module
vi.mock('@directus/sdk', async (importOriginal) => {
	const original = await importOriginal()
	return {
		...(original as any),
		readItems: vi.fn((...args) => ['readItems', ...args]),
		readItem: vi.fn((...args) => ['readItem', ...args]),
		createItem: vi.fn((...args) => ['createItem', ...args]),
		updateItem: vi.fn((...args) => ['updateItem', ...args]),
		deleteItem: vi.fn((...args) => ['deleteItem', ...args]),
		aggregate: vi.fn((...args) => ['aggregate', ...args]),
		readUsers: vi.fn((...args) => ['readUsers', ...args]),
		readUser: vi.fn((...args) => ['readUser', ...args]),
		createUser: vi.fn((...args) => ['createUser', ...args]),
		updateUser: vi.fn((...args) => ['updateUser', ...args]),
		deleteUser: vi.fn((...args) => ['deleteUser', ...args]),
	}
})

const mockClient = {
	request: vi.fn(),
}

describe('createFetcher', () => {
	let fetcher: ReturnType<typeof createFetcher>

	beforeEach(() => {
		vi.clearAllMocks()
		fetcher = createFetcher({ client: mockClient as any })
	})

	it('should return a fetcher with all methods', () => {
		expect(fetcher).toBeDefined()
		expect(fetcher.getList).toBeInstanceOf(Function)
		expect(fetcher.getOne).toBeInstanceOf(Function)
		expect(fetcher.createOne).toBeInstanceOf(Function)
		expect(fetcher.updateOne).toBeInstanceOf(Function)
		expect(fetcher.deleteOne).toBeInstanceOf(Function)
		expect(fetcher.custom).toBeInstanceOf(Function)
	})

	describe('getList', () => {
		it('should fetch a list of resources with pagination, sorting, and filters', async () => {
			mockClient.request
				.mockResolvedValueOnce(['item1', 'item2']) // for readItems
				.mockResolvedValueOnce([{ countDistinct: { id: 2 } }]) // for aggregate

			const result = await fetcher.getList({
				resource: 'posts',
				pagination: { current: 2, perPage: 10 },
				sorters: [{ field: 'title', order: SortOrder.Asc }],
				filters: [
					{ field: 'category', operator: 'eq', value: 'news' },
					{
						operator: 'or',
						value: [
							{ field: 'status', operator: 'eq', value: 'published' },
							{ field: 'status', operator: 'eq', value: 'draft' },
						],
					},
				],
				meta: { query: { fields: ['id', 'title'] } },
			})

			expect(mockClient.request).toHaveBeenCalledTimes(2)
			const readItemsQuery = {
				fields: ['id', 'title'],
				meta: '*',
				page: 2,
				limit: 10,
				sort: 'title',
				filter: {
					_and: [
						{ category: { _eq: 'news' } },
						{
							_or: [
								{ status: { _eq: 'published' } },
								{ status: { _eq: 'draft' } },
							],
						},
					],
					status: { _neq: 'archived' },
				},
			}
			expect(sdk.readItems).toHaveBeenCalledWith('posts', readItemsQuery)

			const { page, ...expectedAggregateQuery } = readItemsQuery
			expect(sdk.aggregate).toHaveBeenCalledWith('posts', {
				query: expectedAggregateQuery,
				aggregate: { countDistinct: 'id' },
			})
			expect(result).toEqual({ data: ['item1', 'item2'], total: 2 })
		})

		it('should handle search filter', async () => {
			mockClient.request
				.mockResolvedValueOnce([])
				.mockResolvedValueOnce([{ countDistinct: { id: 0 } }])

			await fetcher.getList({
				resource: 'posts',
				filters: [{ field: 'search', operator: 'contains', value: 'hello world' }],
			})

			expect(sdk.readItems).toHaveBeenCalledWith('posts', expect.objectContaining({
				search: 'hello world',
			}))
		})

		it('should handle multiple sorters', async () => {
			mockClient.request
				.mockResolvedValueOnce([])
				.mockResolvedValueOnce([{ countDistinct: { id: 0 } }])

			await fetcher.getList({
				resource: 'posts',
				sorters: [
					{ field: 'title', order: SortOrder.Asc },
					{ field: 'createdAt', order: SortOrder.Desc },
				],
			})

			expect(sdk.readItems).toHaveBeenCalledWith('posts', expect.objectContaining({
				sort: 'title,-createdAt',
			}))
		})

		it('should handle protected resources', async () => {
			mockClient.request
				.mockResolvedValueOnce([])
				.mockResolvedValueOnce([{ countDistinct: { id: 0 } }])

			await fetcher.getList({ resource: 'directus_users' })

			expect(sdk.readUsers).toHaveBeenCalled()
			expect(sdk.readItems).not.toHaveBeenCalled()
		})
	})

	describe('getOne', () => {
		it('should fetch a single resource', async () => {
			const item = { id: 1, title: 'Hello World' }
			mockClient.request.mockResolvedValueOnce(item)

			const result = await fetcher.getOne({
				resource: 'posts',
				id: 1,
				meta: { query: { fields: ['id', 'title'] } },
			})

			expect(sdk.readItem).toHaveBeenCalledWith('posts', 1, { fields: ['id', 'title'] })
			expect(result).toEqual({ data: item })
		})

		it('should fetch a single protected resource', async () => {
			await fetcher.getOne({ resource: 'directus_users', id: '1' })
			expect(sdk.readUser).toHaveBeenCalledWith('1', {})
		})
	})

	describe('createOne', () => {
		it('should create a resource', async () => {
			const newItem = { title: 'New Post' }
			const createdItem = { id: 1, ...newItem }
			mockClient.request.mockResolvedValueOnce(createdItem)

			const result = await fetcher.createOne({
				resource: 'posts',
				params: newItem,
			})

			expect(sdk.createItem).toHaveBeenCalledWith('posts', newItem, {})
			expect(result).toEqual({ data: createdItem })
		})

		it('should create a protected resource', async () => {
			const newUser = { email: 'test@example.com' }
			await fetcher.createOne({ resource: 'directus_users', params: newUser })
			expect(sdk.createUser).toHaveBeenCalledWith(newUser, {})
		})
	})

	describe('updateOne', () => {
		it('should update a resource', async () => {
			const updates = { title: 'Updated Post' }
			const updatedItem = { id: 1, ...updates }
			mockClient.request.mockResolvedValueOnce(updatedItem)

			const result = await fetcher.updateOne({
				resource: 'posts',
				id: 1,
				params: updates,
			})

			expect(sdk.updateItem).toHaveBeenCalledWith('posts', 1, updates, {})
			expect(result).toEqual({ data: updatedItem })
		})

		it('should update a protected resource', async () => {
			const updates = { email: 'updated@example.com' }
			await fetcher.updateOne({ resource: 'directus_users', id: '1', params: updates })
			expect(sdk.updateUser).toHaveBeenCalledWith('1', updates, {})
		})
	})

	describe('deleteOne', () => {
		it('should delete a resource', async () => {
			mockClient.request.mockResolvedValueOnce(null)

			const result = await fetcher.deleteOne({
				resource: 'posts',
				id: 1,
			})

			expect(sdk.deleteItem).toHaveBeenCalledWith('posts', 1)
			expect(result).toEqual({ data: null as any })
		})

		it('should delete a protected resource', async () => {
			await fetcher.deleteOne({ resource: 'directus_users', id: '1' })
			expect(sdk.deleteUser).toHaveBeenCalledWith('1')
		})
	})

	describe('custom', () => {
		const methods: Array<'get' | 'post' | 'put' | 'patch' | 'delete'> = ['get', 'post', 'put', 'patch', 'delete']

		for (const method of methods) {
			it(`should handle custom ${method.toUpperCase()} request`, async () => {
				const responseData = { success: true }
				mockClient.request.mockResolvedValueOnce(responseData)
				const payload = method !== 'get' && method !== 'delete' ? { key: 'value' } : undefined
				const query = { param: 'test' }

				const result = await fetcher.custom({
					url: '/custom',
					method,
					payload,
					query,
					headers: { 'X-Test': 'true' },
				})

				const requestFn = mockClient.request.mock.calls[0][0]
				const requestConfig = requestFn()

				expect(requestConfig.path).toBe('/custom')
				expect(requestConfig.method).toBe(method.toUpperCase())
				expect(requestConfig.params).toEqual(query)
				expect(requestConfig.headers).toEqual({ 'X-Test': 'true' })

				if (payload)
					expect(requestConfig.body).toEqual(JSON.stringify(payload))

				expect(result).toEqual({ data: responseData })
			})
		}
	})
})
