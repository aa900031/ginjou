import type { SetOptional, SetRequired, Simplify } from 'type-fest'
import type { BaseRecord, CreateResult, Meta, UpdateResult } from '../query'
import type { MutateFn as CreateMutateFn, MutationOptionsFromProps as CreateMutationOptionsFromProps, MutationProps as CreateMutationProps } from '../query/create'
import type { MutateFn as UpdateMutateFn, MutationOptionsFromProps as UpdateMutationOptionsFromProps, MutationProps as UpdateMutationProps } from '../query/update'
import type { QueryOptionsFromProps } from '../query/get-one'
import type { ResolvedResource, ResourceActionForForm } from '../resource'

export type CreateProps<
	TMutationParams,
	TMutationData extends BaseRecord,
	TMutationError,
> = SetOptional<
	& Omit<
			CreateMutationProps<TMutationData, TMutationError, TMutationParams>,
			| 'params'
			| 'meta'
		>
	& {
		action: 'create'
		mutationMeta?: Meta
		mutationOptions?: CreateMutationOptionsFromProps<TMutationData, TMutationError, TMutationParams>
	},
	| 'resource'
	| 'action'
>

export type UpdateProps<
	TQueryData extends BaseRecord,
	TMutationParams,
	TQueryError,
	TQueryResultData extends BaseRecord,
	TMutationData extends BaseRecord,
	TMutationError,
> = SetOptional<
	& Omit<
			UpdateMutationProps<TMutationData, TMutationError, TMutationParams>,
			| 'params'
			| 'meta'
		>
	& {
		action: 'edit'
		queryMeta?: Meta
		queryOptions?: QueryOptionsFromProps<TQueryData, TQueryError, TQueryResultData>
		mutationMeta?: Meta
		mutationOptions?: UpdateMutationOptionsFromProps<TMutationData, TMutationError, TMutationParams>
	},
	| 'resource'
	| 'action'
	| 'id'
>

export type Props<
	TQueryData extends BaseRecord,
	TMutationParams,
	TQueryError,
	TQueryResultData extends BaseRecord,
	TMutationData extends BaseRecord,
	TMutationError,
> =
	| CreateProps<TMutationParams, TMutationData, TMutationError>
	| UpdateProps<TQueryData, TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError>

export type ResolvedCreateProps<
	TMutationParams,
	TMutationData extends BaseRecord,
	TMutationError,
> = SetRequired<
	CreateProps<TMutationParams, TMutationData, TMutationError>,
	| 'resource'
	| 'action'
>

export type ResolvedUpdateProps<
	TQueryData extends BaseRecord,
	TMutationParams,
	TQueryError,
	TQueryResultData extends BaseRecord,
	TMutationData extends BaseRecord,
	TMutationError,
> = SetRequired<
	UpdateProps<TQueryData, TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError>,
	| 'resource'
	| 'action'
	| 'id'
>

export type ResolvedProps<
	TQueryData extends BaseRecord,
	TMutationParams,
	TQueryError,
	TQueryResultData extends BaseRecord,
	TMutationData extends BaseRecord,
	TMutationError,
> =
	| ResolvedCreateProps<TMutationParams, TMutationData, TMutationError>
	| ResolvedUpdateProps<TQueryData, TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError>

export interface ResolvePropsParams<
	TQueryData extends BaseRecord,
	TMutationParams,
	TQueryError,
	TQueryResultData extends BaseRecord,
	TMutationData extends BaseRecord,
	TMutationError,
> {
	resource: ResolvedResource | undefined
	props: Props<TQueryData, TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError>
}

export function resolveProps<
	TQueryData extends BaseRecord,
	TMutationParams,
	TQueryError,
	TQueryResultData extends BaseRecord,
	TMutationData extends BaseRecord,
	TMutationError,
>(
	{
		resource,
		props,
	}: ResolvePropsParams<TQueryData, TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError>,
): ResolvedProps<TQueryData, TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError> {
	const action = props.action ?? resource?.action
	const resourceName = props.resource ?? resource?.resource.name ?? '' // TODO: // maybe use undeined?
	switch (action) {
		case 'edit': {
			return {
				...props as ResolvedUpdateProps<TQueryData, TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError>,
				action,
				resource: resourceName,
				id: 'id' in props ? props.id ?? '' : '', // TODO: maybe use undeined?
			}
		}
		case 'create':
			return {
				...props as ResolvedCreateProps<TMutationParams, TMutationData, TMutationError>,
				action,
				resource: resourceName,
			}
		default:
			throw new Error('No')
	}
}
export interface GetIsEnabledQueryParams {
	action: ResourceActionForForm
}

export function getIsEnabledQuery(
	{
		action,
	}: GetIsEnabledQueryParams,
): boolean {
	switch (action) {
		// TODO: clone
		case 'edit':
			return true
		default:
			return false
	}
}

export interface GetIsLoadingParams {
	action: ResourceActionForForm
	isQueryFetching: boolean
	isCreateLoading: boolean
	isUpdateLoading: boolean
}

export function getIsLoading(
	{
		action,
		isQueryFetching,
		isCreateLoading,
		isUpdateLoading,
	}: GetIsLoadingParams,
): boolean {
	switch (action) {
		case 'create':
			return isCreateLoading
		case 'edit':
			return isQueryFetching || isUpdateLoading
		default:
			throw new Error('No')
	}
}

export type SaveFn<
	TMutationParams,
	TMutationData extends BaseRecord,
> =
	| ((params: TMutationParams) => Promise<CreateResult<TMutationData>>)
	| ((params: TMutationParams) => Promise<UpdateResult<TMutationData>>)

export interface CreateSaveFnParams<
	TQueryData extends BaseRecord,
	TMutationParams,
	TQueryError,
	TQueryResultData extends BaseRecord,
	TMutationData extends BaseRecord,
	TMutationError,
> {
	getProps: () => ResolvedProps<TQueryData, TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError>
	mutateFnForCreate: CreateMutateFn<TMutationData, TMutationError, TMutationParams>
	mutateFnForUpdate: UpdateMutateFn<TMutationData, TMutationError, TMutationParams>
}

export function createSaveFn<
	TQueryData extends BaseRecord,
	TMutationParams,
	TQueryError,
	TQueryResultData extends BaseRecord,
	TMutationData extends BaseRecord,
	TMutationError,
>(
	{
		getProps,
		mutateFnForCreate,
		mutateFnForUpdate,
	}: CreateSaveFnParams<TQueryData, TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError>,
): SaveFn<TMutationParams, TMutationData> {
	return async function saveFn(params) {
		const {
			action,
			...rest
		} = getProps()

		switch (action) {
			case 'create':
				return mutateFnForCreate({
					...rest as ResolvedCreateProps<TMutationParams, TMutationData, TMutationError>,
					params,
					meta: rest.mutationMeta,
				})
			case 'edit':
				return mutateFnForUpdate({
					...rest as ResolvedUpdateProps<TQueryData, TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError>,
					params,
					meta: rest.mutationMeta,
				})

			default:
				throw new Error('No')
		}
	}
}
