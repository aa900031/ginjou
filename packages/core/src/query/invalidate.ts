import type { InvalidateOptions, InvalidateQueryFilters, QueryClient } from '@tanstack/query-core'
import type { Simplify, ValueOf } from 'type-fest'
import type { BaseRecord, CreateManyResult, CreateOneResult, DeleteManyResult, DeleteOneResult, GetManyResult, GetOneResult, Meta, RecordKey, UpdateManyResult, UpdateOneResult } from './fetcher'
import { createBaseQueryKey as genBaseGetInfiniteListQueryKey } from './get-infinite-list'
import { createBaseQueryKey as genBaseGetListQueryKey } from './get-list'
import { createQueryKey as genGetManyQueryKey } from './get-many'
import { createQueryKey as genGetOneQueryKey } from './get-one'

export interface MutationProps {
	invalidates?: Rules
}

export interface ResolvedMutationProps {
	invalidates: Rule[]
}

export function resolveProps(
	props: MutationProps,
	defaultValue: readonly TargetValues[],
): ResolvedMutationProps {
	const { invalidates } = props

	return {
		invalidates: typeof invalidates === 'function'
			? invalidates(defaultValue)
			: invalidates ?? [...defaultValue],
	}
}

export const Target = {
	All: 'all',
	Resource: 'resource',
	List: 'list',
	Many: 'many',
	One: 'one',
} as const

export type TargetValues = ValueOf<typeof Target>

export type RuleProps
	= | {
		target: typeof Target.All
		fetcherName?: string
	}
	| {
		target:
			| typeof Target.Resource
			| typeof Target.List
		resource: string
		fetcherName?: string
	}
	| {
		target: typeof Target.Many
		resource: string
		ids: RecordKey[]
		fetcherName?: string
		meta?: Meta
	}
	| {
		target: typeof Target.One
		resource: string
		id: RecordKey
		fetcherName?: string
		meta?: Meta
	}

export type Rule = TargetValues | RuleProps

export type Rules
	= | Rule[]
		| ((defaults: readonly TargetValues[]) => Rule[])

export type Props = RuleProps | RuleProps[]

export type Fn = (props: Props) => Promise<void>

export interface CreateFnProps {
	queryClient: QueryClient
}

export function createFn(
	{
		queryClient,
	}: CreateFnProps,
): Fn {
	return async function invalidate(props) {
		const rules = Array.isArray(props) ? props : [props]

		await Promise.all(rules.map(rule => triggerRule(
			{ fetcherName: 'default' },
			rule,
			undefined,
			queryClient,
		)))
	}
}

export type TriggerRulesProps = Simplify<
	& TriggerProps
	& {
		invalidates: Rule[] | false
	}
>

export async function triggerRules<
	TResult extends BaseRecord,
>(
	props: TriggerRulesProps,
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

	await Promise.all(invalidates.map(rule => triggerRule(
		props,
		rule,
		result,
		queryClient,
	)))
}

async function triggerRule<
	TResult extends BaseRecord,
>(
	props: TriggerProps,
	rule: Rule,
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
		return trigger(props as any, rule as any, result as any, queryClient)

	const { invalidateFilters, invalidateOptions } = props
	const { target, ...ruleProps } = rule
	return trigger(
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

export interface TriggerBaseProps {
	invalidateFilters?: InvalidateQueryFilters
	invalidateOptions?: InvalidateOptions
}

export type TriggerAllProps = Simplify<
	& TriggerBaseProps
	& {
		fetcherName: string
	}
>

export type TriggerResourceProps = Simplify<
	& TriggerBaseProps
	& {
		resource?: string
		fetcherName: string
	}
>

export type TriggerListProps = Simplify<
	& TriggerBaseProps
	& {
		resource: string
		fetcherName: string
	}
>

export type TriggerManyProps = Simplify<
	& TriggerBaseProps
	& {
		resource: string
		ids: RecordKey[]
		fetcherName: string
		meta?: Meta
	}
>

export type TriggerOneProps
	= | Simplify<
		& TriggerBaseProps
		& {
			resource: string
			id: RecordKey
			fetcherName: string
			meta?: Meta
		}
	>
	| Simplify<
		& TriggerBaseProps
		& {
			resource: string
			ids: RecordKey[]
			fetcherName: string
			meta?: Meta
		}
	>

export type TriggerProps
	= | TriggerAllProps
		| TriggerResourceProps
		| TriggerListProps
		| TriggerManyProps
		| TriggerOneProps

export async function trigger(
	props: TriggerAllProps,
	target: typeof Target.All,
	result: undefined,
	queryClient: QueryClient,
): Promise<void>

export async function trigger(
	props: TriggerResourceProps,
	target: typeof Target.Resource,
	result: undefined,
	queryClient: QueryClient,
): Promise<void>

export async function trigger(
	props: TriggerListProps,
	target: typeof Target.List,
	result: undefined,
	queryClient: QueryClient,
): Promise<void>

export async function trigger<
	TResult extends BaseRecord,
>(
	props: TriggerManyProps,
	target: typeof Target.Many,
	result:
		| GetManyResult<TResult>
		| CreateManyResult<TResult>
		| UpdateManyResult<TResult>
		| DeleteManyResult<TResult>
		| undefined,
	queryClient: QueryClient,
): Promise<void>

export async function trigger<
	TResult extends BaseRecord,
>(
	props: TriggerOneProps,
	target: typeof Target.One,
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

export async function trigger<
	TResult extends BaseRecord,
>(
	props: any,
	target: TargetValues,
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
		case Target.All:
			await queryClient.invalidateQueries(
				{
					queryKey: [props.fetcherName],
					...invalidateFilters,
				},
				invalidateOptions,
			)
			break
		case Target.List:
			if (props.resource == null)
				throw new Error('[@ginjou/core] `resource` is required to invalidate list queries.')

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
		case Target.Many: {
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
						...invalidateFilters,
					},
					invalidateOptions,
				),
			])

			break
		}
		case Target.Resource: {
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
		case Target.One: {
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
