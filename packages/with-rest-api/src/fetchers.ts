import type { Fetcher } from '@ginjou/core'
import type { $Fetch } from 'ofetch'
import { AbortController, createFetch, fetch, Headers } from 'ofetch'
import { genFilters } from './utils/filters'
import { toMethod } from './utils/method'
import { genSorters } from './utils/sorters'

export interface CreateFetcherProps {
	url: URL | string
	client?: $Fetch
}

export function createFetcher(
	{
		url,
		client = createFetch({ fetch, Headers, AbortController }),
	}: CreateFetcherProps,
): Fetcher {
	return {
		getList: async ({ resource, pagination, filters, sorters, meta }) => {
			const query: {
				_start?: number
				_end?: number
				_sort?: string
				_order?: string
			} = {}

			if (pagination) {
				const {
					current,
					perPage,
				} = pagination

				query._start = (current as number - 1) * perPage
				query._end = current as number * perPage
			}

			const querySorters = genSorters(sorters)
			if (querySorters) {
				query._sort = querySorters._sort
				query._order = querySorters._order
			}

			const queryFilters = genFilters(filters)

			const response = await client.raw(resource, {
				baseURL: `${url}`,
				method: meta?.method as any ?? 'GET',
				query: {
					...query,
					...queryFilters,
				},
				headers: meta?.headers as any,
			})

			const data = response._data!
			const total = response.headers.get('x-total-count')

			return {
				data,
				total: +(total || data.length),
			}
		},
		getOne: async ({ resource, id, meta }) => {
			const response = await client.raw(`${resource}/${id}`, {
				baseURL: `${url}`,
				method: meta?.method as any ?? 'GET',
				headers: meta?.headers as any,
			})

			return {
				data: response._data,
			}
		},
		create: async ({ resource, params, meta }) => {
			const response = await client.raw(`${resource}`, {
				baseURL: `${url}`,
				method: meta?.method as any ?? 'POST',
				body: params as any,
				headers: meta?.headers as any,
			})

			return {
				data: response._data,
			}
		},
		update: async ({ resource, id, params, meta }) => {
			const response = await client.raw(`${resource}/${id}`, {
				baseURL: `${url}`,
				method: meta?.method as any ?? 'PUT',
				body: params as any,
				headers: meta?.headers as any,
			})

			return {
				data: response._data,
			}
		},
		deleteOne: async ({ resource, id, params, meta }) => {
			const response = await client.raw(`${resource}/${id}`, {
				baseURL: `${url}`,
				method: meta?.method as any ?? 'DELETE',
				body: params as any,
				headers: meta?.headers as any,
			})

			return {
				data: response._data,
			}
		},
		custom: async ({
			url,
			method,
			filters,
			sorters,
			payload,
			query,
			headers,
		}) => {
			const queryFilters = genFilters(filters)
			const querySorters = genSorters(sorters)
			const reqMethod = toMethod(method)
			const reqQuery = {
				_order: querySorters?._order,
				_sort: querySorters?._sort,
				...queryFilters,
				...query,
			}
			const response = await client.raw(url, {
				method: reqMethod,
				query: reqQuery,
				headers,
				params: payload as any,
			})

			return {
				data: response._data,
			}
		},
	}
}
