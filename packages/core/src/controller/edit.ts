import type { SetOptional } from 'type-fest'
import type { BaseRecord, Meta, MutationModeValues, Params, RecordKey, UpdateResult } from '../query'
import type { QueryOptions as GetOneQueryOptions } from '../query/get-one'
import type {
	MutateAsyncFn as UpdateMutateFn,
	Props as UpdateProps,
} from '../query/update'
import type { ResolvedResource, ResourceActionTypeValues } from '../resource'
import type { Navigate } from '../router'
import { MutationMode } from '../query'
import { ResourceActionType } from '../resource'

export type Props<
	TQueryData extends BaseRecord,
	TMutationParams extends Params,
	TQueryError,
	TQueryResultData extends BaseRecord,
	TMutationData extends BaseRecord,
	TMutationError,
> = SetOptional<
	& Omit<
		UpdateProps<TMutationData, TMutationError, TMutationParams>,
		| 'params'
	>
	& {
		redirect?:
			| Navigate.ToProps
			| ResourceActionTypeValues
			| ((data: UpdateResult<TMutationData>) => Navigate.ToProps | ResourceActionTypeValues)
		queryMeta?: Meta
		queryOptions?: GetOneQueryOptions<TQueryData, TQueryError, TQueryResultData>
	},
	| 'resource'
	| 'id'
>

export interface GetIdProps {
	resource: ResolvedResource | undefined
	idFromProp: RecordKey | undefined
}

export function getId(
	{
		resource,
		idFromProp,
	}: GetIdProps,
): RecordKey {
	return idFromProp
		?? (resource && resource.action === 'edit' ? resource.id : undefined)
		?? '' // TODO: maybe use undeined?
}

export interface GetIsLoadingParams {
	isQueryFetching: boolean
	isUpdatePending: boolean
}

export function getIsLoading(
	{
		isQueryFetching,
		isUpdatePending,
	}: GetIsLoadingParams,
): boolean {
	return isQueryFetching || isUpdatePending
}

export type SaveFn<
	TMutationParams,
	TMutationData extends BaseRecord,
> = (params: TMutationParams) => Promise<UpdateResult<TMutationData>>

export interface SaveFnParams<
	TMutationParams extends Params,
	TMutationData extends BaseRecord,
	TMutationError,
> {
	getId: () => RecordKey
	getResourceName: () => string | undefined
	getMutationMode: () => MutationModeValues | undefined
	getRedirect: () => Props<any, any, any, any, any, any>['redirect'] | undefined
	navigateTo: Navigate.ToFn
	mutateFn: UpdateMutateFn<TMutationData, TMutationError, TMutationParams>
}

export function createSaveFn<
	TMutationParams extends Params,
	TMutationData extends BaseRecord,
	TMutationError,
>(
	{
		getId,
		getResourceName,
		getMutationMode,
		getRedirect,
		navigateTo,
		mutateFn,
	}: SaveFnParams<TMutationParams, TMutationData, TMutationError>,
): SaveFn<TMutationParams, TMutationData> {
	return async function saveFn(params) {
		const mutationMode = getMutationMode()
		const isPessimistic = mutationMode == null || mutationMode === MutationMode.Pessimistic

		if (!isPessimistic) {
			setTimeout(() => {
				redirectTo(
					navigateTo,
					{
						data: { id: getId(), ...params as any } as TMutationData,
					},
					{
						resource: getResourceName(),
						redirect: getRedirect(),
					},
				)
			}, 0)
		}

		return mutateFn({
			params,
		}, {
			onSuccess: (data) => {
				if (isPessimistic) {
					redirectTo(
						navigateTo,
						data,
						{
							resource: getResourceName(),
							redirect: getRedirect(),
						},
					)
				}
			},
		})
	}
}

function redirectTo<
	TData extends BaseRecord,
>(
	navigateTo: Navigate.ToFn,
	data: UpdateResult<TData>,
	props: {
		resource: string | undefined
		redirect: Props<any, any, any, TData, any, any>['redirect']
	},
) {
	const params = (typeof props.redirect === 'function'
		? props.redirect(data)
		: props.redirect
	) ?? ResourceActionType.Show
	switch (params) {
		case ResourceActionType.List:
		case ResourceActionType.Create:
			return navigateTo({
				resource: props.resource,
				action: params,
			})
		case ResourceActionType.Edit:
		case ResourceActionType.Show:
			return navigateTo({
				resource: props.resource,
				action: params,
				id: data.data.id!,
			})
		default:
			return navigateTo(params)
	}
}
