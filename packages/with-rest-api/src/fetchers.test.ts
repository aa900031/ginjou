import { FilterOperator, SortOrder } from '@ginjou/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createFetcher } from './fetchers'

describe('createFetcher', () => {
	const mockClient = {
		raw: vi.fn(),
	}

	const testUrl = 'http://test-api.com'
	let fetcher: ReturnType<typeof createFetcher>

	beforeEach(() => {
		vi.clearAllMocks()
		fetcher = createFetcher({ url: testUrl, client: mockClient as any })
	})

	it('should return a fetcher with all methods', () => {
		expect(fetcher).toHaveProperty('getList')
		expect(fetcher).toHaveProperty('getOne')
		expect(fetcher).toHaveProperty('createOne')
		expect(fetcher).toHaveProperty('updateOne')
		expect(fetcher).toHaveProperty('deleteOne')
		expect(fetcher).toHaveProperty('custom')
	})

	// Test getList
	describe('getList', () => {
		it('should fetch a list of resources with default parameters', async () => {
			const mockData = [{ id: 1, name: 'Test' }]
			mockClient.raw.mockResolvedValue({ _data: mockData, headers: new Headers({ 'x-total-count': '1' }) })

			const result = await fetcher.getList({ resource: 'posts' })

			expect(mockClient.raw).toHaveBeenCalledWith('posts', {
				baseURL: testUrl,
				method: 'GET',
				query: {},
				headers: undefined,
			})
			expect(result).toEqual({ data: mockData, total: 1 })
			// expect(filtersUtil.genFilters).toHaveBeenCalledWith(undefined) // Removed
			// expect(sortersUtil.genSorters).toHaveBeenCalledWith(undefined) // Removed
		})

		it('should handle pagination', async () => {
			const mockData = [{ id: 1 }]
			mockClient.raw.mockResolvedValue({ _data: mockData, headers: new Headers({ 'x-total-count': '10' }) })

			const result = await fetcher.getList({
				resource: 'posts',
				pagination: { current: 2, perPage: 5 },
			})

			expect(mockClient.raw).toHaveBeenCalledWith('posts', expect.objectContaining({
				query: { _start: 5, _end: 10 },
			}))
			expect(result).toEqual({ data: mockData, total: 10 })
		})

		it('should handle sorters', async () => {
			// (sortersUtil.genSorters as vi.Mock).mockReturnValue({ // Removed
			// 	sorts: ['name'],
			// 	orders: ['asc'],
			// 	_sort: 'name',
			// 	_order: 'asc',
			// });
			const mockData = [{ id: 1 }]
			mockClient.raw.mockResolvedValue({ _data: mockData, headers: new Headers({ 'x-total-count': '1' }) })

			const sorters = [{ field: 'name', order: SortOrder.Asc }]
			await fetcher.getList({ resource: 'posts', sorters })

			// expect(sortersUtil.genSorters).toHaveBeenCalledWith(sorters); // Removed
			expect(mockClient.raw).toHaveBeenCalledWith('posts', expect.objectContaining({
				query: { _sort: 'name', _order: 'asc' }, // genSorters will be called directly now
			}))
		})

		it('should handle filters', async () => {
			// (filtersUtil.genFilters as vi.Mock).mockReturnValue({ status: 'active' }); // Removed
			const mockData = [{ id: 1 }]
			mockClient.raw.mockResolvedValue({ _data: mockData, headers: new Headers({ 'x-total-count': '1' }) })

			const filters = [{ field: 'status', operator: FilterOperator.eq, value: 'active' }]
			await fetcher.getList({ resource: 'posts', filters })

			// expect(filtersUtil.genFilters).toHaveBeenCalledWith(filters); // Removed
			expect(mockClient.raw).toHaveBeenCalledWith('posts', expect.objectContaining({
				query: { status: 'active' }, // genFilters will be called directly now
			}))
		})

		it('should combine pagination, sorters, and filters', async () => {
			// (sortersUtil.genSorters as vi.Mock).mockReturnValue({ _sort: 'name', _order: 'asc' }); // Removed
			// (filtersUtil.genFilters as vi.Mock).mockReturnValue({ status: 'active' }); // Removed
			const mockData = [{ id: 1 }]
			mockClient.raw.mockResolvedValue({ _data: mockData, headers: new Headers({ 'x-total-count': '1' }) })

			await fetcher.getList({
				resource: 'posts',
				pagination: { current: 1, perPage: 10 },
				sorters: [{ field: 'name', order: SortOrder.Asc }],
				filters: [{ field: 'status', operator: FilterOperator.eq, value: 'active' }],
			})

			expect(mockClient.raw).toHaveBeenCalledWith('posts', expect.objectContaining({
				query: { _start: 0, _end: 10, _sort: 'name', _order: 'asc', status: 'active' },
			}))
		})

		it('should use meta.method and meta.headers', async () => {
			const mockData = [{ id: 1 }]
			mockClient.raw.mockResolvedValue({ _data: mockData, headers: new Headers({ 'x-total-count': '1' }) })

			await fetcher.getList({
				resource: 'posts',
				meta: { method: 'POST', headers: { 'X-Custom': 'value' } },
			})

			expect(mockClient.raw).toHaveBeenCalledWith('posts', expect.objectContaining({
				method: 'POST',
				headers: { 'X-Custom': 'value' },
			}))
		})

		it('should derive total from data length if x-total-count header is missing', async () => {
			const mockData = [{ id: 1 }, { id: 2 }]
			mockClient.raw.mockResolvedValue({ _data: mockData, headers: new Headers() }) // No x-total-count header

			const result = await fetcher.getList({ resource: 'posts' })
			expect(result.total).toBe(mockData.length)
		})
	})

	// Test getOne
	describe('getOne', () => {
		it('should fetch a single resource', async () => {
			const mockData = { id: 1, name: 'Test' }
			mockClient.raw.mockResolvedValue({ _data: mockData })

			const result = await fetcher.getOne({ resource: 'posts', id: 1 })

			expect(mockClient.raw).toHaveBeenCalledWith('posts/1', {
				baseURL: testUrl,
				method: 'GET',
				headers: undefined,
			})
			expect(result).toEqual({ data: mockData })
		})

		it('should use meta.method and meta.headers', async () => {
			const mockData = { id: 1 }
			mockClient.raw.mockResolvedValue({ _data: mockData })

			await fetcher.getOne({
				resource: 'posts',
				id: 1,
				meta: { method: 'PUT', headers: { 'X-Custom': 'value' } },
			})

			expect(mockClient.raw).toHaveBeenCalledWith('posts/1', expect.objectContaining({
				method: 'PUT',
				headers: { 'X-Custom': 'value' },
			}))
		})
	})

	// Test createOne
	describe('createOne', () => {
		it('should create a resource', async () => {
			const mockParams = { name: 'New Post' }
			const mockData = { id: 2, ...mockParams }
			mockClient.raw.mockResolvedValue({ _data: mockData })

			const result = await fetcher.createOne({ resource: 'posts', params: mockParams })

			expect(mockClient.raw).toHaveBeenCalledWith('posts', {
				baseURL: testUrl,
				method: 'POST',
				body: mockParams,
				headers: undefined,
			})
			expect(result).toEqual({ data: mockData })
		})

		it('should use meta.method and meta.headers', async () => {
			const mockParams = { name: 'New Post' }
			const mockData = { id: 2 }
			mockClient.raw.mockResolvedValue({ _data: mockData })

			await fetcher.createOne({
				resource: 'posts',
				params: mockParams,
				meta: { method: 'PUT', headers: { 'X-Custom': 'value' } },
			})

			expect(mockClient.raw).toHaveBeenCalledWith('posts', expect.objectContaining({
				method: 'PUT',
				headers: { 'X-Custom': 'value' },
			}))
		})
	})

	// Test updateOne
	describe('updateOne', () => {
		it('should update a resource', async () => {
			const mockParams = { name: 'Updated Post' }
			const mockData = { id: 1, ...mockParams }
			mockClient.raw.mockResolvedValue({ _data: mockData })

			const result = await fetcher.updateOne({ resource: 'posts', id: 1, params: mockParams })

			expect(mockClient.raw).toHaveBeenCalledWith('posts/1', {
				baseURL: testUrl,
				method: 'PUT',
				body: mockParams,
				headers: undefined,
			})
			expect(result).toEqual({ data: mockData })
		})

		it('should use meta.method and meta.headers', async () => {
			const mockParams = { name: 'Updated Post' }
			const mockData = { id: 1 }
			mockClient.raw.mockResolvedValue({ _data: mockData })

			await fetcher.updateOne({
				resource: 'posts',
				id: 1,
				params: mockParams,
				meta: { method: 'PATCH', headers: { 'X-Custom': 'value' } },
			})

			expect(mockClient.raw).toHaveBeenCalledWith('posts/1', expect.objectContaining({
				method: 'PATCH',
				headers: { 'X-Custom': 'value' },
			}))
		})
	})

	// Test deleteOne
	describe('deleteOne', () => {
		it('should delete a resource', async () => {
			const mockData = null // Typical delete response
			mockClient.raw.mockResolvedValue({ _data: mockData })

			const result = await fetcher.deleteOne({ resource: 'posts', id: 1 })

			expect(mockClient.raw).toHaveBeenCalledWith('posts/1', {
				baseURL: testUrl,
				method: 'DELETE',
				body: undefined,
				headers: undefined,
			})
			expect(result).toEqual({ data: mockData })
		})

		it('should use meta.method and meta.headers', async () => {
			const mockData = null
			mockClient.raw.mockResolvedValue({ _data: mockData })

			await fetcher.deleteOne({
				resource: 'posts',
				id: 1,
				meta: { method: 'POST', headers: { 'X-Custom': 'value' } },
			})

			expect(mockClient.raw).toHaveBeenCalledWith('posts/1', expect.objectContaining({
				method: 'POST',
				headers: { 'X-Custom': 'value' },
			}))
		})

		it('should send body if params are provided', async () => {
			const mockParams = { hardDelete: true }
			mockClient.raw.mockResolvedValue({ _data: null })

			await fetcher.deleteOne({
				resource: 'posts',
				id: 1,
				params: mockParams,
			})

			expect(mockClient.raw).toHaveBeenCalledWith('posts/1', expect.objectContaining({
				body: mockParams,
			}))
		})
	})

	// Test custom
	describe('custom', () => {
		it('should make a custom request with all parameters', async () => {
			// Mocked genFilters, genSorters, toMethod are no longer needed
			// because they are now part of the original module.
			// The expected outputs will be based on their actual logic.

			const mockData = { customResult: true }
			mockClient.raw.mockResolvedValue({ _data: mockData })

			const customFilters = [{ field: 'a', operator: FilterOperator.eq, value: 'b' }]
			const customSorters = [{ field: 'x', order: SortOrder.Desc }]
			const customPayload = { custom: 'payload' }
			const customQuery = { customQ: 'query' }
			const customHeaders = { 'X-Custom-Header': 'customValue' }

			const result = await fetcher.custom({
				url: '/custom-endpoint',
				method: 'post',
				filters: customFilters,
				sorters: customSorters,
				payload: customPayload,
				query: customQuery,
				headers: customHeaders,
			})

			// expect(filtersUtil.genFilters).toHaveBeenCalledWith(customFilters); // Removed
			// expect(sortersUtil.genSorters).toHaveBeenCalledWith(customSorters); // Removed
			// expect(methodUtil.toMethod).toHaveBeenCalledWith('post'); // Removed

			expect(mockClient.raw).toHaveBeenCalledWith('/custom-endpoint', {
				method: 'PUT', // Based on actual toMethod
				query: {
					_order: 'desc', // Based on actual genSorters
					_sort: 'x', // Based on actual genSorters
					a: 'b', // Based on actual genFilters
					customQ: 'query',
				},
				headers: customHeaders,
				params: customPayload,
			})
			expect(result).toEqual({ data: mockData })
		})

		it('should handle custom request with minimal parameters', async () => {
			const mockData = { minimalResult: true }
			mockClient.raw.mockResolvedValue({ _data: mockData })

			const result = await fetcher.custom({
				url: '/minimal-endpoint',
				method: 'get',
			})

			// expect(filtersUtil.genFilters).toHaveBeenCalledWith(undefined); // Removed
			// expect(sortersUtil.genSorters).toHaveBeenCalledWith(undefined); // Removed
			// expect(methodUtil.toMethod).toHaveBeenCalledWith('get'); // Removed

			expect(mockClient.raw).toHaveBeenCalledWith('/minimal-endpoint', {
				method: 'GET',
				query: {},
				headers: undefined,
				params: undefined,
			})
			expect(result).toEqual({ data: mockData })
		})
	})
})
