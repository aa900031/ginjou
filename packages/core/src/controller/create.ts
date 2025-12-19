import type { SetOptional } from 'type-fest'
import type { BaseRecord, CreateResult, Params } from '../query'
import type {
	MutateAsyncFn as CreateMutateFn,
	Props as CreateProps,
} from '../query/create'
import type { ResourceActionTypeValues } from '../resource'
import type { Navigate } from '../router'
import { ResourceActionType } from '../resource'

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
		redirect?:
			| Navigate.ToProps
			| ResourceActionTypeValues
			| ((data: CreateResult<TMutationData>) => Navigate.ToProps | ResourceActionTypeValues)
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
	getRedirect: () => Props<TMutationData, TMutationParams, TMutationError>['redirect']
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
				redirectTo(
					navigateTo,
					data,
					{
						resource: getResourceName(),
						redirect: getRedirect(),
					},
				)
			},
		})
	}
}

function redirectTo<
	TData extends BaseRecord,
>(
	navigateTo: Navigate.ToFn,
	data: CreateResult<TData>,
	props: {
		resource: string | undefined
		redirect: Props<TData, any, any>['redirect']
	},
) {
	const params = (typeof props.redirect === 'function'
		? props.redirect(data)
		: props.redirect
	) ?? ResourceActionType.List

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
