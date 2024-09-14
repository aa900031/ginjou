import type { SetOptional, SetRequired } from 'type-fest'
import type { BaseRecord, CreateResult, GetOneResult, Meta, UpdateResult } from '../query'
import { MutationMode, getFetcherName } from '../query'
import type { MutateFn as CreateMutateFn, MutationOptionsFromProps as CreateMutationOptionsFromProps, MutationProps as CreateMutationProps } from '../query/create'
import type { MutateFn as UpdateMutateFn, MutationOptionsFromProps as UpdateMutationOptionsFromProps, MutationProps as UpdateMutationProps } from '../query/update'
import type { QueryOptionsFromProps } from '../query/get-one'
import type { ResolvedResource, Resource, ResourceActionForForm, ResourceActionTypeValues } from '../resource'
import { ResourceActionType, getResourceIdentifier } from '../resource'
import type { RouterGoFn } from '../router'
import { createToCreate, createToEdit, createToList, createToShow } from '../router'

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
		redirect?: ResourceActionTypeValues | false
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
		redirect?: ResourceActionTypeValues | false
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
	const resourceName = getResourceIdentifier({
		resource,
		resourceFromProp: props.resource,
	}) ?? '' // TODO: // maybe use undeined?
	const fetcherName = getFetcherName({ resource, fetcherNameFromProp: props.fetcherName })
	switch (action) {
		case 'edit': {
			return {
				...props as ResolvedUpdateProps<TQueryData, TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError>,
				action,
				resource: resourceName,
				id: ('id' in props ? props.id : undefined)
				?? (resource && resource.action === 'edit' ? resource.id : undefined)
				?? '', // TODO: maybe use undeined?
				fetcherName,
			}
		}
		case 'create':
			return {
				...props as ResolvedCreateProps<TMutationParams, TMutationData, TMutationError>,
				action,
				resource: resourceName,
				fetcherName,
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
	go: RouterGoFn
	getResourceContext: () => Resource
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
		go,
		getResourceContext,
		getProps,
		mutateFnForCreate,
		mutateFnForUpdate,
	}: CreateSaveFnParams<TQueryData, TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError>,
): SaveFn<TMutationParams, TMutationData> {
	return async function saveFn(params) {
		const resourceContext = getResourceContext()
		const props = getProps()

		switch (props.action) {
			case 'create': {
				const resolvedProps: ResolvedCreateProps<TMutationParams, TMutationData, TMutationError> = props
				return mutateFnForCreate({
					...resolvedProps,
					params,
					meta: props.mutationMeta,
				}, {
					onSuccess: (data) => {
						dispatchRedirect(go, props as any, resourceContext, data)
					},
				})
			}
			case 'edit': {
				const resolvedProps: ResolvedUpdateProps<TQueryData, TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError> = props
				const isPessimistic = resolvedProps.mutationMode == null || resolvedProps.mutationMode === MutationMode.Pessimistic

				if (!isPessimistic) {
					setTimeout(() => {
						dispatchRedirect(go, props as any, resourceContext, { data: {
							id: props.id,
							...params,
						} })
					}, 0)
				}

				return mutateFnForUpdate({
					...resolvedProps,
					params,
					meta: props.mutationMeta,
				}, {
					onSuccess: (data) => {
						if (isPessimistic)
							dispatchRedirect(go, props as any, resourceContext, data)
					},
				})
			}
			default:
				throw new Error('No')
		}
	}
}

export interface GetRecordParams<
	TQueryResultData extends BaseRecord,
> {
	resolvedProps: ResolvedProps<any, any, any, TQueryResultData, any, any>
	queryResultData: GetOneResult<TQueryResultData> | undefined
}

export function getRecord<
	TQueryResultData extends BaseRecord,
>(
	{
		resolvedProps,
		queryResultData,
	}: GetRecordParams<TQueryResultData>,
): TQueryResultData | undefined {
	if (resolvedProps.action !== 'edit')
		return

	return queryResultData?.data
}

function dispatchRedirect<
	TMutationData extends BaseRecord,
>(
	go: RouterGoFn,
	props: ResolvedProps<any, any, any, any, any, TMutationData>,
	resourceContext: Resource,
	data: UpdateResult<TMutationData> | CreateResult<TMutationData>,
) {
	const actionType = props.redirect
		?? (
			props.action === 'create'
				? ResourceActionType.List
				: props.action === 'edit'
					? ResourceActionType.Show
					: false
		)

	switch (actionType) {
		case ResourceActionType.List:
			return createToList({ resourceContext, go })({
				resource: props.resource,
			})
		case ResourceActionType.Create:
			return createToCreate({ resourceContext, go })({
				resource: props.resource,
			})
		case ResourceActionType.Edit:
			return createToEdit({ resourceContext, go })({
				resource: props.resource,
				id: data.data.id!,
			})
		case ResourceActionType.Show:
			return createToShow({ resourceContext, go })({
				resource: props.resource,
				id: data.data.id!,
			})
	}
}
