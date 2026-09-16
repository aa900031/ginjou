import type { DirectusClient, RestClient } from '@directus/sdk'
import type { ConditionalFilter, FilterOperatorValues, Filters, LogicalFilter, Sorters } from '@ginjou/core'
import * as sdk from '@directus/sdk'
import { defineFetcher, SortOrder } from '@ginjou/core'
import { dset } from 'dset'
import pluralize from 'pluralize'
import { camelCase } from 'scule'

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

// eslint-disable-next-line ts/explicit-function-return-type
export function createFetcher<
	TClient extends DirectusClient<any> & RestClient<any>,
>(
	{
		client,
	}: CreateFetcherProps<TClient>,
) {
	// Keep context defaults so inferred fetcher methods accept omitted contexts.
	return defineFetcher({
		getList: async ({ resource, pagination, filters, sorters, meta }, context = undefined) => {
			// No scrubbing pass: the SDK omits undefined and null itself, and anything else in
			// here is the caller's own query, where an empty string or `_eq: null` is a real
			// condition rather than noise to strip.
			const query = {
				...(meta as FetcherMeta)?.query,
				meta: (meta as FetcherMeta)?.query?.meta ?? '*',
				page: (meta as FetcherMeta)?.query?.page ?? pagination?.current,
				limit: (meta as FetcherMeta)?.query?.limit ?? pagination?.perPage,
				fields: (meta as FetcherMeta)?.query?.fields ?? ['*'],
				...(filters ? genFilters(filters, meta) : undefined),
				...(sorters ? genSorters(sorters) : undefined),
			}

			const fn = getProtectedFunction(resource, 'read', 'many')
			const readCommand = fn ? fn(query) : sdk.readItems<any, any, any>(resource, query)

			const aggregateOptions = {
				query: { ...query },
				aggregate: meta?.aggregate ?? { countDistinct: 'id' },
			}
			delete aggregateOptions.query.page

			const aggregateCommand = sdk.aggregate(resource as any, aggregateOptions as any)

			// The count does not depend on the rows, so both round-trips go out together.
			const [data, aggregate] = await Promise.all([
				client.request(withSignal(readCommand, context)),
				client.request(withSignal(aggregateCommand, context)),
			])

			return {
				data: data && !Array.isArray(data) ? [data] : data as any,
				total: (aggregate[0] as any)?.countDistinct[(aggregateOptions.aggregate as any)?.countDistinct ?? 'id'] ?? 0 as number,
			}
		},
		getOne: async ({ resource, id, meta }, context = undefined) => {
			const query = (meta as FetcherMeta)?.query

			const fn = getProtectedFunction(resource, 'read')
			const command = fn ? fn(id, query) : sdk.readItem<any, any, any>(resource, id, query)
			const data = await client.request(withSignal(command, context))

			return {
				data: data as any,
			}
		},
		getMany: async ({ resource, ids, meta }, context = undefined) => {
			const metaQuery = (meta as FetcherMeta)?.query
			// `genFilters` pushes the id filter into `_and`, so a caller's own `id` filter survives.
			const query = {
				...metaQuery,
				limit: metaQuery?.limit ?? ids.length,
				filter: genFilters([{ field: 'id', operator: 'in', value: ids }], meta).filter,
			}

			const fn = getProtectedFunction(resource, 'read', 'many')
			const command = fn ? fn(query) : sdk.readItems<any, any, any>(resource, query)
			const data = await client.request(withSignal(command, context))

			return {
				data: data as any,
			}
		},
		createOne: async ({ resource, params, meta }) => {
			const query = (meta as FetcherMeta)?.query
			const item = params as any

			const fn = getProtectedFunction(resource, 'create')
			const data = await client.request(fn ? fn(item, query) : sdk.createItem(resource, item, query))

			return {
				data: data as any,
			}
		},
		createMany: async ({ resource, params, meta }) => {
			const query = (meta as FetcherMeta)?.query
			const items = params as any[]

			const fn = getProtectedFunction(resource, 'create', 'many')
			const data = await client.request(fn ? fn(items, query) : sdk.createItems(resource, items, query))

			return {
				data: data as any,
			}
		},
		updateOne: async ({ resource, id, params, meta }) => {
			const query = (meta as FetcherMeta)?.query
			const item = params as any

			const fn = getProtectedFunction(resource, 'update')
			const data = await client.request(fn ? fn(id, item, query) : sdk.updateItem(resource, id, item, query))

			return {
				data: data as any,
			}
		},
		updateMany: async ({ resource, ids, params, meta }) => {
			const query = (meta as FetcherMeta)?.query
			const item = params as any

			const fn = getProtectedFunction(resource, 'update', 'many')
			const data = await client.request(fn ? fn(ids, item, query) : sdk.updateItems(resource, ids as any, item, query))

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
		deleteMany: async ({ resource, ids }) => {
			const fn = getProtectedFunction(resource, 'delete', 'many')
			// Directus returns no body for deletes; core still expects an array to publish from.
			const data = await client.request(fn ? fn(ids) : sdk.deleteItems(resource, ids as any))

			return {
				data: (data ?? []) as any,
			}
		},
		custom: async ({ url, method, payload, query, headers }, context = undefined) => {
			let command: any
			switch (method) {
				case 'put':
					command = () => ({
						path: url,
						method: 'PUT',
						body: JSON.stringify(payload),
						params: query as any,
						headers,
					})

					break
				case 'post':
					command = () => ({
						path: url,
						method: 'POST',
						body: JSON.stringify(payload),
						params: query as any,
						headers,
					})
					break
				case 'patch':
					command = () => ({
						path: url,
						method: 'PATCH',
						body: JSON.stringify(payload),
						params: query as any,
						headers,
					})
					break
				case 'delete':
					command = () => ({
						path: url,
						method: 'DELETE',
						params: query as any,
						headers,
					})
					break
				default:
					command = () => ({
						path: url,
						method: 'GET',
						params: query as any,
						headers,
					})
					break
			}

			const response = await client.request(withSignal(command, context))

			return {
				data: response,
			}
		},
	})
}

/** Only a query carries an abort signal; a mutation context has none, and the command goes as-is. */
function withSignal<T>(
	command: T,
	context: unknown,
): T {
	const signal = context && typeof context === 'object' && 'signal' in context
		? context.signal as AbortSignal
		: undefined

	return signal
		? sdk.withOptions(command as any, { signal }) as T
		: command
}

const PROTECTED_RESOURCE_PREFIX = ['directus_', 'directus/']

function getProtectedFunction(
	resource: string,
	type: 'read' | 'create' | 'update' | 'delete',
	arity: 'one' | 'many' = 'one',
): ((...args: any[]) => any) | undefined {
	const prefix = PROTECTED_RESOURCE_PREFIX.find(str => resource.startsWith(str))
	if (!prefix)
		return

	const name = resource.replace(prefix, '')
	const formated = arity === 'one' ? pluralize.singular(name) : pluralize.plural(name)
	const funName = camelCase(`${type}_${formated}`)

	return (sdk as any)[funName]
}

function genSorters(
	sorters: Sorters,
): { sort: string } | undefined {
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

	if (resolved.length === 0)
		return

	return {
		sort: resolved.join(','),
	}
}

function genFilters(
	filters: Filters,
	meta: FetcherMeta | undefined,
): { search?: string, filter?: Record<string, any> } {
	// `genFilters` overwrites `query.filter` wholesale, so anything the caller set on
	// `meta.query.filter` has to be carried over here or it is lost. Nothing is injected on
	// top of it: a default like `status: { _neq: 'archived' }` breaks every collection that
	// has no `status` field, so a caller who wants one passes it through meta.
	const metaFilter = meta?.query?.filter
	// A copy of the caller's `_and` minus any junk in it; the resolved filters join it below.
	const and = [...(metaFilter?._and ?? [])].filter(Boolean) as any[]
	let search: string | undefined

	for (const filter of filters) {
		if ('field' in filter) {
			const { field, value } = filter

			if (value != null) {
				if (field === 'search')
					search = value
				else
					and.push(genLogicalFilter(filter))
			}
		}
		else {
			and.push(genConditionalFilter(filter))
		}
	}

	const filter: Record<string, any> = { ...metaFilter }
	// Emit these only when they hold something. An empty `_and` goes out as
	// `filter={"_and":[]}` and an empty `search` clobbers the caller's own, and there is
	// deliberately no scrubbing pass downstream to undo either.
	if (and.length > 0)
		filter._and = and
	else
		delete filter._and

	return {
		...(search ? { search } : undefined),
		...(Object.keys(filter).length > 0 ? { filter } : undefined),
	}
}

function genLogicalFilter(
	filter: LogicalFilter,
): any {
	const { field, operator, value } = filter
	const clientOperator = getClientOperator(operator)

	const result = {}
	dset(result, field, {
		[clientOperator]: value,
	})

	return result
}

function genConditionalFilter(
	filter: ConditionalFilter,
): Record<string, any[]> {
	const { operator, value } = filter
	const clientOperator = getClientOperator(operator)

	return {
		[clientOperator]: value
			.map(item => 'field' in item
				? genLogicalFilter(item)
				: genConditionalFilter(item)),
	}
}

/**
 * A Ginjou operator without an `s` suffix is case-insensitive and maps to a Directus `_i*`
 * variant; the `s` suffix means case-sensitive and maps to the plain Directus operator.
 *
 * A switch rather than a lookup object on purpose: operators arrive as source literals, which
 * V8 interns, so the case chain is a run of pointer compares and beats a keyed load. An object
 * would also answer `toString` and `constructor` from `Object.prototype` instead of throwing.
 * The `never` in `default` keeps the whole union covered at compile time.
 */
function getClientOperator(
	operator: FilterOperatorValues,
): string {
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
			return '_icontains'
		case 'containss':
			return '_contains'
		case 'ncontains':
			return '_nicontains'
		case 'ncontainss':
			return '_ncontains'
		case 'null':
			return '_null'
		case 'nnull':
			return '_nnull'
		case 'between':
			return '_between'
		case 'nbetween':
			return '_nbetween'
		case 'startswith':
			return '_istarts_with'
		case 'startswiths':
			return '_starts_with'
		case 'nstartswith':
			return '_nistarts_with'
		case 'nstartswiths':
			return '_nstarts_with'
		case 'endswith':
			return '_iends_with'
		case 'endswiths':
			return '_ends_with'
		case 'nendswith':
			return '_niends_with'
		case 'nendswiths':
			return '_nends_with'
		case 'or':
			return '_or'
		case 'and':
			return '_and'
		default: {
			// Unreachable for a typed caller; an operator added to core breaks this line first.
			const unsupported: never = operator
			throw new Error(`[@ginjou/with-directus] Filter operator '${unsupported}' is not supported.`)
		}
	}
}
