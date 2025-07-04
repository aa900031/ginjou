import type { SetOptional, SetRequired } from 'type-fest'
import type { BaseRecord, CreateResult, GetOneResult, Meta, UpdateResult } from '../query'
import type { MutateAsyncFn as CreateMutateFn, MutationOptionsFromProps as CreateMutationOptionsFromProps, MutationProps as CreateMutationProps } from '../query/create'
import type { QueryOptions as GetOneQueryOptions } from '../query/get-one'
import type { MutateFn as UpdateMutateFn, MutationOptionsFromProps as UpdateMutationOptionsFromProps, MutationProps as UpdateMutationProps } from '../query/update'
import type { ResolvedResource, ResourceActionForForm, ResourceActionTypeValues } from '../resource'
import type { NavigateToFn, NavigateToProps } from '../router'
import { getFetcherName, MutationMode } from '../query'
import { getResourceIdentifier, ResourceActionType } from '../resource'
import { resolveEnabled } from '../utils/query'

export type RedirectTo<
	TResultData,
> =
	| ResourceActionTypeValues
	| NavigateToProps
	| (
		(data: TResultData) =>
			| ResourceActionTypeValues
			| NavigateToProps
	)

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
		redirect?: RedirectTo<CreateResult<TMutationData>>
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
		redirect?: RedirectTo<UpdateResult<TMutationData>>
		queryMeta?: Meta
		queryOptions?: GetOneQueryOptions<TQueryData, TQueryError, TQueryResultData>
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
	enabled: GetOneQueryOptions<any, unknown, any>['enabled']
}

export function getIsEnabledQuery(
	{
		action,
		enabled,
	}: GetIsEnabledQueryParams,
): boolean {
	return resolveEnabled(
		enabled,
		() => {
			switch (action) {
				// TODO: clone
				case 'edit':
					return true
				default:
					return false
			}
		},
	)
}

export interface GetIsLoadingParams {
	action: ResourceActionForForm
	isQueryFetching: boolean
	isCreatePending: boolean
	isUpdatePending: boolean
}

export function getIsPending(
	{
		action,
		isQueryFetching,
		isCreatePending,
		isUpdatePending,
	}: GetIsLoadingParams,
): boolean {
	switch (action) {
		case 'create':
			return isCreatePending
		case 'edit':
			return isQueryFetching || isUpdatePending
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
	navigateTo: NavigateToFn
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
		navigateTo,
		getProps,
		mutateFnForCreate,
		mutateFnForUpdate,
	}: CreateSaveFnParams<TQueryData, TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError>,
): SaveFn<TMutationParams, TMutationData> {
	return async function saveFn(params) {
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
						dispatchRedirect(
							navigateTo,
							resolvedProps,
							data,
						)
					},
				})
			}
			case 'edit': {
				const resolvedProps: ResolvedUpdateProps<TQueryData, TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError> = props
				const isPessimistic = resolvedProps.mutationMode == null || resolvedProps.mutationMode === MutationMode.Pessimistic

				if (!isPessimistic) {
					setTimeout(() => {
						dispatchRedirect(
							navigateTo,
							resolvedProps,
							{ data: { id: props.id, ...params as any } },
						)
					}, 0)
				}

				return mutateFnForUpdate({
					...resolvedProps,
					params,
					meta: props.mutationMeta,
				}, {
					onSuccess: (data) => {
						if (isPessimistic) {
							dispatchRedirect(
								navigateTo,
								resolvedProps,
								data,
							)
						}
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
	TMutationParams,
>(
	navigateTo: NavigateToFn,
	props: ResolvedProps<any, TMutationParams, any, any, TMutationData, any>,
	data: UpdateResult<TMutationData> | CreateResult<TMutationData>,
) {
	const resolvedRedirectTo = (
		typeof props.redirect === 'function'
			? props.redirect(data)
			: props.redirect
	) ?? (
		props.action === 'create'
			? ResourceActionType.List
			: props.action === 'edit'
				? ResourceActionType.Show
				: false
	)

	const resolvedNavigateProps: NavigateToProps = (() => {
		switch (resolvedRedirectTo) {
			case ResourceActionType.List:
			case ResourceActionType.Create:
				return {
					resource: props.resource,
					action: resolvedRedirectTo,
				}
			case ResourceActionType.Edit:
			case ResourceActionType.Show:
				return {
					resource: props.resource,
					action: resolvedRedirectTo,
					id: data.data.id!,
				}
			default:
				return resolvedRedirectTo
		}
	})()

	return navigateTo(resolvedNavigateProps)
}
