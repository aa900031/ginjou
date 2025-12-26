import type { SetOptional } from 'type-fest'
import type { BaseRecord, GetOneResult, Meta, MutationModeValues, Params, RecordKey, UpdateResult } from '../query'
import type { QueryOptions as GetOneQueryOptions } from '../query/get-one'
import type {
	MutateAsyncFn as UpdateMutateFn,
	Props as UpdateProps,
} from '../query/update'
import type { ResolvedResource } from '../resource'
import type { Navigate } from '../router'
import type { RedirectOptions } from './redirect-to'
import { MutationMode } from '../query'
import { ResourceActionType } from '../resource'
import { redirectTo } from './redirect-to'

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
		redirect?: RedirectOptions<UpdateResult<TMutationData>>
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
	TQueryResultData extends BaseRecord,
> {
	getId: () => RecordKey
	getResourceName: () => string | undefined
	getMutationMode: () => MutationModeValues | undefined
	getRedirect: () => RedirectOptions<UpdateResult<TMutationData>> | undefined
	getQueryData: () => GetOneResult<TQueryResultData> | undefined
	navigateTo: Navigate.ToFn
	mutateFn: UpdateMutateFn<TMutationData, TMutationError, TMutationParams>
}

export function createSaveFn<
	TMutationParams extends Params,
	TMutationData extends BaseRecord,
	TMutationError,
	TQueryResultData extends BaseRecord,
>(
	{
		getId,
		getResourceName,
		getMutationMode,
		getRedirect,
		getQueryData,
		navigateTo,
		mutateFn,
	}: SaveFnParams<TMutationParams, TMutationData, TMutationError, TQueryResultData>,
): SaveFn<TMutationParams, TMutationData> {
	return async function saveFn(params) {
		const mutationMode = getMutationMode()
		const isPessimistic = mutationMode == null || mutationMode === MutationMode.Pessimistic

		if (!isPessimistic) {
			setTimeout(() => {
				redirectTo({
					redirect: getRedirect() ?? ResourceActionType.Show,
					resource: getResourceName(),
					id: getId(),
					data: {
						data: {
							id: getId(),
							...getQueryData(),
							...params as any,
						} as TMutationData,
					},
					navigateTo,
				})
			}, 0)
		}

		return mutateFn({
			params,
		}, {
			onSuccess: (data) => {
				if (isPessimistic) {
					redirectTo({
						redirect: getRedirect() ?? ResourceActionType.Show,
						resource: getResourceName(),
						id: data.data.id,
						data,
						navigateTo,
					})
				}
			},
		})
	}
}
