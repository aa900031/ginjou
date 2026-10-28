import type { InvalidateOptions, InvalidateQueryFilters, Query, QueryClient, QueryKey } from '@tanstack/query-core'
import type { Simplify, ValueOf } from 'type-fest'
import type { Meta, RecordKey } from './fetcher'
import type { FetcherProps } from './fetchers'
import { partialMatchKey } from '@tanstack/query-core'
import { uniq } from 'es-toolkit'
import { resolveFetcherProps } from './fetchers'
import { createBaseQueryKey as genBaseGetInfiniteListQueryKey } from './get-infinite-list'
import { createBaseQueryKey as genBaseGetListQueryKey } from './get-list'
import { createBaseQueryKey as genBaseGetManyQueryKey } from './get-many'
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

export type RuleIds
	= | {
		id: RecordKey
		ids?: never
	}
	| {
		id?: never
		ids?: RecordKey[]
	}

export type RuleForOne = {
	target: typeof Target.One
	resource?: string
	fetcherName?: string
	meta?: Meta
} & RuleIds

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

export type RuleForMany = {
	target: typeof Target.Many
	resource?: string
	fetcherName?: string
	meta?: Meta
} & RuleIds

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

export type MutateType = 'create' | 'update' | 'delete'

export type EventType = 'success' | 'settled'

export interface Context<
	TProps,
	TData,
> {
	mutate?: MutateType
	event?: EventType
	props?: TProps
	data?: TData
	error?: unknown
}

export type ResolveFn<
	TProps,
	TData,
> = (
	context: Simplify<
		& Context<TProps, TData>
		& {
			ids: RecordKey[]
		}
	>,
) => RuleOptions

export type Props<
	TProps,
	TData,
> = Simplify<
	& FetcherProps
	& {
		resource?: string
		id?: RecordKey
		ids?: RecordKey[]
		invalidates?:
			| RuleOptions
			| ResolveFn<TProps, TData>
	}
>

export type Invalidator<
	TProps,
	TData,
> = (
	props?: Props<TProps, TData>,
	context?: Context<TProps, TData>,
) => Promise<void>

export interface CreateInvalidatorProps<
	TProps,
	TData,
> {
	getInvalidates: () => Props<TProps, TData>['invalidates']
	getFetcherName: () => Props<TProps, TData>['fetcherName']
	getResource: () => Props<TProps, TData>['resource']
	getId: () => Props<TProps, TData>['id']
	getIds: () => Props<TProps, TData>['ids']
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
	TProps,
	TData,
>(
	{
		getInvalidates,
		getFetcherName,
		getResource,
		getId,
		getIds,
		queryClient,
	}: CreateInvalidatorProps<TProps, TData>,
): Invalidator<TProps, TData> {
	return async function invalidator(
		propsFromFn,
		context,
	) {
		const resource = propsFromFn?.resource ?? getResource()
		const fetcherName = propsFromFn?.fetcherName ?? getFetcherName()
		const invalidatesOption = propsFromFn?.invalidates ?? getInvalidates()
		// `id` and `ids` are one group: when the call passes either, the hook-level ones are not used
		const hasIdsFromFn = propsFromFn?.id != null || propsFromFn?.ids != null
		const ids = uniq([
			...getDataIds(context?.data),
			...((hasIdsFromFn ? propsFromFn?.ids : getIds()) ?? []),
			hasIdsFromFn ? propsFromFn?.id : getId(),
		].filter(id => id != null))

		if (invalidatesOption == null)
			throw new Error('[@ginjou/core] `invalidates` is required to invalidate queries.')

		const invalidates = typeof invalidatesOption === 'function'
			? invalidatesOption({ ...context, ids })
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
		}))

		await Promise.all(filtersList.map(ruleFilters => queryClient.invalidateQueries(
			mergeQueryFilters(ruleFilters, invalidateQueryFilters),
			invalidateOptions,
		)))
	}
}

interface ResolveRuleFiltersProps {
	rule: Rule
	resource: string | undefined
	fetcherName: string | undefined
	ids: RecordKey[]
}

function resolveRuleFilters(
	{
		rule,
		resource: resourceFromProps,
		fetcherName: fetcherNameFromProps,
		ids: affectedIds,
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
			const baseQueryKey = genBaseGetManyQueryKey({ props: { fetcherName, resource: resource! } })
			const { ids, meta } = resolveRuleScope(rule, affectedIds)
			if (ids == null)
				return [createResourceFilters(baseQueryKey, meta)]
			if (ids.length === 0)
				return []

			// getMany keys store ids as strings
			const idSet = new Set(ids.map(String))
			return [{
				queryKey: baseQueryKey,
				predicate: query => ((query.queryKey[3] as string[] | undefined)?.some(id => idSet.has(id)) ?? false)
					&& (meta == null || partialMatchKey([query.queryKey[4]], [{ meta }])),
			}]
		}
		case Target.One: {
			const baseQueryKey = genBaseGetOneQueryKey({ props: { fetcherName, resource: resource! } })
			const { ids, meta } = resolveRuleScope(rule, affectedIds)
			if (ids == null)
				return [createResourceFilters(baseQueryKey, meta)]

			// Object key parts match as a subset, so a rule meta also matches queries with more meta fields
			return ids.map(id => ({
				queryKey: meta != null ? [...baseQueryKey, id, { meta }] : [...baseQueryKey, id],
			}))
		}
		default:
			throw new Error(`[@ginjou/core] Unsupported invalidate target: ${String(target)}`)
	}
}

function getDataIds(
	data: unknown,
): (RecordKey | undefined)[] {
	// Mutation results are `{ data: record }` or `{ data: record[] }`
	const records = (data as { data?: unknown } | undefined)?.data
	return (Array.isArray(records) ? records : [records])
		.map(record => (record as { id?: RecordKey } | null | undefined)?.id)
}

function mergeQueryFilters(
	ruleFilters: InvalidateQueryFilters,
	userFilters: Omit<InvalidateQueryFilters, 'queryKey'>,
): InvalidateQueryFilters {
	// User filters can only narrow a rule: the user `exact` is dropped so the rule's key
	// matching stays as is, and a user predicate must match together with the rule's
	const { exact: _exact, predicate: userPredicate, ...restUserFilters } = userFilters
	const { predicate: rulePredicate } = ruleFilters
	const predicate = rulePredicate != null && userPredicate != null
		? (query: Query) => rulePredicate(query) && userPredicate(query)
		: rulePredicate ?? userPredicate

	return {
		...restUserFilters,
		...ruleFilters,
		...(predicate != null ? { predicate } : {}),
	}
}

function resolveRuleScope(
	rule: Rule,
	affectedIds: RecordKey[],
): { ids: RecordKey[] | undefined, meta: Meta | undefined } {
	// A string rule uses the affected ids; without any, it covers the whole resource
	if (typeof rule === 'string') {
		return {
			ids: affectedIds.length > 0 ? affectedIds : undefined,
			meta: undefined,
		}
	}

	const { id, ids, meta } = rule as { id?: RecordKey, ids?: RecordKey[], meta?: Meta }
	if (id != null && ids != null)
		throw new Error('[@ginjou/core] Use either `id` or `ids` in an invalidate rule, not both.')

	return {
		ids: id != null ? [id] : ids,
		meta,
	}
}

function createResourceFilters(
	baseQueryKey: QueryKey,
	meta: Meta | undefined,
): InvalidateQueryFilters {
	return meta != null
		? { queryKey: baseQueryKey, predicate: query => partialMatchKey([query.queryKey[4]], [{ meta }]) }
		: { queryKey: baseQueryKey }
}
