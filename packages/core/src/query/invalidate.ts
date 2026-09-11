import type { InvalidateOptions, InvalidateQueryFilters, QueryClient } from '@tanstack/query-core'
import type { Simplify, ValueOf } from 'type-fest'
import type { BaseRecord, CreateManyResult, CreateOneResult, DeleteManyResult, DeleteOneResult, GetManyResult, GetOneResult, Meta, RecordKey, UpdateManyResult, UpdateOneResult } from './fetcher'
import { createBaseQueryKey as genBaseGetInfiniteListQueryKey } from './get-infinite-list'
import { createBaseQueryKey as genBaseGetListQueryKey } from './get-list'
import { createQueryKey as genGetManyQueryKey } from './get-many'
import { createQueryKey as genGetOneQueryKey } from './get-one'

export interface InvalidatesProps {
	invalidates?: Invalidates
}

export interface ResolvedInvalidatesProps {
	invalidates: InvalidateRule[]
}

export function resolveInvalidateProps(
	props: InvalidatesProps,
	defaultValue: readonly InvalidateTargetValues[],
): ResolvedInvalidatesProps {
	const { invalidates } = props

	return {
		invalidates: typeof invalidates === 'function'
			? invalidates(defaultValue)
			: invalidates ?? [...defaultValue],
	}
}

export const InvalidateTarget = {
	All: 'all',
	Resource: 'resource',
	List: 'list',
	Many: 'many',
	One: 'one',
} as const

export type InvalidateTargetValues = ValueOf<typeof InvalidateTarget>

export type InvalidateRuleProps
	= | {
		target: typeof InvalidateTarget.All
		fetcherName?: string
	}
	| {
		target:
			| typeof InvalidateTarget.Resource
			| typeof InvalidateTarget.List
		resource: string
		fetcherName?: string
	}
	| {
		target: typeof InvalidateTarget.Many
		resource: string
		ids: RecordKey[]
		fetcherName?: string
		meta?: Meta
	}
	| Simplify<
		& {
			target: typeof InvalidateTarget.One
			resource: string
			fetcherName?: string
			meta?: Meta
		}
		& (
			| { id: RecordKey }
			| { ids: RecordKey[] }
		)
	>

export type InvalidateRule = InvalidateTargetValues | InvalidateRuleProps

export type Invalidates
	= | InvalidateRule[]
		| ((defaults: readonly InvalidateTargetValues[]) => InvalidateRule[])

export type InvalidateProps = InvalidateRuleProps | InvalidateRuleProps[]

export type InvalidateFn = (props: InvalidateProps) => Promise<void>

export type TriggerInvalidatesProps = Simplify<
	& TriggerInvalidateProps
	& {
		invalidates: InvalidateRule[] | false
	}
>

export async function triggerInvalidates<
	TResult extends BaseRecord,
>(
	props: TriggerInvalidatesProps,
	result:
		| GetOneResult<TResult>
		| GetManyResult<TResult>
		| CreateOneResult<TResult>
		| CreateManyResult<TResult>
		| UpdateOneResult<TResult>
		| UpdateManyResult<TResult>
		| DeleteOneResult<TResult>
		| DeleteManyResult<TResult>
		| undefined,
	queryClient: QueryClient,
): Promise<void> {
	const { invalidates } = props

	if (invalidates === false || !invalidates.length)
		return

	await Promise.all(invalidates.map(rule => triggerInvalidateRule(
		props,
		rule,
		result,
		queryClient,
	)))
}

export async function invalidate(
	props: InvalidateProps,
	queryClient: QueryClient,
): Promise<void> {
	const rules = Array.isArray(props) ? props : [props]

	await Promise.all(rules.map(rule => triggerInvalidateRule(
		{ fetcherName: 'default' },
		rule,
		undefined,
		queryClient,
	)))
}

async function triggerInvalidateRule<
	TResult extends BaseRecord,
>(
	props: TriggerInvalidateProps,
	rule: InvalidateRule,
	result:
		| GetOneResult<TResult>
		| GetManyResult<TResult>
		| CreateOneResult<TResult>
		| CreateManyResult<TResult>
		| UpdateOneResult<TResult>
		| UpdateManyResult<TResult>
		| DeleteOneResult<TResult>
		| DeleteManyResult<TResult>
		| undefined,
	queryClient: QueryClient,
): Promise<void> {
	if (typeof rule === 'string')
		return triggerInvalidate(props as any, rule as any, result as any, queryClient)

	const { invalidateFilters, invalidateOptions } = props
	const { target, ...ruleProps } = rule
	return triggerInvalidate(
		{
			invalidateFilters,
			invalidateOptions,
			...ruleProps,
			fetcherName: ruleProps.fetcherName ?? props.fetcherName,
		} as any,
		target as any,
		undefined,
		queryClient,
	)
}

const DEFAULT_INVALIDATE_FILTERS: InvalidateQueryFilters = {
	type: 'all',
	refetchType: 'active',
}

const DEFAULT_INVALIDATE_OPTIONS: InvalidateOptions = {
	cancelRefetch: false,
}

export interface TriggerInvalidateBaseProps {
	invalidateFilters?: InvalidateQueryFilters
	invalidateOptions?: InvalidateOptions
}

export type TriggerInvalidateAllProps = Simplify<
	& TriggerInvalidateBaseProps
	& {
		fetcherName: string
	}
>

export type TriggerInvalidateResourceProps = Simplify<
	& TriggerInvalidateBaseProps
	& {
		resource?: string
		fetcherName: string
	}
>

export type TriggerInvalidateListProps = Simplify<
	& TriggerInvalidateBaseProps
	& {
		resource: string
		fetcherName: string
	}
>

export type TriggerInvalidateManyProps = Simplify<
	& TriggerInvalidateBaseProps
	& {
		resource: string
		ids: RecordKey[]
		fetcherName: string
		meta?: Meta
	}
>

export type TriggerInvalidateOneProps
	= | Simplify<
		& TriggerInvalidateBaseProps
		& {
			resource: string
			id: RecordKey
			fetcherName: string
			meta?: Meta
		}
	>
	| Simplify<
		& TriggerInvalidateBaseProps
		& {
			resource: string
			ids: RecordKey[]
			fetcherName: string
			meta?: Meta
		}
	>

export type TriggerInvalidateProps
	= | TriggerInvalidateAllProps
		| TriggerInvalidateResourceProps
		| TriggerInvalidateListProps
		| TriggerInvalidateManyProps
		| TriggerInvalidateOneProps

export async function triggerInvalidate(
	props: TriggerInvalidateAllProps,
	target: typeof InvalidateTarget.All,
	result: undefined,
	queryClient: QueryClient,
): Promise<void>

export async function triggerInvalidate(
	props: TriggerInvalidateResourceProps,
	target: typeof InvalidateTarget.Resource,
	result: undefined,
	queryClient: QueryClient,
): Promise<void>

export async function triggerInvalidate(
	props: TriggerInvalidateListProps,
	target: typeof InvalidateTarget.List,
	result: undefined,
	queryClient: QueryClient,
): Promise<void>

export async function triggerInvalidate<
	TResult extends BaseRecord,
>(
	props: TriggerInvalidateManyProps,
	target: typeof InvalidateTarget.Many,
	result:
		| GetManyResult<TResult>
		| CreateManyResult<TResult>
		| UpdateManyResult<TResult>
		| DeleteManyResult<TResult>
		| undefined,
	queryClient: QueryClient,
): Promise<void>

export async function triggerInvalidate<
	TResult extends BaseRecord,
>(
	props: TriggerInvalidateOneProps,
	target: typeof InvalidateTarget.One,
	result:
		| GetOneResult<TResult>
		| GetManyResult<TResult>
		| CreateOneResult<TResult>
		| CreateManyResult<TResult>
		| UpdateOneResult<TResult>
		| UpdateManyResult<TResult>
		| DeleteOneResult<TResult>
		| DeleteManyResult<TResult>
		| undefined,
	queryClient: QueryClient,
): Promise<void>

export async function triggerInvalidate<
	TResult extends BaseRecord,
>(
	props: any,
	target: InvalidateTargetValues,
	result:
		| GetOneResult<TResult>
		| GetManyResult<TResult>
		| CreateOneResult<TResult>
		| CreateManyResult<TResult>
		| UpdateOneResult<TResult>
		| UpdateManyResult<TResult>
		| DeleteOneResult<TResult>
		| DeleteManyResult<TResult>
		| undefined,
	queryClient: QueryClient,
): Promise<void> {
	const invalidateFilters = props.invalidateFilters ?? DEFAULT_INVALIDATE_FILTERS
	const invalidateOptions = props.invalidateOptions ?? DEFAULT_INVALIDATE_OPTIONS

	switch (target) {
		case InvalidateTarget.All:
			await queryClient.invalidateQueries(
				{
					queryKey: [props.fetcherName],
					...invalidateFilters,
				},
				invalidateOptions,
			)
			break
		case InvalidateTarget.List:
			await Promise.all([
				queryClient.invalidateQueries(
					{
						queryKey: genBaseGetListQueryKey({ props }),
						...invalidateFilters,
					},
					invalidateOptions,
				),
				queryClient.invalidateQueries(
					{
						queryKey: genBaseGetInfiniteListQueryKey({ props }),
						...invalidateFilters,
					},
					invalidateOptions,
				),
			])
			break
		case InvalidateTarget.Many: {
			const { resource, ids } = props
			if (resource == null)
				throw new Error('[@ginjou/core] `resource` is required to invalidate many queries.')

			await Promise.all([
				queryClient.invalidateQueries(
					{
						queryKey: genGetManyQueryKey({
							props: {
								...props,
								resource,
								ids,
							},
						}),
						...invalidateFilters,
					},
					invalidateOptions,
				),
				(Array.isArray(result?.data))
				&& queryClient.invalidateQueries(
					{
						queryKey: genGetManyQueryKey({
							props: {
								...props,
								resource,
								ids: result!.data.map(item => item.id),
							},
						}),
					},
					invalidateOptions,
				),
			])

			break
		}
		case InvalidateTarget.Resource: {
			const { resource, fetcherName } = props
			if (resource == null)
				throw new Error('[@ginjou/core] `resource` is required to invalidate resource queries.')

			await queryClient.invalidateQueries(
				{
					queryKey: [
						fetcherName,
						resource,
					],
					...invalidateFilters,
				},
				invalidateOptions,
			)
			break
		}
		case InvalidateTarget.One: {
			const { resource, ...rest } = props
			if (resource == null)
				throw new Error('[@ginjou/core] `resource` is required to invalidate one query.')

			if ('id' in rest && rest.id != null) {
				const ids = new Set([
					rest.id,
					!Array.isArray(result?.data)
						? result?.data.id
						: undefined,
				].filter(id => id != null))

				await Promise.all([...ids].map(id => queryClient.invalidateQueries(
					{
						queryKey: genGetOneQueryKey({
							props: {
								...rest,
								resource,
								id,
							},
						}),
						...invalidateFilters,
					},
					invalidateOptions,
				)))
			}
			else if ('ids' in rest && rest.ids != null) {
				const ids = new Set([
					...rest.ids,
					...(Array.isArray(result?.data)
						? result.data.map(item => item.id)
						: []
					),
				].filter(id => id != null))

				await Promise.all([...ids].map(id => queryClient.invalidateQueries(
					{
						queryKey: genGetOneQueryKey({
							props: {
								...rest,
								resource,
								id,
							},
						}),
						...invalidateFilters,
					},
					invalidateOptions,
				)))
			}
			else {
				await queryClient.invalidateQueries(
					{
						queryKey: genGetOneQueryKey({
							props: {
								...props,
								resource,
							},
						}),
						...invalidateFilters,
					},
					invalidateOptions,
				)
			}

			break
		}
		default:
			break
	}
}
