import type { InvalidateOptions, InvalidateQueryFilters, QueryClient } from '@tanstack/query-core'
import type { Simplify, ValueOf } from 'type-fest'
import type { Meta, RecordKey } from './fetcher'
import type { FetcherProps } from './fetchers'
import { createBaseQueryKey as genBaseGetInfiniteListQueryKey } from './get-infinite-list'
import { createBaseQueryKey as genBaseGetListQueryKey } from './get-list'
import { createBaseQueryKey as genBaseGetManyQueryKey, createQueryKey as genGetManyQueryKey } from './get-many'
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

export type RuleOptions = Rule[] | false

export type Props = Simplify<
	& FetcherProps
	& {
		resource?: string
		invalidates?:
			| RuleOptions
			| ((defaults?: RuleOptions) => RuleOptions)
	}
>

export interface Fallbacks {
	invalidates?: RuleOptions
}

export type InvalidatorProps = Simplify<
	& Props
	& {
		invalidateOptions?: InvalidateOptions
		invalidateQueryFilters?: Omit<InvalidateQueryFilters, 'queryKey'>
	}
>

export type Invalidator = (
	props: InvalidatorProps,
	fallbacks?: Fallbacks,
) => Promise<void>

export interface CreateInvalidatorProps {
	getInvalidates: () => Props['invalidates']
	getFetcherName: () => Props['fetcherName']
	getResource: () => Props['resource']
	queryClient: QueryClient
}

const DEFAULT_INVALIDATE_QUERY_FILTERS: InvalidateQueryFilters = {
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
	) {
		const invalidatesOption = propsFromFn.invalidates ?? getInvalidates()

		const invalidates = typeof invalidatesOption === 'function'
			? invalidatesOption(fallbacks?.invalidates)
			: invalidatesOption ?? fallbacks?.invalidates

		if (invalidates == null)
			throw new Error('[@ginjou/core] `invalidates` is required to invalidate queries.')
		if (invalidates === false || invalidates.length === 0)
			return

		const invalidateQueryFilters = propsFromFn.invalidateQueryFilters
			?? DEFAULT_INVALIDATE_QUERY_FILTERS
		const invalidateOptions = propsFromFn.invalidateOptions
			?? DEFAULT_INVALIDATE_OPTIONS

		await Promise.all(invalidates.map(async (rule) => {
			const target = typeof rule === 'string' ? rule : rule.target
			const fetcherName = typeof rule === 'string'
				? propsFromFn.fetcherName ?? getFetcherName() ?? 'default'
				: rule.fetcherName ?? propsFromFn.fetcherName ?? getFetcherName() ?? 'default'
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
				case Target.Many:
					if (typeof rule !== 'string' && !Array.isArray((rule as RuleForMany).ids))
						throw new Error('[@ginjou/core] `ids` is required to invalidate exact many queries.')

					await queryClient.invalidateQueries(
						{
							queryKey: typeof rule === 'string'
								? genBaseGetManyQueryKey({ props: { fetcherName, resource: resource! } })
								: genGetManyQueryKey({
										props: {
											fetcherName,
											resource: resource!,
											ids: (rule as RuleForMany).ids,
											meta: (rule as RuleForMany).meta,
											aggregate: true,
										},
									}),
							...invalidateQueryFilters,
						},
						invalidateOptions,
					)
					break
				case Target.One: {
					if (typeof rule === 'string') {
						await queryClient.invalidateQueries(
							{
								queryKey: [
									...genResourceQueryKey({ props: { fetcherName, resource: resource! } }),
									'getOne',
								],
								...invalidateQueryFilters,
							},
							invalidateOptions,
						)
						break
					}

					const id = 'id' in rule ? rule.id : undefined
					const ids = 'ids' in rule ? rule.ids : undefined
					if ((id != null) === Array.isArray(ids))
						throw new Error('[@ginjou/core] Exactly one of `id` or `ids` is required to invalidate one queries.')

					await Promise.all((id != null ? [id] : ids!).map(id => queryClient.invalidateQueries(
						{
							queryKey: genGetOneQueryKey({
								props: {
									fetcherName,
									resource: resource!,
									id,
									meta: (rule as RuleForOne).meta,
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
