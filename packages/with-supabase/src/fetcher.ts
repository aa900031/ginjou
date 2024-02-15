import type { Fetcher, FilterOperatorType, Filters, Sorters } from '@ginjou/core'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { PostgrestFilterBuilder } from '@supabase/postgrest-js'

export interface CreateFetcherProps {
	client: SupabaseClient
}

export interface FetcherMeta {
	select?: string
	count?: 'exact' | 'planned' | 'estimated'
	idColumnName?: string
}

export function createFetcher(
	{
		client,
	}: CreateFetcherProps,
): Fetcher {
	return {
		getList: async ({ resource, pagination, filters, sorters, meta }) => {
			const query = client
				.from(resource)
				.select((meta as FetcherMeta)?.select ?? '*', {
					count: (meta as FetcherMeta)?.count ?? 'exact',
				})

			if (pagination) {
				const { current, perPage } = pagination
				query.range((current as any - 1) * perPage, current as any * perPage - 1)
			}

			if (sorters)
				applySorters(query, sorters, meta)

			if (filters)
				applyFilters(query, filters)

			const { data, count, error } = await query

			if (error)
				throw error

			return {
				data: data as any || [],
				total: count || 0,
			}
		},
		getMany: async ({ resource, ids, meta }) => {
			const query = client
				.from(resource)
				.select((meta as FetcherMeta)?.select ?? '*')

			if ((meta as FetcherMeta)?.idColumnName)
				query.in((meta as FetcherMeta).idColumnName!, ids)
			else
				query.in('id', ids)

			const { data, error } = await query

			if (error)
				throw error

			return {
				data: data as any || [],
			}
		},
		create: async ({ resource, params, meta }) => {
			const query = client.from(resource).insert(params)

			if ((meta as FetcherMeta)?.select)
				query.select((meta as FetcherMeta).select)

			const { data, error } = await query

			if (error)
				throw error

			return {
				data: (data || [])[0] as any,
			}
		},
		createMany: async ({ resource, params, meta }) => {
			const query = client.from(resource).insert(params)

			if ((meta as FetcherMeta)?.select)
				query.select((meta as FetcherMeta).select)

			const { data, error } = await query

			if (error)
				throw error

			return {
				data: data as any,
			}
		},
		update: async ({ resource, id, params, meta }) => {
			const query = client.from(resource).update(params)

			if ((meta as FetcherMeta)?.idColumnName)
				query.eq((meta as FetcherMeta).idColumnName!, id)
			else
				query.match({ id })

			if ((meta as FetcherMeta)?.select)
				query.select((meta as FetcherMeta).select)

			const { data, error } = await query
			if (error)
				throw error

			return {
				data: (data || [])[0] as any,
			}
		},
		getOne: async ({ resource, id, meta }) => {
			const query = client
				.from(resource)
				.select((meta as FetcherMeta)?.select ?? '*')

			if ((meta as FetcherMeta)?.idColumnName)
				query.eq((meta as FetcherMeta).idColumnName!, id)
			else
				query.match({ id })

			const { data, error } = await query
			if (error)
				throw error

			return {
				data: (data || [])[0] as any,
			}
		},
		deleteOne: async ({ resource, id, meta }) => {
			const query = client.from(resource).delete()

			if ((meta as FetcherMeta)?.idColumnName)
				query.eq((meta as FetcherMeta).idColumnName!, id)
			else
				query.match({ id })

			const { data, error } = await query
			if (error)
				throw error

			return {
				data: (data || [])[0] as any,
			}
		},
	}
}

const splitRE = /\.(.*)/

function applySorters(
	query: PostgrestFilterBuilder<any, any, any>,
	sorters: Sorters,
	meta: FetcherMeta | undefined,
) {
	for (const sorter of sorters) {
		const [foreignTable, field] = sorter.field.split(splitRE)

		if (foreignTable && field) {
			query
				.select(meta?.select ?? `*, ${foreignTable}(${field})`)
				.order(field, {
					ascending: sorter.order === 'asc',
					foreignTable,
				})
		}
		else {
			query.order(sorter.field, {
				ascending: sorter.order === 'asc',
			})
		}
	}
}

function applyFilters(
	query: PostgrestFilterBuilder<any, any, any>,
	filters: Filters,
) {
	for (const filter of filters) {
		switch (filter.operator) {
			case 'eq':
				query.eq(filter.field, filter.value)
				break
			case 'ne':
				query.neq(filter.field, filter.value)
				break
			case 'in':
				query.in(filter.field, filter.value)
				break
			case 'gt':
				query.gt(filter.field, filter.value)
				break
			case 'gte':
				query.gte(filter.field, filter.value)
				break
			case 'lt':
				query.lt(filter.field, filter.value)
				break
			case 'lte':
				query.lte(filter.field, filter.value)
				break
			case 'contains':
				query.ilike(filter.field, `%${filter.value}%`)
				break
			case 'containss':
				query.like(filter.field, `%${filter.value}%`)
				break
			case 'null':
				query.is(filter.field, null)
				break
			case 'startswith':
				query.ilike(filter.field, `${filter.value}%`)
				break
			case 'endswith':
				query.ilike(filter.field, `%${filter.value}`)
				break
			case 'or': {
				const orSyntax = filter.value
					// eslint-disable-next-line array-callback-return
					.map((item) => {
						if (
							item.operator !== 'or'
							&& item.operator !== 'and'
							&& 'field' in item
						)
							return `${item.field}.${getOperator(item.operator)}.${item.value}`
					})
					.join(',')
				query.or(orSyntax)
				break
			}
			case 'and':
				throw new Error('Operator \'and\' is not supported')
			default:
				query.filter(
					filter.field,
					getOperator(filter.operator),
					filter.value,
				)
				break
		}
	}
}

function getOperator(
	operator: FilterOperatorType,
) {
	switch (operator) {
		case 'ne':
			return 'neq'
		case 'nin':
			return 'not.in'
		case 'contains':
			return 'ilike'
		case 'ncontains':
			return 'not.ilike'
		case 'containss':
			return 'like'
		case 'ncontainss':
			return 'not.like'
		case 'null':
			return 'is'
		case 'nnull':
			return 'not.is'
		case 'between':
		case 'nbetween':
			throw new Error(`Operator ${operator} is not supported`)
		default:
			return operator
	}
}
