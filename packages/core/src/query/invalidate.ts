import type { InvalidateOptions, InvalidateQueryFilters, QueryClient } from '@tanstack/query-core'
import type { Simplify, ValueOf } from 'type-fest'
import type { Meta, RecordKey } from './fetcher'
import type { FetcherProps } from './fetchers'
import { resolveFetcherProps } from './fetchers'
import { createBaseQueryKey as genBaseGetInfiniteListQueryKey } from './get-infinite-list'
import { createBaseQueryKey as genBaseGetListQueryKey } from './get-list'
import { createQueryKey as genGetManyQueryKey } from './get-many'
import { createQueryKey as genGetOneQueryKey } from './get-one'
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
	resource: string
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
	resource: string
	fetcherName?: string
}

// eslint-disable-next-line ts/consistent-type-definitions
export type RuleForList = {
	target: typeof Target.List
	resource: string
	fetcherName?: string
}

// eslint-disable-next-line ts/consistent-type-definitions
export type RuleForMany = {
	target: typeof Target.Many
	resource: string
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

export interface ResolveContext<
	TData = any,
	TProps = any,
> {
	data?: TData
	props?: TProps
}

export type ResolveFn<
	TData = any,
	TProps = any,
> = (
	defaults: Rule[] | undefined,
	context: ResolveContext<TData, TProps>,
) => RuleOptions

export type Props<
	TData = any,
	TProps = any,
> = Simplify<
	& FetcherProps
	& {
		resource?: string
		invalidates?:
			| RuleOptions
			| ResolveFn<TData, TProps>
	}
>

export interface Fallbacks {
	invalidates?: Rule[]
}

export interface MutationContext {
	data?: unknown
}

export type Invalidator = (
	props: Props,
	fallbacks?: Fallbacks,
	mutation?: MutationContext,
) => Promise<void>

export interface CreateInvalidatorProps {
	getInvalidates: () => Props['invalidates']
	getFetcherName: () => Props['fetcherName']
	getResource: () => Props['resource']
	queryClient: QueryClient
}

const DEFAULT_INVALIDATE_QUERY_FILTERS: Omit<InvalidateQueryFilters, 'queryKey'> = {
	type: 'all',
	refetchType: 'active',
}

const DEFAULT_INVALIDATE_OPTIONS: InvalidateOptions = {
	cancelRefetch: false,
}

export function createInvalidator(
	{
		getInvalidates,
		getFetcherName,
		getResource,
		queryClient,
	}: CreateInvalidatorProps,
): Invalidator {
	return async function invalidate(
		propsFromFn,
		fallbacks,
		mutation,
	) {
		const invalidatesOption = propsFromFn.invalidates ?? getInvalidates()

		const invalidates = typeof invalidatesOption === 'function'
			? invalidatesOption(fallbacks?.invalidates, { data: mutation?.data, props: propsFromFn })
			: invalidatesOption ?? fallbacks?.invalidates

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

		await Promise.all(rules.map(async (rule) => {
			const target = typeof rule === 'string' ? rule : rule.target
			const fetcherName = resolveFetcherProps({
				fetcherName: typeof rule === 'string'
					? propsFromFn.fetcherName ?? getFetcherName()
					: rule.fetcherName ?? propsFromFn.fetcherName ?? getFetcherName(),
			}).fetcherName
			const resource = typeof rule === 'string' || !('resource' in rule)
				? propsFromFn.resource ?? getResource()
				: rule.resource

			if (target !== Target.All && resource == null)
				throw new Error(`[@ginjou/core] \`resource\` is required to invalidate ${target} queries.`)

			switch (target) {
				case Target.All:
					await queryClient.invalidateQueries(
						{
							queryKey: [fetcherName],
							...invalidateQueryFilters,
						},
						invalidateOptions,
					)
					break
				case Target.Resource:
					await queryClient.invalidateQueries(
						{
							queryKey: genResourceQueryKey({ props: { fetcherName, resource: resource! } }),
							...invalidateQueryFilters,
						},
						invalidateOptions,
					)
					break
				case Target.List:
					await Promise.all([
						queryClient.invalidateQueries(
							{
								queryKey: genBaseGetListQueryKey({ props: { fetcherName, resource: resource! } }),
								...invalidateQueryFilters,
							},
							invalidateOptions,
						),
						queryClient.invalidateQueries(
							{
								queryKey: genBaseGetInfiniteListQueryKey({ props: { fetcherName, resource: resource! } }),
								...invalidateQueryFilters,
							},
							invalidateOptions,
						),
					])
					break
				case Target.Many: {
					let idsList: RecordKey[][]
					let meta: Meta | undefined
					if (typeof rule === 'string') {
						if (mutation == null)
							throw new Error('[@ginjou/core] Mutation context is required to invalidate `many` queries by string rule. Use `{ target: \'many\', ids }` instead.')

						idsList = resolveManyIdsList(propsFromFn, mutation.data)
						meta = (propsFromFn as MutationProps).meta
					}
					else {
						if (!Array.isArray((rule as RuleForMany).ids))
							throw new Error('[@ginjou/core] `ids` is required to invalidate exact many queries.')

						idsList = [(rule as RuleForMany).ids]
						meta = (rule as RuleForMany).meta
					}

					await Promise.all(idsList.map(ids => queryClient.invalidateQueries(
						{
							queryKey: genGetManyQueryKey({
								props: {
									fetcherName,
									resource: resource!,
									ids,
									meta,
									aggregate: true,
								},
							}),
							...invalidateQueryFilters,
						},
						invalidateOptions,
					)))
					break
				}
				case Target.One: {
					let ids: RecordKey[]
					let meta: Meta | undefined
					if (typeof rule === 'string') {
						if (mutation == null)
							throw new Error('[@ginjou/core] Mutation context is required to invalidate `one` queries by string rule. Use `{ target: \'one\', id }` instead.')

						ids = resolveOneIds(propsFromFn, mutation.data)
						meta = (propsFromFn as MutationProps).meta
					}
					else {
						const id = 'id' in rule ? rule.id : undefined
						const ruleIds = 'ids' in rule ? rule.ids : undefined
						if ((id != null) === Array.isArray(ruleIds))
							throw new Error('[@ginjou/core] Exactly one of `id` or `ids` is required to invalidate one queries.')

						ids = id != null ? [id] : ruleIds!
						meta = (rule as RuleForOne).meta
					}

					await Promise.all(ids.map(id => queryClient.invalidateQueries(
						{
							queryKey: genGetOneQueryKey({
								props: {
									fetcherName,
									resource: resource!,
									id,
									meta,
								},
							}),
							...invalidateQueryFilters,
						},
						invalidateOptions,
					)))
					break
				}
				default:
					throw new Error(`[@ginjou/core] Unsupported invalidate target: ${String(target)}`)
			}
		}))
	}
}

interface MutationProps {
	id?: RecordKey
	ids?: RecordKey[]
	meta?: Meta
}

function getResultData(
	data: unknown,
): unknown {
	return (data as { data?: unknown } | undefined)?.data
}

function getRecordId(
	record: unknown,
): RecordKey | undefined {
	return (record as { id?: RecordKey } | undefined)?.id
}

function resolveManyIdsList(
	props: Props,
	data: unknown,
): RecordKey[][] {
	const { ids } = props as MutationProps
	const records = getResultData(data)

	return [
		ids,
		Array.isArray(records)
			? records.map(getRecordId).filter(id => id != null)
			: undefined,
	].filter(ids => ids != null)
}

function resolveOneIds(
	props: Props,
	data: unknown,
): RecordKey[] {
	const { id, ids } = props as MutationProps
	const records = getResultData(data)

	return [...new Set([
		id,
		...(ids ?? []),
		...(Array.isArray(records) ? records.map(getRecordId) : [getRecordId(records)]),
	].filter(id => id != null))]
}
