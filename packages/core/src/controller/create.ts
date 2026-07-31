import type { SetOptional } from 'type-fest'
import type { BaseRecord, CreateOneResult, Params } from '../query'
import type {
	MutateAsyncFn as CreateMutateFn,
	Props as CreateProps,
} from '../query/create'
import type { Navigate } from '../router'
import type { RedirectOptions } from './redirect-to'
import { redirectTo } from './redirect-to'
import * as ResourceAction from './resource-action'

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
		redirect?: RedirectOptions<CreateOneResult<TMutationData>>
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
> = (params: TMutationParams) => Promise<CreateOneResult<TMutationData>>

export interface SaveFnParams<
	TMutationData extends BaseRecord,
	TMutationParams extends Params,
	TMutationError,
> {
	navigateTo: Navigate.ToFn
	getResourceName: () => string | undefined
	getRedirect: () => RedirectOptions<CreateOneResult<TMutationData>> | undefined
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
					redirect: getRedirect() ?? ResourceAction.Type.List,
					resource: getResourceName(),
					id: data.data.id,
					data,
					navigateTo,
				})
			},
		})
	}
}
