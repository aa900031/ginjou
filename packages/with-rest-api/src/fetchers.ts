import type { $Fetch } from 'ofetch'
import { AbortController, Headers, createFetch, fetch } from 'ofetch'
import type { Fetcher } from '@ginjou/core'
import { genFilters } from './utils/filters'
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
			const {
				current = 1,
				perPage = 10,
			} = pagination ?? {}

			const queryFilters = genFilters(filters)
			const querySorters = genSorters(sorters)

			const query: {
				_start?: number
				_end?: number
				_sort?: string
				_order?: string
			} = {}

			query._start = (current as number - 1) * perPage
			query._end = current as number * perPage
			if (querySorters) {
				query._sort = querySorters._sort
				query._order = querySorters._order
			}

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
	}
}
