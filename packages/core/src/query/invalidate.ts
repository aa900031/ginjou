import type { InvalidateOptions, InvalidateQueryFilters, QueryClient } from '@tanstack/query-core'
import type { SetRequired, Simplify, ValueOf } from 'type-fest'
import type { BaseRecord, CreateManyResult, CreateResult, DeleteManyResult, DeleteOneResult, GetManyResult, GetOneResult, RecordKey, UpdateManyResult, UpdateResult } from './fetcher'
import { createQueryKey as genGetListQueryKey } from './get-list'
import { createQueryKey as genGetManyQueryKey } from './get-many'
import { createQueryKey as genGetOneQueryKey } from './get-one'

export interface InvalidatesProps {
	invalidates?: InvalidateTargetType[]
}

export type ResolvedInvalidatesProps = SetRequired<
	InvalidatesProps,
	| 'invalidates'
>

export function resolveInvalidateProps(
	props: InvalidatesProps,
	defaultValue: InvalidateTargetType[],
): ResolvedInvalidatesProps {
	return {
		invalidates: props.invalidates ?? defaultValue,
	}
}

export const InvalidateTarget = {
	All: 'all',
	Resource: 'resource',
	List: 'list',
	Many: 'many',
	One: 'one',
} as const

export type InvalidateTargetType = ValueOf<typeof InvalidateTarget>

export type TriggerInvalidatesProps = Simplify<
	& TriggerInvalidateProps
	& {
		invalidates: InvalidateTargetType[] | false
	}
>

export async function triggerInvalidates<
	TResult extends BaseRecord,
>(
	props: TriggerInvalidatesProps,
	result:
		| GetOneResult<TResult>
		| GetManyResult<TResult>
		| CreateResult<TResult>
		| CreateManyResult<TResult>
		| UpdateResult<TResult>
		| UpdateManyResult<TResult>
		| DeleteOneResult<TResult>
		| DeleteManyResult<TResult>
		| undefined,
	queryClient: QueryClient,
): Promise<void> {
	const { invalidates } = props

	if (invalidates === false || !invalidates.length)
		return

	await Promise.all(invalidates.map(invalidate => triggerInvalidate(
		props as any,
		invalidate as any,
		result,
		queryClient,
	)))
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
	}
>

export type TriggerInvalidateOneProps
	= | Simplify<
		& TriggerInvalidateBaseProps
		& {
			resource: string
			id: RecordKey
			fetcherName: string
		}
	>
	| Simplify<
		& TriggerInvalidateBaseProps
		& {
			resource: string
			ids: RecordKey[]
			fetcherName: string
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
		| CreateResult<TResult>
		| CreateManyResult<TResult>
		| UpdateResult<TResult>
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
	target: InvalidateTargetType,
	result:
		| GetOneResult<TResult>
		| GetManyResult<TResult>
		| CreateResult<TResult>
		| CreateManyResult<TResult>
		| UpdateResult<TResult>
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
					queryKey: props.fetcherName,
					...invalidateFilters,
				},
				invalidateOptions,
			)
			break
		case InvalidateTarget.List:
			await queryClient.invalidateQueries(
				{
					queryKey: genGetListQueryKey({ props }),
					...invalidateFilters,
				},
				invalidateOptions,
			)
			break
		case InvalidateTarget.Many: {
			const { resource, ids } = props
			if (resource == null)
				throw new Error('`resource` is required')

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
				throw new Error('`resource` is required')

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
				throw new Error('`resource` is required')

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
