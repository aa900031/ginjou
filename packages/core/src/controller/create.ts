import type { SetOptional } from 'type-fest'
import type { BaseRecord, CreateResult, Meta, Params } from '../query'
import type {
	MutateAsyncFn as CreateMutateFn,
	MutationOptionsFromProps as CreateMutationOptionsFromProps,
	MutationProps as CreateMutationProps,
} from '../query/create'
import type { ResourceActionTypeValues } from '../resource'
import type { Navigate } from '../router'
import { ResourceActionType } from '../resource'

export type Props<
	TMutationParams extends Params,
	TMutationData extends BaseRecord,
	TMutationError,
> = SetOptional<
	& Omit<
		CreateMutationProps<TMutationData, TMutationError, TMutationParams>,
		| 'params'
		| 'meta'
	>
	& {
		redirect?:
			| Navigate.ToProps
			| ResourceActionTypeValues
			| ((data: CreateResult<TMutationData>) => Navigate.ToProps | ResourceActionTypeValues)
		mutationMeta?: Meta
		mutationOptions?: CreateMutationOptionsFromProps<TMutationData, TMutationError, TMutationParams>
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
	TMutationParams,
	TMutationData extends BaseRecord,
> = (params: TMutationParams) => Promise<CreateResult<TMutationData>>

export interface SaveFnParams<
	TMutationParams extends Params,
	TMutationData extends BaseRecord,
	TMutationError,
> {
	navigateTo: Navigate.ToFn
	getResourceName: () => string | undefined
	getRedirect: () => Props<TMutationParams, TMutationData, TMutationError>['redirect']
	mutateFn: CreateMutateFn<TMutationData, TMutationError, TMutationParams>
}

export function createSaveFn<
	TMutationParams extends Params,
	TMutationData extends BaseRecord,
	TMutationError,
>(
	{
		navigateTo,
		mutateFn,
		getResourceName,
		getRedirect,
	}: SaveFnParams<TMutationParams, TMutationData, TMutationError>,
): SaveFn<TMutationParams, TMutationData> {
	return async function saveFn(params) {
		return mutateFn({
			params,
		}, {
			onSuccess: (data) => {
				redirectTo(
					navigateTo,
					data,
					{
						resource: getResourceName()!,
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
