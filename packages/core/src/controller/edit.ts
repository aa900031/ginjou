import type { SetOptional } from 'type-fest'
import type { BaseRecord, GetOneResult, Meta, MutationModeValues, Params, RecordKey, UpdateOneResult } from '../query'
import type { Props as GetOneProps } from '../query/get-one'
import type {
	MutateAsyncFn as UpdateMutateFn,
	Props as UpdateProps,
} from '../query/update'
import type { Navigate } from '../router'
import type { RedirectOptions } from './redirect-to'
import { MutationMode } from '../query'
import { redirectTo } from './redirect-to'
import * as Resource from './resource'
import * as ResourceAction from './resource-action'

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
		redirect?: RedirectOptions<UpdateOneResult<TMutationData>>
		queryMeta?: Meta
		queryOptions?: GetOneProps<TQueryData, TQueryError, TQueryResultData>['queryOptions']
	},
	| 'resource'
	| 'id'
>

export interface GetIdProps {
	resource: Resource.Resolved | undefined
	idFromProp: RecordKey | undefined
}

export function getId(
	{
		resource,
		idFromProp,
	}: GetIdProps,
): RecordKey | undefined {
	return Resource.getIdForAction({
		resource,
		action: ResourceAction.Type.Edit,
		idFromProp,
	})
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
> = (params: TMutationParams) => Promise<UpdateOneResult<TMutationData>>

export interface SaveFnParams<
	TMutationParams extends Params,
	TMutationData extends BaseRecord,
	TMutationError,
	TQueryResultData extends BaseRecord,
> {
	getId: () => RecordKey | undefined
	getResourceName: () => string | undefined
	getMutationMode: () => MutationModeValues | undefined
	getRedirect: () => RedirectOptions<UpdateOneResult<TMutationData>> | undefined
	getQueryData: () => GetOneResult<TQueryResultData> | undefined
	navigateTo: Navigate.ToFn
	mutateFn: UpdateMutateFn<TMutationData, TMutationError, TMutationParams>
	getWarnUnsavedActive: () => boolean
	setWarnUnsavedActive: (value: boolean) => void
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
		getWarnUnsavedActive,
		setWarnUnsavedActive,
	}: SaveFnParams<TMutationParams, TMutationData, TMutationError, TQueryResultData>,
): SaveFn<TMutationParams, TMutationData> {
	return async function saveFn(params) {
		const mutationMode = getMutationMode()
		const isPessimistic = mutationMode == null || mutationMode === MutationMode.Pessimistic
		const id = getId() ?? params.id
		if (id == null)
			throw new Error('[@ginjou/core] Cannot save edit mutation without an id. Pass an id prop or include id in the mutation params.')

		let oldWarnUnsavedActive: boolean | undefined
		if (!isPessimistic) {
			oldWarnUnsavedActive = getWarnUnsavedActive()
			setWarnUnsavedActive(false)

			setTimeout(() => {
				redirectTo({
					redirect: getRedirect() ?? ResourceAction.Type.Show,
					resource: getResourceName(),
					id,
					data: {
						data: {
							id,
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
					setWarnUnsavedActive(false)

					redirectTo({
						redirect: getRedirect() ?? ResourceAction.Type.Show,
						resource: getResourceName(),
						id: data.data.id,
						data,
						navigateTo,
					})
				}
			},
			onError: () => {
				if (!isPessimistic && oldWarnUnsavedActive != null)
					setWarnUnsavedActive(oldWarnUnsavedActive)
			},
		})
	}
}
