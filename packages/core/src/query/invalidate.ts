import type { InvalidateOptions, InvalidateQueryFilters, QueryClient } from '@tanstack/query-core'
import type { Simplify, ValueOf } from 'type-fest'
import type { Meta, RecordKey } from './fetcher'
import type { FetcherProps } from './fetchers'
import { hashKey } from '@tanstack/query-core'
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
			queryFilters?: Omit<InvalidateQueryFilters, 'queryKey'>
		}

export interface Context<
	TData = any,
> {
	defaults?: {
		invalidates?: Rule[]
	}
	data?: TData
}

export type ResolveFn<
	TProps,
	TData,
> = (
	context: Simplify<
		& Context<TData>
		& {
			props: TProps | BaseProps
		}
	>,
) => RuleOptions

export type BaseProps = Simplify<
	& FetcherProps
	& {
		resource?: string
	}
>

export type Props<
	TProps,
	TData,
> = Simplify<
	& BaseProps
	& {
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
	context?: Context,
) => Promise<void>

export interface CreateInvalidatorProps<
	TProps,
	TData,
> {
	getInvalidates: () => Props<TProps, TData>['invalidates']
	getFetcherName: () => Props<TProps, TData>['fetcherName']
	getResource: () => Props<TProps, TData>['resource']
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
		queryClient,
	}: CreateInvalidatorProps<TProps, TData>,
): Invalidator<TProps, TData> {
	return async function invalidate(
		propsFromFn,
		context,
	) {
		const baseProps: BaseProps = {
			resource: propsFromFn?.resource ?? getResource(),
			fetcherName: propsFromFn?.fetcherName ?? getFetcherName(),
		}
		const invalidatesOption = propsFromFn?.invalidates ?? getInvalidates()

		const invalidates = typeof invalidatesOption === 'function'
			? invalidatesOption({ ...context, props: (propsFromFn ?? baseProps) as TProps | BaseProps })
			: invalidatesOption ?? context?.defaults?.invalidates

		if (invalidates == null)
			throw new Error('[@ginjou/core] `invalidates` is required to invalidate queries.')

		const {
			rules,
			options,
			queryFilters,
		} = Array.isArray(invalidates) || invalidates === false
			? { rules: invalidates }
			: invalidates

		if (rules === false || rules.length === 0)
			return

		const invalidateQueryFilters = queryFilters ?? DEFAULT_INVALIDATE_QUERY_FILTERS
		const invalidateOptions = options ?? DEFAULT_INVALIDATE_OPTIONS

		// Resolve every rule first so an invalid one fails before any query is invalidated
		const filtersList = rules.flatMap(rule => resolveRuleFilters({
			rule,
			baseProps,
			props: propsFromFn,
			context,
			hasPredicate: invalidateQueryFilters.predicate != null,
		}))

		await Promise.all(filtersList.map(filters => queryClient.invalidateQueries(
			{
				...filters,
				...invalidateQueryFilters,
			},
			invalidateOptions,
		)))
	}
}

interface ResolveRuleFiltersProps {
	rule: Rule
	baseProps: BaseProps
	props: Props<any, any> | undefined
	context: Context | undefined
	hasPredicate: boolean
}

function resolveRuleFilters(
	{
		rule,
		baseProps,
		props,
		context,
		hasPredicate,
	}: ResolveRuleFiltersProps,
): InvalidateQueryFilters[] {
	const target = typeof rule === 'string' ? rule : rule.target
	const fetcherName = resolveFetcherProps({
		fetcherName: typeof rule === 'string'
			? baseProps.fetcherName
			: rule.fetcherName ?? baseProps.fetcherName,
	}).fetcherName
	const resource = typeof rule === 'string' || !('resource' in rule)
		? baseProps.resource
		: rule.resource ?? baseProps.resource

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
				if (context == null)
					throw new Error('[@ginjou/core] Mutation context is required to invalidate `many` queries by string rule. Use `{ target: \'many\', ids }` instead.')

				const affectedIds = new Set(resolveAffectedIds(props, context.data).map(String))
				if (affectedIds.size === 0 && !hasPredicate)
					return []

				return [{
					queryKey: genBaseGetManyQueryKey({ props: { fetcherName, resource: resource! } }),
					predicate: query => (query.queryKey[3] as string[] | undefined)
						?.some(id => affectedIds.has(id)) ?? false,
				}]
			}

			const { ids, meta } = rule as RuleForMany
			if (!Array.isArray(ids))
				throw new Error('[@ginjou/core] `ids` is required to invalidate exact many queries.')

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
							predicate: query => isSameIds(query.queryKey[3] as string[] | undefined, idsKey),
						},
			]
		}
		case Target.One: {
			let ids: RecordKey[]
			let meta: Meta | undefined
			if (typeof rule === 'string') {
				if (context == null)
					throw new Error('[@ginjou/core] Mutation context is required to invalidate `one` queries by string rule. Use `{ target: \'one\', id }` instead.')

				ids = resolveAffectedIds(props, context.data)
			}
			else {
				const id = 'id' in rule ? rule.id : undefined
				const ruleIds = 'ids' in rule ? rule.ids : undefined
				if ((id != null) === Array.isArray(ruleIds))
					throw new Error('[@ginjou/core] Exactly one of `id` or `ids` is required to invalidate one queries.')

				ids = id != null ? [id] : ruleIds!
				meta = (rule as RuleForOne).meta
			}

			if (ids.length === 0 && !hasPredicate)
				return []

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

interface MutationProps {
	id?: RecordKey
	ids?: RecordKey[]
}

function getRecordId(
	record: unknown,
): RecordKey | undefined {
	return (record as { id?: RecordKey } | undefined)?.id
}

function resolveAffectedIds(
	props: Props<any, any> | undefined,
	data: unknown,
): RecordKey[] {
	const { id, ids } = (props ?? {}) as MutationProps
	const records = (data as { data?: unknown } | undefined)?.data

	return [...new Set([
		id,
		...(ids ?? []),
		...(Array.isArray(records) ? records.map(getRecordId) : [getRecordId(records)]),
	].filter(id => id != null))]
}

function isSameIds(
	a: string[] | undefined,
	b: string[],
): boolean {
	return a != null
		&& a.length === b.length
		&& a.every((id, index) => id === b[index])
}

export function reportInvalidateError(
	error: unknown,
): void {
	console.error('[@ginjou/core] Failed to invalidate queries.', error)
}
