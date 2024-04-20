import { camelCase } from 'scule'
import { plural as toPlural, singular as toSingular } from 'pluralize'
import type { DirectusClient, RestClient } from '@directus/sdk'
import * as sdk from '@directus/sdk'
import type { ConditionalFilter, Fetcher, FilterOperatorType, Filters, LogicalFilter, Sorters } from '@ginjou/core'
import { SortOrder } from '@ginjou/core'

export interface CreateFetcherProps<
	TClient extends DirectusClient<any> & RestClient<any>,
> {
	client: TClient
}

export interface FetcherMeta {
	query?: Record<string, any>
	aggregate?: string[]
	groupBy?: string[]
}

export function createFetcher<
	TClient extends DirectusClient<any> & RestClient<any>,
>(
	{
		client,
	}: CreateFetcherProps<TClient>,
): Fetcher {
	return {
		getList: async ({ resource, pagination, filters, sorters, meta }) => {
			const query = {
				...(meta as FetcherMeta)?.query,
				meta: (meta as FetcherMeta)?.query?.meta ?? '*',
				page: (meta as FetcherMeta)?.query?.page ?? pagination?.current,
				limit: (meta as FetcherMeta)?.query?.limit ?? pagination?.perPage,
				fields: (meta as FetcherMeta)?.query?.fields ?? ['*'],
				...(filters ? genFilters(filters, meta) : undefined),
				...(sorters ? genSorters(sorters) : undefined),
			}

			const fn = getProtectedFunction(resource, 'read')
			const data = await client.request(fn ? fn(query) : sdk.readItems(resource, query))

			const aggregateOptions = {
				query: { ...query },
				aggregate: meta?.aggregate ?? { countDistinct: 'id' },
			}
			delete aggregateOptions.query.page

			const aggregate = await client.request(sdk.aggregate(resource, aggregateOptions))

			return {
				data: data && !Array.isArray(data) ? [data] : data as any,
				total: (aggregate[0] as any)?.countDistinct[(aggregateOptions.aggregate as any)?.countDistinct ?? 'id'] ?? 0 as number,
			}
		},
		getOne: async ({ resource, id, meta }) => {
			const query = (meta as FetcherMeta)?.query

			const fn = getProtectedFunction(resource, 'read')
			const data = await client.request(fn ? fn(id, query) : sdk.readItem(resource, id, query))

			return {
				data: data as any,
			}
		},
		create: async ({ resource, params, meta }) => {
			const query = (meta as FetcherMeta)?.query
			const item = params as any

			const fn = getProtectedFunction(resource, 'create')
			const data = await client.request(fn ? fn(item, query) : sdk.createItem(resource, item, query))

			return {
				data: data as any,
			}
		},
		update: async ({ resource, id, params, meta }) => {
			const query = (meta as FetcherMeta)?.query
			const item = params as any

			const fn = getProtectedFunction(resource, 'update')
			const data = await client.request(fn ? fn(id, item, query) : sdk.updateItem(resource, id, item, query))

			return {
				data: data as any,
			}
		},
		deleteOne: async ({ resource, id }) => {
			const fn = getProtectedFunction(resource, 'delete')
			const data = await client.request(fn ? fn(id) : sdk.deleteItem(resource, id))

			return {
				data: data as any,
			}
		},
		custom: async ({ url, method, payload, query, headers }) => {
			let response: any
			switch (method) {
				case 'put':
					response = await client.request(() => ({
						path: url,
						method: 'PUT',
						body: JSON.stringify(payload),
						params: query as any,
						headers,
					}))

					break
				case 'post':
					response = await client.request(() => ({
						path: url,
						method: 'POST',
						body: JSON.stringify(payload),
						params: query as any,
						headers,
					}))
					break
				case 'patch':
					response = await client.request(() => ({
						path: url,
						method: 'PATCH',
						body: JSON.stringify(payload),
						params: query as any,
						headers,
					}))
					break
				case 'delete':
					response = await client.request(() => ({
						path: url,
						method: 'DELETE',
						params: query as any,
						headers,
					}))
					break
				default:
					response = await client.request(() => ({
						path: url,
						method: 'GET',
						params: query as any,
						headers,
					}))
					break
			}

			return {
				data: response,
			}
		},
	}
}

const PROTECTED_RESOURCE_PREFIX = ['directus_', 'directus/']

function getProtectedFunction(
	resource: string,
	type: 'read' | 'create' | 'update' | 'delete',
	singular: boolean = true,
): ((...args: any[]) => any) | undefined {
	const prefix = PROTECTED_RESOURCE_PREFIX.find(str => resource.startsWith(str))
	if (!prefix)
		return

	const name = resource.replace(prefix, '')
	const formated = singular ? toSingular(name) : toPlural(name)
	const funName = camelCase(`${type}_${formated}`)

	return sdk[funName]
}

function genSorters(
	sorters: Sorters,
) {
	const resolved = sorters
		.map((item) => {
			switch (item.order) {
				case SortOrder.Asc:
					return item.field
				case SortOrder.Desc:
					return `-${item.field}`
				default:
					return undefined
			}
		})
		.filter(Boolean) as string[]

	if (resolved.length <= 1)
		return

	return {
		sort: resolved.join(','),
	}
}

function genFilters(
	filters: Filters,
	meta: FetcherMeta | undefined,
) {
	const result = {
		search: '',
		filter: {
			_and: [] as any[],
			status: meta?.query?.filter?.status ?? {
				_neq: 'archived',
			},
		},
	}

	for (const filter of filters) {
		if (filter.operator !== 'or' && filter.operator !== 'and' && 'field' in filter) {
			const { field, value } = filter

			if (value) {
				if (field === 'search')
					result.search = value
				else
					result.filter._and.push(genLogicalFilter(filter))
			}
		}
		else {
			result.filter._and.push(genConditionalFilter(filter))
		}
	}

	result.filter._and = result.filter._and.filter(Boolean)

	return result
}

function genLogicalFilter(
	filter: LogicalFilter,
): any {
	const { field, operator, value } = filter
	const clientOperator = getClientOperator(operator)
	if (!clientOperator)
		return

	return {
		[field]: {
			[clientOperator]: value,
		},
	}
}

function genConditionalFilter(
	filter: ConditionalFilter,
): Record<string, any[]> | undefined {
	const { operator, value } = filter
	const clientOperator = getClientOperator(operator)
	if (!clientOperator)
		return

	return {
		[clientOperator]: value
			.map(item => 'field' in item
				? genLogicalFilter(item)
				: genConditionalFilter(item))
			.filter(Boolean),
	}
}

function getClientOperator(
	operator: FilterOperatorType,
): string | undefined {
	switch (operator) {
		case 'eq':
			return '_eq'
		case 'ne':
			return '_neq'
		case 'lt':
			return '_lt'
		case 'gt':
			return '_gt'
		case 'lte':
			return '_lte'
		case 'gte':
			return '_gte'
		case 'in':
			return '_in'
		case 'nin':
			return '_nin'
		case 'contains':
			return '_contains'
		case 'containss':
			return '_icontains'
		case 'ncontains':
			return '_ncontains'
		case 'ncontainss':
			return undefined
		case 'null':
			return '_null'
		case 'nnull':
			return '_nnull'
		case 'between':
			return '_between'
		case 'nbetween':
			return '_nbetween'
		case 'startswith':
			return '_starts_with'
		case 'startswiths':
			return undefined
		case 'nstartswith':
			return '_nstarts_with'
		case 'nstartswiths':
			return undefined
		case 'endswith':
			return '_ends_with'
		case 'endswiths':
			return undefined
		case 'nendswith':
			return '_nends_with'
		case 'nendswiths':
			return undefined
		case 'or':
			return '_or'
		case 'and':
			return '_and'
	}
}
