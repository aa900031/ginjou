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
		createItems: vi.fn((...args) => ['createItems', ...args]),
		updateItems: vi.fn((...args) => ['updateItems', ...args]),
		deleteItems: vi.fn((...args) => ['deleteItems', ...args]),
		aggregate: vi.fn((...args) => ['aggregate', ...args]),
		readUsers: vi.fn((...args) => ['readUsers', ...args]),
		readUser: vi.fn((...args) => ['readUser', ...args]),
		createUser: vi.fn((...args) => ['createUser', ...args]),
		updateUser: vi.fn((...args) => ['updateUser', ...args]),
		deleteUser: vi.fn((...args) => ['deleteUser', ...args]),
		createUsers: vi.fn((...args) => ['createUsers', ...args]),
		updateUsers: vi.fn((...args) => ['updateUsers', ...args]),
		deleteUsers: vi.fn((...args) => ['deleteUsers', ...args]),
		withOptions: vi.fn((command, options) => ({ command, options })),
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
		expect(fetcher.getMany).toBeInstanceOf(Function)
		expect(fetcher.createMany).toBeInstanceOf(Function)
		expect(fetcher.updateMany).toBeInstanceOf(Function)
		expect(fetcher.deleteMany).toBeInstanceOf(Function)
		expect(fetcher.custom).toBeInstanceOf(Function)
	})

	it('should forward the same query abort signal to every request', async () => {
		const controller = new AbortController()
		const context = { signal: controller.signal } as any
		mockClient.request
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([{ countDistinct: { id: 0 } }])
			.mockResolvedValueOnce({ id: 1 })
			.mockResolvedValueOnce([{ id: 1 }])
			.mockResolvedValueOnce({ ok: true })

		await fetcher.getList({ resource: 'posts' }, context)
		await fetcher.getOne({ resource: 'posts', id: 1 }, context)
		await fetcher.getMany({ resource: 'posts', ids: [1] }, context)
		await fetcher.custom({ url: '/health', method: 'get' }, context)

		expect(sdk.withOptions).toHaveBeenCalledTimes(5)
		for (const [, options] of vi.mocked(sdk.withOptions).mock.calls)
			expect((options as RequestInit).signal).toBe(controller.signal)
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
			expect(sdk.withOptions).not.toHaveBeenCalled()
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

		it('should merge a filter given through meta with the resolved filters', async () => {
			mockClient.request
				.mockResolvedValueOnce([])
				.mockResolvedValueOnce([{ countDistinct: { id: 0 } }])

			const metaFilter = {
				status: { _neq: 'archived' },
				_and: [{ locale: { _eq: 'zh-TW' } }],
			}

			await fetcher.getList({
				resource: 'posts',
				filters: [{ field: 'category', operator: 'eq', value: 'news' }],
				meta: { query: { filter: metaFilter } },
			})

			expect(sdk.readItems).toHaveBeenCalledWith('posts', expect.objectContaining({
				filter: {
					status: { _neq: 'archived' },
					_and: [
						{ locale: { _eq: 'zh-TW' } },
						{ category: { _eq: 'news' } },
					],
				},
			}))
			// The caller's object is theirs — we merge into a copy.
			expect(metaFilter._and).toEqual([{ locale: { _eq: 'zh-TW' } }])
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

		it('should map every filter operator to a Directus operator', async () => {
			// Spelled out rather than derived from the adapter's own table, so a wrong mapping
			// fails here instead of agreeing with itself. No `s` suffix is case-insensitive.
			const CASES = [
				['eq', '_eq'],
				['ne', '_neq'],
				['lt', '_lt'],
				['gt', '_gt'],
				['lte', '_lte'],
				['gte', '_gte'],
				['in', '_in'],
				['nin', '_nin'],
				['null', '_null'],
				['nnull', '_nnull'],
				['between', '_between'],
				['nbetween', '_nbetween'],
				['contains', '_icontains'],
				['containss', '_contains'],
				['ncontains', '_nicontains'],
				['ncontainss', '_ncontains'],
				['startswith', '_istarts_with'],
				['startswiths', '_starts_with'],
				['nstartswith', '_nistarts_with'],
				['nstartswiths', '_nstarts_with'],
				['endswith', '_iends_with'],
				['endswiths', '_ends_with'],
				['nendswith', '_niends_with'],
				['nendswiths', '_nends_with'],
			] as const

			mockClient.request
				.mockResolvedValueOnce([])
				.mockResolvedValueOnce([{ countDistinct: { id: 0 } }])

			await fetcher.getList({
				resource: 'posts',
				filters: CASES.map(([operator]) => ({ field: 'a', operator, value: 'x' })),
			})

			expect(sdk.readItems).toHaveBeenCalledWith('posts', expect.objectContaining({
				filter: {
					_and: CASES.map(([, clientOperator]) => ({ a: { [clientOperator]: 'x' } })),
				},
			}))
		})

		it('should throw on an unknown filter operator', async () => {
			await expect(fetcher.getList({
				resource: 'posts',
				filters: [{ field: 'a', operator: 'regex' as any, value: 'x' }],
			})).rejects.toThrow('[@ginjou/with-directus] Filter operator \'regex\' is not supported.')
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
			expect(sdk.readUser).toHaveBeenCalledWith('1', undefined)
		})
	})

	describe('getMany', () => {
		it('should read items by id, keeping the meta filter alongside', async () => {
			const items = [{ id: 1 }, { id: 2 }]
			mockClient.request.mockResolvedValueOnce(items)

			const result = await fetcher.getMany({
				resource: 'posts',
				ids: [1, 2],
				meta: { query: { fields: ['id'], filter: { status: { _eq: 'published' } } } },
			})

			expect(sdk.readItems).toHaveBeenCalledWith('posts', {
				fields: ['id'],
				limit: 2,
				filter: {
					status: { _eq: 'published' },
					_and: [{ id: { _in: [1, 2] } }],
				},
			})
			expect(result).toEqual({ data: items })
		})

		it('should keep an id filter the caller already set', async () => {
			await fetcher.getMany({
				resource: 'posts',
				ids: [1, 2],
				meta: { query: { filter: { id: { _lt: 100 } } } },
			})

			expect(sdk.readItems).toHaveBeenCalledWith('posts', {
				limit: 2,
				filter: {
					id: { _lt: 100 },
					_and: [{ id: { _in: [1, 2] } }],
				},
			})
		})

		it('should keep filtering when every id is an empty string', async () => {
			await fetcher.getMany({ resource: 'posts', ids: ['', ''] })

			expect(sdk.readItems).toHaveBeenCalledWith('posts', {
				limit: 2,
				filter: { _and: [{ id: { _in: ['', ''] } }] },
			})
		})

		it('should read protected resources', async () => {
			await fetcher.getMany({ resource: 'directus_users', ids: ['1'] })
			expect(sdk.readUsers).toHaveBeenCalledWith({
				limit: 1,
				filter: { _and: [{ id: { _in: ['1'] } }] },
			})
		})
	})

	describe('createMany', () => {
		it('should create items', async () => {
			const items = [{ title: 'a' }, { title: 'b' }]
			mockClient.request.mockResolvedValueOnce(items)

			const result = await fetcher.createMany({ resource: 'posts', params: items })

			expect(sdk.createItems).toHaveBeenCalledWith('posts', items, undefined)
			expect(result).toEqual({ data: items })
		})

		it('should create protected resources', async () => {
			const users = [{ email: 'a@example.com' }]
			await fetcher.createMany({ resource: 'directus_users', params: users })
			expect(sdk.createUsers).toHaveBeenCalledWith(users, undefined)
		})
	})

	describe('updateMany', () => {
		it('should update items by id', async () => {
			const updates = { status: 'archived' }
			mockClient.request.mockResolvedValueOnce([{ id: 1 }, { id: 2 }])

			const result = await fetcher.updateMany({ resource: 'posts', ids: [1, 2], params: updates })

			expect(sdk.updateItems).toHaveBeenCalledWith('posts', [1, 2], updates, undefined)
			expect(result).toEqual({ data: [{ id: 1 }, { id: 2 }] })
		})

		it('should update protected resources', async () => {
			const updates = { status: 'active' }
			await fetcher.updateMany({ resource: 'directus_users', ids: ['1'], params: updates })
			expect(sdk.updateUsers).toHaveBeenCalledWith(['1'], updates, undefined)
		})
	})

	describe('deleteMany', () => {
		it('should delete items by id and return an empty array', async () => {
			mockClient.request.mockResolvedValueOnce(undefined)

			const result = await fetcher.deleteMany({ resource: 'posts', ids: [1, 2] })

			expect(sdk.deleteItems).toHaveBeenCalledWith('posts', [1, 2])
			expect(result).toEqual({ data: [] })
		})

		it('should delete protected resources', async () => {
			await fetcher.deleteMany({ resource: 'directus_users', ids: ['1'] })
			expect(sdk.deleteUsers).toHaveBeenCalledWith(['1'])
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

			expect(sdk.createItem).toHaveBeenCalledWith('posts', newItem, undefined)
			expect(result).toEqual({ data: createdItem })
		})

		it('should create a protected resource', async () => {
			const newUser = { email: 'test@example.com' }
			await fetcher.createOne({ resource: 'directus_users', params: newUser })
			expect(sdk.createUser).toHaveBeenCalledWith(newUser, undefined)
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

			expect(sdk.updateItem).toHaveBeenCalledWith('posts', 1, updates, undefined)
			expect(result).toEqual({ data: updatedItem })
		})

		it('should update a protected resource', async () => {
			const updates = { email: 'updated@example.com' }
			await fetcher.updateOne({ resource: 'directus_users', id: '1', params: updates })
			expect(sdk.updateUser).toHaveBeenCalledWith('1', updates, undefined)
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
