import type { SetOptional } from 'type-fest'
import type { BaseRecord, CreateResult, Meta, Params, RecordKey } from '../query'
import type {
	MutateAsyncFn as CreateMutateFn,
	Props as CreateProps,
} from '../query/create'
import type { Props as GetOneProps } from '../query/get-one'
import type { Navigate } from '../router'
import type { RedirectOptions } from './redirect-to'
import type * as Resource from './resource'
import { createSaveFn as createCreateSaveFn } from './create'

export type Props<
	TQueryData extends BaseRecord,
	TMutationParams extends Params,
	TQueryError,
	TQueryResultData extends BaseRecord,
	TMutationData extends BaseRecord,
	TMutationError,
> = SetOptional<
	& Omit<
		CreateProps<TMutationData, TMutationError, TMutationParams>,
		'params'
	>
	& {
		id: RecordKey
		redirect?: RedirectOptions<CreateResult<TMutationData>>
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
	return idFromProp
		?? (resource && 'action' in resource && resource.action === 'clone' ? resource.id : undefined)
		?? undefined
}

export interface GetIsLoadingParams {
	isQueryFetching: boolean
	isCreatePending: boolean
}

export function getIsLoading(
	{
		isQueryFetching,
		isCreatePending,
	}: GetIsLoadingParams,
): boolean {
	return isQueryFetching || isCreatePending
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
	params: SaveFnParams<TMutationData, TMutationParams, TMutationError>,
): SaveFn<TMutationData, TMutationParams> {
	const save = createCreateSaveFn(params)

	return async function saveFn(mutationParams) {
		if (mutationParams.id != null)
			console.warn('[@ginjou/core] Clone mutation params include an id. The id will be passed to createOne unchanged.')

		return save(mutationParams)
	}
}
