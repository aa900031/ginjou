import type { SetOptional } from 'type-fest'
import type { BaseRecord, CreateResult, Params } from '../query'
import type {
	MutateAsyncFn as CreateMutateFn,
	Props as CreateProps,
} from '../query/create'
import type { Navigate } from '../router'
import type { RedirectOptions } from './redirect-to'
import { ResourceActionType } from '../resource'
import { redirectTo } from './redirect-to'

export type Props<
	TMutationData extends BaseRecord,
	TMutationParams extends Params,
	TMutationError,
> = SetOptional<
	& Omit<
		CreateProps<TMutationData, TMutationError, TMutationParams>,
		| 'params'
	>
	& {
		redirect?: RedirectOptions<CreateResult<TMutationData>>
	},
	'resource'
>

export interface GetIsLoadingParams {
	isPending: boolean
}

export function getIsLoading(
	{
		isPending,
	}: GetIsLoadingParams,
): boolean {
	return isPending
}

export type SaveFn<
	TMutationData extends BaseRecord,
	TMutationParams,
> = (params: TMutationParams) => Promise<CreateResult<TMutationData>>

export interface SaveFnParams<
	TMutationData extends BaseRecord,
	TMutationParams extends Params,
	TMutationError,
> {
	navigateTo: Navigate.ToFn
	getResourceName: () => string | undefined
	getRedirect: () => RedirectOptions<CreateResult<TMutationData>> | undefined
	mutateFn: CreateMutateFn<TMutationData, TMutationError, TMutationParams>
}

export function createSaveFn<
	TMutationData extends BaseRecord,
	TMutationParams extends Params,
	TMutationError,
>(
	{
		navigateTo,
		mutateFn,
		getResourceName,
		getRedirect,
	}: SaveFnParams<TMutationData, TMutationParams, TMutationError>,
): SaveFn<TMutationData, TMutationParams> {
	return async function saveFn(params) {
		return mutateFn({
			params,
		}, {
			onSuccess: (data) => {
				redirectTo({
					redirect: getRedirect() ?? ResourceActionType.List,
					resource: getResourceName(),
					id: data.data.id,
					data,
					navigateTo,
				})
			},
		})
	}
}
