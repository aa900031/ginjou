import type { InvalidateOptions, InvalidateQueryFilters, QueryClient } from '@tanstack/query-core'
import type { Simplify, ValueOf } from 'type-fest'
import type { Meta, RecordKey } from './fetcher'
import type { FetcherProps } from './fetchers'
import { hashKey } from '@tanstack/query-core'
import { isEqual, uniqBy } from 'es-toolkit'
import { resolveFetcherProps } from './fetchers'
import { createBaseQueryKey as genBaseGetInfiniteListQueryKey } from './get-infinite-list'
import { createBaseQueryKey as genBaseGetListQueryKey } from './get-list'
import { createBaseQueryKey as genBaseGetManyQueryKey, createQueryKey as genGetManyQueryKey } from './get-many'
import { createBaseQueryKey as genBaseGetOneQueryKey } from './get-one'
import { createQueryKey as genResourceQueryKey } from './resource'

export const Target = {
	All: 'all',
	Resource: 'resource',
	List: 'list',
	Many: 'many',
	One: 'one',
} as const

export type TargetValues = ValueOf<typeof Target>

export type RuleForOne = {
	target: typeof Target.One
	resource?: string
	fetcherName?: string
	meta?: Meta
} & (
	| {
		id: RecordKey
		ids?: never
	}
	| {
		id?: never
		ids: RecordKey[]
	}
)

// eslint-disable-next-line ts/consistent-type-definitions
export type RuleForAll = {
	target: typeof Target.All
	fetcherName?: string
}

// eslint-disable-next-line ts/consistent-type-definitions
export type RuleForResource = {
	target: typeof Target.Resource
	resource?: string
	fetcherName?: string
}

// eslint-disable-next-line ts/consistent-type-definitions
export type RuleForList = {
	target: typeof Target.List
	resource?: string
	fetcherName?: string
}

// eslint-disable-next-line ts/consistent-type-definitions
export type RuleForMany = {
	target: typeof Target.Many
	resource?: string
	ids: RecordKey[]
	fetcherName?: string
	meta?: Meta
}

export type Rule
	= | TargetValues
		| RuleForAll
		| RuleForResource
		| RuleForList
		| RuleForMany
		| RuleForOne

export type RuleOptions
	= | Rule[]
		| false
		| {
			rules: Rule[] | false
			options?: InvalidateOptions
			filters?: Omit<InvalidateQueryFilters, 'queryKey'>
		}

export interface Context<
	TData,
> {
	ids?: (RecordKey | undefined)[]
	data?: TData
}

export type ResolveFn<
	TData,
> = (
	context: {
		ids: RecordKey[]
		data?: TData
	},
) => RuleOptions

export type Props<
	TData,
> = Simplify<
	& FetcherProps
	& {
		resource?: string
		invalidates?:
			| RuleOptions
			| ResolveFn<TData>
	}
>

export type Invalidator<
	TData,
> = (
	props?: Props<TData>,
	context?: Context<TData>,
) => Promise<void>

export interface CreateInvalidatorProps<
	TData,
> {
	getInvalidates: () => Props<TData>['invalidates']
	getFetcherName: () => Props<TData>['fetcherName']
	getResource: () => Props<TData>['resource']
	queryClient: QueryClient
}

const DEFAULT_INVALIDATE_QUERY_FILTERS: Omit<InvalidateQueryFilters, 'queryKey'> = {
	type: 'all',
	refetchType: 'active',
}

const DEFAULT_INVALIDATE_OPTIONS: InvalidateOptions = {
	cancelRefetch: false,
}

export function createInvalidator<
	TData,
>(
	{
		getInvalidates,
		getFetcherName,
		getResource,
		queryClient,
	}: CreateInvalidatorProps<TData>,
): Invalidator<TData> {
	return async function invalidator(
		propsFromFn,
		context,
	) {
		const resource = propsFromFn?.resource ?? getResource()
		const fetcherName = propsFromFn?.fetcherName ?? getFetcherName()
		const invalidatesOption = propsFromFn?.invalidates ?? getInvalidates()
		const ids = uniqBy((context?.ids ?? []).filter(id => id != null), String)

		if (invalidatesOption == null)
			throw new Error('[@ginjou/core] `invalidates` is required to invalidate queries.')

		const invalidates = typeof invalidatesOption === 'function'
			? invalidatesOption({ ids, data: context?.data })
			: invalidatesOption

		const ruleOptions = Array.isArray(invalidates) || invalidates === false
			? { rules: invalidates }
			: invalidates
		if (
			typeof ruleOptions !== 'object'
			|| ruleOptions == null
			|| (ruleOptions.rules !== false && !Array.isArray(ruleOptions.rules))
		) {
			throw new Error(typeof invalidatesOption === 'function'
				? '[@ginjou/core] The `invalidates` callback must return an array of rules, `false`, or `{ rules, filters?, options? }`.'
				: '[@ginjou/core] `invalidates` must be an array of rules, `false`, or `{ rules, filters?, options? }`.')
		}

		const {
			rules,
			options,
			filters,
		} = ruleOptions

		if (rules === false || rules.length === 0)
			return

		const invalidateQueryFilters = filters ?? DEFAULT_INVALIDATE_QUERY_FILTERS
		const invalidateOptions = options ?? DEFAULT_INVALIDATE_OPTIONS

		// Resolve every rule first so an invalid one fails before any query is invalidated
		const filtersList = rules.flatMap(rule => resolveRuleFilters({
			rule,
			resource,
			fetcherName,
			ids,
			hasPredicate: invalidateQueryFilters.predicate != null,
		}))

		await Promise.all(filtersList.map(ruleFilters => queryClient.invalidateQueries(
			{
				...ruleFilters,
				...invalidateQueryFilters,
			},
			invalidateOptions,
		)))
	}
}

interface ResolveRuleFiltersProps {
	rule: Rule
	resource: string | undefined
	fetcherName: string | undefined
	ids: RecordKey[]
	hasPredicate: boolean
}

function resolveRuleFilters(
	{
		rule,
		resource: resourceFromProps,
		fetcherName: fetcherNameFromProps,
		ids: idsFromContext,
		hasPredicate,
	}: ResolveRuleFiltersProps,
): InvalidateQueryFilters[] {
	const target = typeof rule === 'string' ? rule : rule.target
	const fetcherName = resolveFetcherProps({
		fetcherName: typeof rule === 'string'
			? fetcherNameFromProps
			: rule.fetcherName ?? fetcherNameFromProps,
	}).fetcherName
	const resource = typeof rule === 'string' || !('resource' in rule)
		? resourceFromProps
		: rule.resource ?? resourceFromProps

	if (target !== Target.All && resource == null)
		throw new Error(`[@ginjou/core] \`resource\` is required to invalidate ${target} queries.`)

	switch (target) {
		case Target.All:
			return [{
				queryKey: [fetcherName],
			}]
		case Target.Resource:
			return [{
				queryKey: genResourceQueryKey({ props: { fetcherName, resource: resource! } }),
			}]
		case Target.List:
			return [
				{
					queryKey: genBaseGetListQueryKey({ props: { fetcherName, resource: resource! } }),
				},
				{
					queryKey: genBaseGetInfiniteListQueryKey({ props: { fetcherName, resource: resource! } }),
				},
			]
		case Target.Many: {
			if (typeof rule === 'string') {
				const affectedIds = new Set(idsFromContext.map(String))
				if (affectedIds.size === 0 && !hasPredicate) {
					warnMissingIds(target)
					return []
				}

				return [{
					queryKey: genBaseGetManyQueryKey({ props: { fetcherName, resource: resource! } }),
					predicate: query => (query.queryKey[3] as string[] | undefined)
						?.some(id => affectedIds.has(id)) ?? false,
				}]
			}

			const { ids, meta } = rule as RuleForMany
			if (!Array.isArray(ids))
				throw new Error('[@ginjou/core] `ids` is required to invalidate exact many queries.')

			if (ids.length === 0)
				return []

			const idsKey = ids.map(String)
			return [
				meta != null
					? {
							queryKey: genGetManyQueryKey({
								props: {
									fetcherName,
									resource: resource!,
									ids,
									meta,
									aggregate: true,
								},
							}),
							exact: true,
						}
					: {
							queryKey: genBaseGetManyQueryKey({ props: { fetcherName, resource: resource! } }),
							predicate: query => isEqual(query.queryKey[3], idsKey),
						},
			]
		}
		case Target.One: {
			let ids: RecordKey[]
			let meta: Meta | undefined
			if (typeof rule === 'string') {
				ids = idsFromContext
				if (ids.length === 0 && !hasPredicate) {
					warnMissingIds(target)
					return []
				}
			}
			else {
				const id = 'id' in rule ? rule.id : undefined
				const ruleIds = 'ids' in rule ? rule.ids : undefined
				if ((id != null) === Array.isArray(ruleIds))
					throw new Error('[@ginjou/core] Exactly one of `id` or `ids` is required to invalidate one queries.')

				ids = id != null ? [id] : ruleIds!
				meta = (rule as RuleForOne).meta
				if (ids.length === 0)
					return []
			}

			const idSet = new Set(ids.map(String))
			const metaHash = meta != null ? hashKey([{ meta }]) : undefined
			return [{
				queryKey: genBaseGetOneQueryKey({ props: { fetcherName, resource: resource! } }),
				predicate: query => query.queryKey[3] != null
					&& idSet.has(String(query.queryKey[3]))
					&& (metaHash == null || hashKey([query.queryKey[4]]) === metaHash),
			}]
		}
		default:
			throw new Error(`[@ginjou/core] Unsupported invalidate target: ${String(target)}`)
	}
}

function warnMissingIds(
	target: TargetValues,
): void {
	console.warn(`[@ginjou/core] No \`ids\` in the invalidate context, skipped the \`${target}\` rule. Pass \`ids\` or use \`{ target: '${target}', ids }\`.`)
}
